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

###
# Constants
###
load_dotenv(dotenv_path="../.env")
load_dotenv()
AUDIO_DIR = os.getenv('DOWNLOAD_FOLDER')
POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD')
DATABASE_URL = f"postgresql://user:{POSTGRES_PASSWORD}@45.149.206.230:5432/popcastdb"
CLAP_MODEL_PATH = "./models/music_audioset_epoch_15_esc_90.14.pt"
DEVICE = "/GPU:0" if tf.config.list_physical_devices('GPU') else "/CPU:0"
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

# Configure TensorFlow to use GPU efficiently
gpus = tf.config.list_physical_devices("GPU")
if gpus:
    for gpu in gpus:
        tf.config.experimental.set_memory_growth(gpu, True)

###
# Essentia Functions
###
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

def extract_audio_features(audio_file):
    audio44k = MonoLoader(filename=audio_file)()
    
    algorithm_features = run_essentia_algorithms(audio44k)
    model_features = run_essentia_models(audio44k)
    
    return algorithm_features | model_features

###
# Other Functions
###
def predict_viewcount(video_id: str) -> int:
    pass

def get_similar_songs(video_id: str) -> dict:
    original_song_query = """
        SELECT video_id, filename 
        FROM audio_embeddings 
        WHERE video_id = %s;
    """
    
    similar_songs_query = """
        WITH target_embedding AS (
            SELECT embedding 
            FROM audio_embeddings 
            WHERE video_id = %s
        )
        SELECT video_id, filename, 
            1 - (embedding <=> (SELECT embedding FROM target_embedding)) AS similarity
        FROM audio_embeddings
        WHERE video_id != %s
        ORDER BY similarity DESC
        LIMIT 10;
    """

    try:
        # Fetch original song details
        cursor.execute(original_song_query, (video_id,))
        original_song = cursor.fetchone()

        # Fetch similar songs
        cursor.execute(similar_songs_query, (video_id, video_id))
        similar_songs = [{"video_id": row[0], "filename": row[1], "similarity": row[2]} for row in cursor.fetchall()]

        return {
            "original": {"video_id": original_song[0], "filename": original_song[1]},
            "similar_songs": similar_songs
        }

    except Exception as e:
        print("Error:", e)
        return None


def get_features(audio) -> dict:
    pass

def get_feature_differences(audio_features, video_id: str) -> dict:
    min_max_query = """
        SELECT 
            MIN(danceability) AS min_danceability, MAX(danceability) AS max_danceability,
            MIN(loudness) AS min_loudness, MAX(loudness) AS max_loudness,
            MIN(energy) AS min_energy, MAX(energy) AS max_energy
        FROM songs;
    """
    cursor.execute(min_max_query)
    min_max_result = cursor.fetchone()
    
    min_danceability, max_danceability = min_max_result['min_danceability'], min_max_result['max_danceability']
    min_loudness, max_loudness = min_max_result['min_loudness'], min_max_result['max_loudness']
    min_energy, max_energy = min_max_result['min_energy'], min_max_result['max_energy']

    def normalize(value, min_val, max_val):
        return (value - min_val) / (max_val - min_val) if max_val > min_val else 0
    
    normalized_features = {
        'danceability': normalize(user_song_features['danceability'], min_danceability, max_danceability),
        'loudness': normalize(user_song_features['loudness'], min_loudness, max_loudness),
        'energy': normalize(user_song_features['energy'], min_energy, max_energy),
    }


    song_query = """
        SELECT *
        FROM songs
        WHERE video_id = %s;
    """
    cursor.execute(song_query, (video_id,))
    song = cursor.fetchone()
    differences = {
        feature: abs(normalized_features[feature] - song[feature+'_normalized'])
        for feature in normalized_features
    }   
    print(f'''
        Danceability: User {normalized_features["danceability"]}, Stored {song["danceability_normalized"]}, Difference {differences["danceability"]}
        Loudness: User {normalized_features["loudness"]}, Stored {song["loudness_normalized"]}, Difference {differences["loudness"]}
        Energy: User {normalized_features["energy"]}, Stored {song["energy_normalized"]}, Difference {differences["energy"]}
    ''')

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


###
# Main Code
###
video_id = "LlWGt_84jpg"
audio_path = DOWNLOAD_FOLDER + '/0^LlWGt_84jpg^Special Breed.mp3'

similar_songs = get_similar_songs(video_id)
if similar_songs and False:
    create_audio_player(similar_songs)

user_song_features = extract_audio_features(audio_path)
[get_feature_differences(user_song_features, similar_song['video_id']) for similar_song in similar_songs['similar_songs']]

cursor.close()
conn.close()