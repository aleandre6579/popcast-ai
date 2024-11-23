import os
import numpy as np
import pandas as pd
import time
import multiprocessing as mp
from dotenv import load_dotenv
from tqdm import tqdm
import json
import h5py
from concurrent.futures import ThreadPoolExecutor

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # Suppress TensorFlow logs
import tensorflow as tf

from essentia.standard import (
    MonoLoader,
    TensorflowPredictEffnetDiscogs,
    TensorflowPredictVGGish,
    TensorflowPredict2D
)

# Load environment variables
load_dotenv()
DOWNLOAD_FOLDER = os.getenv('DOWNLOAD_FOLDER')
CPU_THREADS = int(os.getenv('CPU_THREADS'))
MODELS_PATH = './models'

# Load Jamendo labels
with open('data/mtg_jamendo_moodtheme-discogs-effnet-1.json', 'r') as jamendo_file:
    jamendo_metadata = json.load(jamendo_file)
jamendo_classes = jamendo_metadata['classes']

with open('data/mtg_jamendo_instrument-discogs-effnet-1.json', 'r') as jamendo_file:
    jamendo_instrument_metadata = json.load(jamendo_file)
jamendo_instrument_classes = jamendo_instrument_metadata['classes']

songs_data = pd.read_csv('data/songs_data.csv', index_col=0)

# Configure TensorFlow to use GPU efficiently
gpus = tf.config.experimental.list_physical_devices('GPU')
if gpus:
    for gpu in gpus:
        tf.config.experimental.set_memory_growth(gpu, True)

# Load Essentia models
discogs_model = TensorflowPredictEffnetDiscogs(graphFilename=MODELS_PATH + '/discogs-effnet-bs64-1.pb', output="PartitionedCall:1")
vggish_model = TensorflowPredictVGGish(graphFilename=MODELS_PATH + '/audioset-vggish-3.pb', output="model/vggish/embeddings")
approachability_model = TensorflowPredict2D(graphFilename=MODELS_PATH + '/approachability_regression-discogs-effnet-1.pb', output="model/Identity")
engagement_model = TensorflowPredict2D(graphFilename=MODELS_PATH + '/engagement_regression-discogs-effnet-1.pb', output="model/Identity")
arousal_valence_model = TensorflowPredict2D(graphFilename=MODELS_PATH + '/deam-audioset-vggish-2.pb', output="model/Identity")
aggressive_model = TensorflowPredict2D(graphFilename=MODELS_PATH+'/mood_aggressive-audioset-vggish-1.pb', output="model/Softmax")
happy_model = TensorflowPredict2D(graphFilename=MODELS_PATH+'/mood_happy-audioset-vggish-1.pb', output="model/Softmax")
party_model = TensorflowPredict2D(graphFilename=MODELS_PATH+'/mood_party-audioset-vggish-1.pb', output="model/Softmax")
relaxed_model = TensorflowPredict2D(graphFilename=MODELS_PATH+'/mood_relaxed-audioset-vggish-1.pb', output="model/Softmax")
sad_model = TensorflowPredict2D(graphFilename=MODELS_PATH+'/mood_sad-audioset-vggish-1.pb', output="model/Softmax")
jamendo_model = TensorflowPredict2D(graphFilename=MODELS_PATH+'/mtg_jamendo_moodtheme-discogs-effnet-1.pb')
jamendo_instrument_model = TensorflowPredict2D(graphFilename=MODELS_PATH+'/mtg_jamendo_instrument-discogs-effnet-1.pb')
acoustic_model = TensorflowPredict2D(graphFilename=MODELS_PATH+'/mood_acoustic-audioset-vggish-1.pb', output="model/Softmax")
electronic_model = TensorflowPredict2D(graphFilename=MODELS_PATH+'/mood_electronic-audioset-vggish-1.pb', output="model/Softmax")
voice_instrumental_model = TensorflowPredict2D(graphFilename=MODELS_PATH+'/voice_instrumental-audioset-vggish-1.pb', output="model/Softmax")
gender_model = TensorflowPredict2D(graphFilename=MODELS_PATH+'/gender-audioset-vggish-1.pb', output="model/Softmax")
timbre_model = TensorflowPredict2D(graphFilename=MODELS_PATH+'/timbre-discogs-effnet-1.pb', output="model/Softmax")                       
reverb_model = TensorflowPredict2D(graphFilename=MODELS_PATH+'/nsynth_reverb-discogs-effnet-1.pb', output="model/Softmax")
                               
def run_essentia_models(audio16k, audio44k):
    features = {}
    
    # Run models sequentially
    discogs_embeddings = discogs_model(audio16k)
    vggish_embeddings = vggish_model(audio16k)
    
    # Process features sequentially
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

    # Process results into the features dictionary
    features['Approachability'] = np.median(np.squeeze(approachability))
    features['Engagement'] = np.median(np.squeeze(engagement))
    arousal_valence_predictions = np.median(arousal_valence, axis=0)
    features['Valence'] = arousal_valence_predictions[0]
    features['Arousal'] = arousal_valence_predictions[1]
    features['Aggressive'] = np.median(aggressive, axis=0)[0]
    features['Happy'] = np.median(happy, axis=0)[0]
    features['Party'] = np.median(party, axis=0)[0]
    features['Relaxed'] = np.median(relaxed, axis=0)[0]
    features['Sad'] = np.median(sad, axis=0)[0]
    jamendo_predictions = np.median(jamendo_labels, axis=0)
    jamendo_dict = {jamendo_class: jamendo_value for jamendo_class, jamendo_value in zip(jamendo_classes, jamendo_predictions)}
    features['Jamendo Labels'] = jamendo_dict
    jamendo_instrument_predictions = np.median(jamendo_instruments, axis=0)
    jamendo_instrument_dict = {jamendo_class: jamendo_value for jamendo_class, jamendo_value in zip(jamendo_instrument_classes, jamendo_instrument_predictions)}
    features['Jamendo Instruments'] = jamendo_instrument_dict
    features['Acoustic'] = np.median(acoustic, axis=0)[0]
    features['Electronic'] = np.median(electronic, axis=0)[0]
    voice_instrumental_predictions = np.median(voice_instrumental, axis=0)
    features['Voice'] = voice_instrumental_predictions[0]
    features['Instrumental'] = voice_instrumental_predictions[1]
    gender_predictions = np.median(gender, axis=0)
    features['Female'] = gender_predictions[0]
    features['Male'] = gender_predictions[1]
    timbre_predictions = np.median(timbre, axis=0)
    features['Bright'] = timbre_predictions[0]
    features['Dark'] = timbre_predictions[1]
    reverb_predictions = np.median(reverb, axis=0)
    features['Dry'] = reverb_predictions[0]
    features['Wet'] = reverb_predictions[1]
    features['Embeddings'] = vggish_embeddings

    return features

def load_audio_files(song_paths):
    with mp.Pool(processes=CPU_THREADS) as pool:
        audio_data = pool.map(load_audio, song_paths)
    return audio_data

def load_audio(song_path):
    audio16k = MonoLoader(filename=song_path, sampleRate=16000)()
    #audio44k = MonoLoader(filename=song_path, sampleRate=44100)()
    return audio16k

# Class constructed from song path
# Song path must follow this format: /some/path/(int)^(video id)^(title).mp3
#                               e.g  /some/path/0^LlWGt_84jpg^Special Breed.mp3
class SongPath:
    def __init__(self, song_path: str):
        self.path = song_path
        self.filename = os.path.basename(song_path)

        song_filename_split = self.filename.split('^')
        if len(song_filename_split) != 3:
            raise Exception("The song's filename doesn't follow the correct format: /some/path/(int)^(video id)^(title).mp3")
        
        self.index, self.video_id, self.title_with_extension = song_filename_split

        self.index = int(self.index)
        self.title = os.path.splitext(self.title_with_extension)[0]

    def __str__(self):
        return f"Idx: {self.index},  videoID: {self.video_id}, title: {self.title_with_extension}"

def process_song(song_path, audio):
    song = SongPath(song_path)
    song_features = run_essentia_models(audio, audio)
    return song.index, song_features

def aggregate_results(results, embeddings_file):
    for song_index, song_features in results:
        for feature, value in song_features.items():
            # Store embeddings in HDF5
            if feature == "Embeddings":
                song_video_id = songs_data.iloc[song_index]['videoID']
                if str(song_video_id) not in embeddings_file:
                    embeddings_file.create_dataset(song_video_id, data=value, compression="gzip")
            else:
                if feature not in songs_data.columns:
                    songs_data[feature] = np.nan
                    songs_data[feature] = songs_data[feature].astype(object)
                songs_data.at[song_index, feature] = value

def process_songs_in_batches(embeddings_filepath, song_paths, lower, upper, batch_size=10):
    with h5py.File(embeddings_filepath, 'w') as embeddings_file: 
        songs_data_lower, songs_data_upper = [len(song_paths)//48*lower, len(song_paths)//48*upper]
        # songs_data_lower, songs_data_upper = [0, 10]
        total_songs = songs_data_upper - songs_data_lower
        for batch_start in tqdm(range(songs_data_lower, songs_data_upper, batch_size), desc=f"Processing Batches ({lower}, {upper})"):
            batch_end = min(batch_start + batch_size, songs_data_lower + total_songs)
            batch_paths = song_paths[batch_start:batch_end]

            # Load audio for batch
            audio_data = load_audio_files(batch_paths)

            # Process each song in the batch
            for song_path, audio in zip(batch_paths, audio_data):
                result = process_song(song_path, audio)
                aggregate_results([result], embeddings_file)
    return songs_data

song_paths = np.array([os.path.join(DOWNLOAD_FOLDER, song_filename) for song_filename in os.listdir(DOWNLOAD_FOLDER)])
all_bounds = [(lower, upper) for (lower, upper) in zip(range(20, 48, 4), range(24, 52, 4))]

for bounds in all_bounds:
    lower, upper = bounds
    embeddings_filepath = f'/mnt/f/Alex Stuff/Songs/Embeddings/song_embeddings_{lower}_{upper}.h5'
    songs_data_full = process_songs_in_batches(
                                                embeddings_filepath,
                                                song_paths,
                                                lower,
                                                upper,
                                                batch_size=125
                                                )
    songs_data_full.to_csv(f'data/songs_data_models_{lower}_{upper}.csv', index=True)
    songs_data = pd.read_csv('data/songs_data.csv', index_col=0)