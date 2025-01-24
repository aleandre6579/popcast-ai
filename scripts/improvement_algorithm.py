from dotenv import load_dotenv
import os
import psycopg2
from pgvector.psycopg2 import register_vector
import tkinter as tk
from tkinter import Button, Label
import subprocess
import multiprocessing as mp
import json
import librosa
import pandas as pd
import numpy as np
from psycopg2.extras import DictCursor
import laion_clap
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.orm import declarative_base, sessionmaker
from pgvector.sqlalchemy import Vector
import torch

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"  # Suppress TensorFlow logs
import tensorflow as tf
from essentia.standard import (
    MonoLoader,
    TensorflowPredict2D,
    TensorflowPredictEffnetDiscogs,
    TensorflowPredictVGGish,
    Danceability,
    Spectrum,
    FrameCutter,
    Loudness,
    RhythmExtractor2013,
    KeyExtractor,
    Energy,
    TonalExtractor,
    Inharmonicity,
    MFCC,
    OnsetRate,
    SpectralCentroidTime,
    DynamicComplexity,
    SpectralPeaks,
    NoveltyCurve,
    Spectrum,
    BeatsLoudness,
    Beatogram,
    Meter,
    FrameGenerator,
    Windowing,
    MelBands,
)

####
# Constants
####

load_dotenv(dotenv_path="../.env")
load_dotenv()
AUDIO_DIR = os.getenv('DOWNLOAD_FOLDER')
POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD')
DATABASE_URL = f"postgresql://user:{POSTGRES_PASSWORD}@45.149.206.230:5432/popcastdb"
CLAP_MODEL_PATH = "./models/music_audioset_epoch_15_esc_90.14.pt"
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
DOWNLOAD_FOLDER = os.getenv('DOWNLOAD_FOLDER')
CPU_THREADS = int(os.getenv("CPU_THREADS"))
MODELS_PATH = "./models"

DB_CONFIG = {
    "host": '45.149.206.230',
    "dbname": os.getenv('POSTGRES_DB'),
    "user": os.getenv('POSTGRES_USER'),
    "password": os.getenv('POSTGRES_PASSWORD'),
    "port": 5432
}

# Database Connection
conn = psycopg2.connect(**DB_CONFIG)
register_vector(conn)
cursor = conn.cursor(cursor_factory=DictCursor)

# Load Jamendo labels
with open("data/mtg_jamendo_moodtheme-discogs-effnet-1.json", "r") as jamendo_file:
    jamendo_metadata = json.load(jamendo_file)
jamendo_classes = jamendo_metadata["classes"]

with open("data/mtg_jamendo_instrument-discogs-effnet-1.json", "r") as jamendo_file:
    jamendo_instrument_metadata = json.load(jamendo_file)
jamendo_instrument_classes = jamendo_instrument_metadata["classes"]

####
#  DB
####

engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()

Base = declarative_base()

class UserAudio(Base):
    __tablename__ = "user_audio"
    id = Column(Integer, primary_key=True)
    viewcount = Column(Integer, nullable=False)
    embedding = Column(Vector(512), nullable=False)

def get_song(video_id: str):
    song_query = """
        SELECT *
        FROM songs
        WHERE video_id = %s;
    """
    cursor.execute(song_query, (video_id,))
    return cursor.fetchone()

def insert_user_audio(embedding, viewcount) -> UserAudio:
    try:
        new_entry = UserAudio(
            viewcount=viewcount,
            embedding=embedding,
        )
        session.add(new_entry)
        session.commit()
        return new_entry
    except Exception as e:
        session.rollback()
        print(f"Error inserting embedding: {e}")

####
# Essentia Functions
####

def get_mel_bands(audio):
    spectrum = Spectrum()
    frame_generator = FrameGenerator(audio, frameSize=2048, hopSize=1024)
    window = Windowing(type="hann")

    mel_bands = MelBands(numberBands=40)
    mel_band_energies = []

    for frame in frame_generator:
        spec = spectrum(window(frame))
        mel_band_energies.append(mel_bands(spec))

    mel_band_energies = np.array(mel_band_energies)

    return mel_band_energies

def run_essentia_algorithms(audio44k):
    _, mfcc_coeffs = MFCC(inputSize=len(audio44k))(audio44k)
    danceability_score = Danceability()(audio44k)
    loudness_score = Loudness()(audio44k)
    bpm, beat_positions, _, _, _ = RhythmExtractor2013(method="multifeature")(audio44k)
    key, scale, _ = KeyExtractor()(audio44k)
    energy_score = Energy()(audio44k)

    ### Chord Significances
    _, _, _, _, chords, _, _, _, _, _, _, _ = TonalExtractor()(audio44k)
    unique_chords, counts = np.unique(chords, return_counts=True)
    chords_significance = {
        chord: significance for (chord, significance) in zip(unique_chords, counts)
    }

    ### Inharmonicity
    frames = []
    frameCutter = FrameCutter()
    while True:
        frame = frameCutter(audio44k)
        if not len(frame):
            break
        frames.append(frame)

    spectrum_magnitudes = []
    for frame in frames:
        spectrum_magnitudes_frame = Spectrum()(frame)
        spectrum_magnitudes.append(spectrum_magnitudes_frame)
    spectrum_magnitudes = np.array(spectrum_magnitudes).flatten()

    frequencies, magnitudes = SpectralPeaks()(audio44k)
    hnr_score = None
    if len(frequencies) > 0 and frequencies[0]:
        hnr_score = Inharmonicity()(frequencies, magnitudes)
    ###

    onset_rate_score = OnsetRate()(audio44k)
    brightness_score = SpectralCentroidTime()(audio44k)
    dynamic_complexity_score, _ = DynamicComplexity()(audio44k)

    mel_bands = get_mel_bands(audio44k)
    novelty_curve = NoveltyCurve()(mel_bands)
    novelty_score = np.median(np.abs(np.diff(novelty_curve)))

    beats_loudness, beats_loudness_band_ratio = BeatsLoudness(beats=beat_positions)(
        audio44k
    )
    beatogram = Beatogram()(beats_loudness, beats_loudness_band_ratio)
    time_signature = Meter()(beatogram)

    features = {
        "danceability": danceability_score[0],
        "loudness": loudness_score,
        "bpm": bpm,
        "key": key,
        "key_scale": scale,
        "energy": energy_score,
        "chords_significance": chords_significance,
        "inharmonicity": hnr_score,
        "timbre": np.mean(mfcc_coeffs),
        "onset_rate": onset_rate_score[1],
        "brightness": brightness_score,
        "dynamic_complexity": dynamic_complexity_score,
        "novelty": novelty_score,
        "time_signature": time_signature,
    }

    return features

def run_essentia_models(audio44k):
    # Load Essentia models
    discogs_model = TensorflowPredictEffnetDiscogs(
        graphFilename=MODELS_PATH + "/discogs-effnet-bs64-1.pb", output="PartitionedCall:1"
    )
    vggish_model = TensorflowPredictVGGish(
        graphFilename=MODELS_PATH + "/audioset-vggish-3.pb",
        output="model/vggish/embeddings",
    )
    approachability_model = TensorflowPredict2D(
        graphFilename=MODELS_PATH + "/approachability_regression-discogs-effnet-1.pb",
        output="model/Identity",
    )
    engagement_model = TensorflowPredict2D(
        graphFilename=MODELS_PATH + "/engagement_regression-discogs-effnet-1.pb",
        output="model/Identity",
    )
    arousal_valence_model = TensorflowPredict2D(
        graphFilename=MODELS_PATH + "/deam-audioset-vggish-2.pb", output="model/Identity"
    )
    aggressive_model = TensorflowPredict2D(
        graphFilename=MODELS_PATH + "/mood_aggressive-audioset-vggish-1.pb",
        output="model/Softmax",
    )
    happy_model = TensorflowPredict2D(
        graphFilename=MODELS_PATH + "/mood_happy-audioset-vggish-1.pb",
        output="model/Softmax",
    )
    party_model = TensorflowPredict2D(
        graphFilename=MODELS_PATH + "/mood_party-audioset-vggish-1.pb",
        output="model/Softmax",
    )
    relaxed_model = TensorflowPredict2D(
        graphFilename=MODELS_PATH + "/mood_relaxed-audioset-vggish-1.pb",
        output="model/Softmax",
    )
    sad_model = TensorflowPredict2D(
        graphFilename=MODELS_PATH + "/mood_sad-audioset-vggish-1.pb", output="model/Softmax"
    )
    jamendo_model = TensorflowPredict2D(
        graphFilename=MODELS_PATH + "/mtg_jamendo_moodtheme-discogs-effnet-1.pb"
    )
    jamendo_instrument_model = TensorflowPredict2D(
        graphFilename=MODELS_PATH + "/mtg_jamendo_instrument-discogs-effnet-1.pb"
    )
    acoustic_model = TensorflowPredict2D(
        graphFilename=MODELS_PATH + "/mood_acoustic-audioset-vggish-1.pb",
        output="model/Softmax",
    )
    electronic_model = TensorflowPredict2D(
        graphFilename=MODELS_PATH + "/mood_electronic-audioset-vggish-1.pb",
        output="model/Softmax",
    )
    voice_instrumental_model = TensorflowPredict2D(
        graphFilename=MODELS_PATH + "/voice_instrumental-audioset-vggish-1.pb",
        output="model/Softmax",
    )
    gender_model = TensorflowPredict2D(
        graphFilename=MODELS_PATH + "/gender-audioset-vggish-1.pb", output="model/Softmax"
    )
    timbre_model = TensorflowPredict2D(
        graphFilename=MODELS_PATH + "/timbre-discogs-effnet-1.pb", output="model/Softmax"
    )
    reverb_model = TensorflowPredict2D(
        graphFilename=MODELS_PATH + "/nsynth_reverb-discogs-effnet-1.pb",
        output="model/Softmax",
    )

    features = {}

    # Run models
    discogs_embeddings = discogs_model(audio44k)
    vggish_embeddings = vggish_model(audio44k)

    approachability = approachability_model(discogs_embeddings)
    engagement = engagement_model(discogs_embeddings)
    arousal_valence = arousal_valence_model(vggish_embeddings)
    aggressive = aggressive_model(vggish_embeddings)
    happy = happy_model(vggish_embeddings)
    party = party_model(vggish_embeddings)
    relaxed = relaxed_model(vggish_embeddings)
    sad = sad_model(vggish_embeddings)
    jamendo_labels = jamendo_model(discogs_embeddings)
    jamendo_instruments = jamendo_instrument_model(discogs_embeddings)
    acoustic = acoustic_model(vggish_embeddings)
    electronic = electronic_model(vggish_embeddings)
    voice_instrumental = voice_instrumental_model(vggish_embeddings)
    gender = gender_model(vggish_embeddings)
    timbre = timbre_model(discogs_embeddings)
    reverb = reverb_model(discogs_embeddings)

    # Process results into a dictionary
    features["approachability"] = np.median(np.squeeze(approachability))
    features["engagement"] = np.median(np.squeeze(engagement))
    arousal_valence_predictions = np.median(arousal_valence, axis=0)
    features["valence"] = arousal_valence_predictions[0]
    features["arousal"] = arousal_valence_predictions[1]
    features["aggressive"] = np.median(aggressive, axis=0)[0]
    features["happy"] = np.median(happy, axis=0)[0]
    features["party"] = np.median(party, axis=0)[0]
    features["relaxed"] = np.median(relaxed, axis=0)[0]
    features["sad"] = np.median(sad, axis=0)[0]
    jamendo_predictions = np.median(jamendo_labels, axis=0)
    jamendo_dict = {
        jamendo_class: jamendo_value
        for jamendo_class, jamendo_value in zip(jamendo_classes, jamendo_predictions)
    }
    features["jamendo_labels"] = jamendo_dict
    jamendo_instrument_predictions = np.median(jamendo_instruments, axis=0)
    jamendo_instrument_dict = {
        jamendo_class: jamendo_value
        for jamendo_class, jamendo_value in zip(
            jamendo_instrument_classes, jamendo_instrument_predictions
        )
    }
    features["jamendo_instruments"] = jamendo_instrument_dict
    features["acoustic"] = np.median(acoustic, axis=0)[0]
    features["electronic"] = np.median(electronic, axis=0)[0]
    voice_instrumental_predictions = np.median(voice_instrumental, axis=0)
    features["voice"] = voice_instrumental_predictions[0]
    features["instrumental"] = voice_instrumental_predictions[1]
    gender_predictions = np.median(gender, axis=0)
    features["female"] = gender_predictions[0]
    features["male"] = gender_predictions[1]
    timbre_predictions = np.median(timbre, axis=0)
    features["bright"] = timbre_predictions[0]
    features["dark"] = timbre_predictions[1]
    reverb_predictions = np.median(reverb, axis=0)
    features["dry"] = reverb_predictions[0]
    features["wet"] = reverb_predictions[1]
    features["embeddings"] = vggish_embeddings

    return features

def extract_audio_features(audio):
    #audio44k = MonoLoader(filename=audio_file)()
    
    algorithm_features = run_essentia_algorithms(audio)
    model_features = run_essentia_models(audio)
    
    return algorithm_features | model_features

####
#  CLAP Functions
####

def load_clap_model(model_path):
    model = laion_clap.CLAP_Module(enable_fusion=False, device=DEVICE, amodel='HTSAT-base')
    model.load_ckpt('models/music_audioset_epoch_15_esc_90.14.pt')
    return model

clap_model = load_clap_model(CLAP_MODEL_PATH)

def get_clap_embedding(audio):
    audio = audio.reshape(1, -1)
    embedding = clap_model.get_audio_embedding_from_data(x=audio, use_tensor=False)
    return embedding

####
# Other Functions
####

def predict_viewcount(audio) -> int:
    return 100

def get_similar_songs(user_audio: UserAudio, similar_num=10) -> dict:
    similar_songs_query = """
        WITH target_embedding AS (
            SELECT embedding 
            FROM user_audio 
            WHERE id = %s
        )
        SELECT ae.video_id, ae.filename, 
            1 - (ae.embedding <=> (SELECT embedding FROM target_embedding)) AS similarity
        FROM audio_embeddings ae
        ORDER BY similarity DESC
        LIMIT %s;
    """

    try:
        # Fetch similar songs
        cursor.execute(similar_songs_query, (user_audio.id, similar_num))
        similar_songs = [{"video_id": row[0], "filename": row[1], "similarity": row[2]} for row in cursor.fetchall()]

        return similar_songs

    except Exception as e:
        print("Error:", e)
        return None

def get_feature_differences(user_audio_features, video_id: str) -> dict:
    db_features = [
        "danceability_normalized",
        "loudness_normalized",
        "bpm",
        "energy_normalized",
        "inharmonicity_normalized",
        "timbre_normalized",
        "onset_rate",
        "brightness_normalized",
        "dynamic_complexity_normalized",
        "novelty_normalized",
        "approachability_normalized",
        "engagement_normalized",
        "valence_normalized",
        "arousal_normalized",
        "aggressive_normalized",
        "happy_normalized",
        "party_normalized",
        "relaxed_normalized",
        "sad_normalized",
        "acoustic_normalized",
        "electronic_normalized",
        "voice_normalized",
        "instrumental_normalized",
        "female_normalized",
        "male_normalized",
        "bright_normalized",
        "dark_normalized",
        "dry_normalized",
        "wet_normalized",
    ]

    def normalize(value, min_val, max_val):
        return (value - min_val) / (max_val - min_val) if max_val > min_val else 0

    user_audio_features_normalized = {}
    for feature in db_features:
        feature_no_suffix = feature.removesuffix('_normalized')

        if not user_audio_features[feature_no_suffix]:
            continue

        # If feature is not marked as 'normalized', just store the value 
        if 'normalized' not in feature:
            user_audio_features_normalized[feature] = user_audio_features[feature]
            continue

        # Else, normalize it and store the normalized value
        min_max_query = f"""
            SELECT
                MIN({feature_no_suffix}) AS feature_min, MAX({feature_no_suffix}) AS feature_max
            FROM songs;
        """

        cursor.execute(min_max_query)
        min_max_result = cursor.fetchone()
        
        feature_min, feature_max = min_max_result['feature_min'], min_max_result['feature_max']

        feature_normalized = normalize(user_audio_features[feature_no_suffix], feature_min, feature_max)
        user_audio_features_normalized[feature] = feature_normalized

    db_song = get_song(video_id)

    feature_differences = {}
    for feature in user_audio_features_normalized:
        if not user_audio_features_normalized[feature] or not db_song[feature]:
            continue
        feature_differences[feature] = user_audio_features_normalized[feature] - db_song[feature]

    return feature_differences

def improve_audio(audio):
    audio_embedding = get_clap_embedding(audio)
    viewcount = predict_viewcount(audio)
    user_audio = insert_user_audio(audio_embedding[0], viewcount)

    similar_songs = get_similar_songs(user_audio, similar_num=3)
    user_song_features = extract_audio_features(audio)

    similar_songs_features = {}
    for similar_song in similar_songs:
        feature_differences = [get_feature_differences(user_song_features, similar_song['video_id']) for similar_song in similar_songs]
        db_song = get_song(similar_song['video_id'])
        similar_songs_features[similar_song['video_id']] = {'features': db_song, 'feature_differences': feature_differences}
    
    return similar_songs_features

def play_audio(file_path):
    try:
        windows_path = file_path.replace("/mnt/", "").replace("/", ":\\", 1).replace("/", "\\")
        powershell_path = "/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe"
        subprocess.run([powershell_path, "Start-Process", f"'{windows_path}'"], shell=False)
    except Exception as e:
        print(f"Error opening audio: {e}")

def create_audio_player(song_data):
    root = tk.Tk()
    root.title("Song Similarity Player")

    Label(root, text="Original Song", font=("Helvetica", 16)).pack(pady=10)

    original_file_path = os.path.join(DOWNLOAD_FOLDER, song_data["original"]["filename"])
    Label(root, text=f"Original: {song_data['original']['video_id']}").pack()
    Button(root, text="Play Original", command=lambda: play_audio(original_file_path)).pack(pady=5)

    Label(root, text="Top 10 Similar Songs", font=("Helvetica", 16)).pack(pady=10)

    for idx, song in enumerate(song_data["similar_songs"]):
        song_label = f"{idx+1}. {song['video_id']} (Similarity: {song['similarity']:.4f})"
        Label(root, text=song_label).pack()

        file_path = os.path.join(DOWNLOAD_FOLDER, song["filename"])
        Button(root, text="Play", command=lambda path=file_path: play_audio(path)).pack(pady=2)

    root.mainloop()

####
# Main Code
####

video_id = "LlWGt_84jpg"
audio_path = DOWNLOAD_FOLDER + '/0^LlWGt_84jpg^Special Breed.mp3'
audio, _ = librosa.load(audio_path, sr=48000)

similar_songs_features = improve_audio(audio)
print(similar_songs_features)

cursor.close()
conn.close()