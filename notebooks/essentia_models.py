# %% [markdown]
# ## Install/Import Dependencies

# %%
import os
import numpy as np
import pandas as pd
import time
import multiprocessing as mp
from dotenv import load_dotenv
from tqdm import tqdm
import psutil
import tracemalloc
import threading
import json
import h5py

from essentia.standard import (
    MonoLoader,
    TensorflowPredictEffnetDiscogs,
    TensorflowPredictVGGish,
    TensorflowPredict2D
)

# %% [markdown]
# #### Global Constants

# %%
load_dotenv()
DOWNLOAD_FOLDER = os.getenv('DOWNLOAD_FOLDER')
CPU_THREADS = int(os.getenv('CPU_THREADS'))
MODELS_PATH = './models'

# %% [markdown]
# #### Data

# %%
# Get classes for moodtheme predictor model
with open('data/mtg_jamendo_moodtheme-discogs-effnet-1.json', 'r') as jamendo_file:
    jamendo_metadata = json.load(jamendo_file)
jamendo_classes = jamendo_metadata['classes']

# Get classes for instrument predictor model
with open('data/mtg_jamendo_instrument-discogs-effnet-1.json', 'r') as jamendo_file:
    jamendo_instrument_metadata = json.load(jamendo_file)
jamendo_instrument_classes = jamendo_instrument_metadata['classes']

# %%
songs_data = pd.read_csv('data/songs_data.csv', index_col=0)

# %% [markdown]
# #### Util Functions

# %%
def get_total_memory_usage(process):
    memory_summary = {f'Process {process.pid}': process.memory_info().rss / (1024 * 1024)}
    for child in process.children(recursive=True):
        memory_summary = memory_summary | {f'Child Process {child.pid}': child.memory_info().rss / (1024 * 1024)}
    return memory_summary

def print_memory_usage(process):
    print(get_total_memory_usage(process))
    snapshot = tracemalloc.take_snapshot()
    print(f"Top Consumer of Process {process.pid}: {snapshot.statistics('lineno')[0]}")

def monitor_memory_usage(process, kill_thread, interval=120):
    while True:
        try:
            if kill_thread.value:
                print("MONITOR THREAD KILLED")
                return
            print_memory_usage(process)
        except Exception as e:
            print(f"Thread ERROR: {e}")
            return
        time.sleep(interval)

# %% [markdown]
# #### Extract Features Functions

# %%
def run_essentia_models(audio16k, audio44k):
    features = {}
    
    # Get embeddings
    discogs_embeddings = TensorflowPredictEffnetDiscogs(graphFilename=MODELS_PATH+'/discogs-effnet-bs64-1.pb', output="PartitionedCall:1")(audio16k)
    vggish_embeddings = TensorflowPredictVGGish(graphFilename=MODELS_PATH+'/audioset-vggish-3.pb', output="model/vggish/embeddings")(audio16k)

    # Approachability
    approachability_predictions = TensorflowPredict2D(graphFilename=MODELS_PATH+'/approachability_regression-discogs-effnet-1.pb', output="model/Identity")(discogs_embeddings)
    approachability = np.median(np.squeeze(approachability_predictions))
    
    # Engagement
    engagement_predictions = TensorflowPredict2D(graphFilename=MODELS_PATH+'/engagement_regression-discogs-effnet-1.pb', output="model/Identity")(discogs_embeddings)
    engagement = np.median(np.squeeze(engagement_predictions))
    
    # Arousal/Valence
    arousal_valence_predictions = np.median(TensorflowPredict2D(graphFilename=MODELS_PATH+'/deam-audioset-vggish-2.pb', output="model/Identity")(vggish_embeddings), axis=0)
    valence = arousal_valence_predictions[0]
    arousal = arousal_valence_predictions[1]
    
    # Aggressive
    aggressive_predictions = TensorflowPredict2D(graphFilename=MODELS_PATH+'/mood_aggressive-audioset-vggish-1.pb', output="model/Softmax")(vggish_embeddings)
    aggressive = np.median(aggressive_predictions, axis=0)[0]
    
    # Happy
    happy_predictions = TensorflowPredict2D(graphFilename=MODELS_PATH+'/mood_happy-audioset-vggish-1.pb', output="model/Softmax")(vggish_embeddings)
    happy = np.median(happy_predictions, axis=0)[0]
    
    # Party
    party_predictions = TensorflowPredict2D(graphFilename=MODELS_PATH+'/mood_party-audioset-vggish-1.pb', output="model/Softmax")(vggish_embeddings)
    party = np.median(party_predictions, axis=0)[0]
    
    # Relaxed
    relaxed_predictions = TensorflowPredict2D(graphFilename=MODELS_PATH+'/mood_relaxed-audioset-vggish-1.pb', output="model/Softmax")(vggish_embeddings)
    relaxed = np.median(relaxed_predictions, axis=0)[0]
    
    # Sad
    sad_predictions = TensorflowPredict2D(graphFilename=MODELS_PATH+'/mood_sad-audioset-vggish-1.pb', output="model/Softmax")(vggish_embeddings)
    sad = np.median(sad_predictions, axis=0)[0]
    
    # Jamendo labels
    jamendo_predictions = TensorflowPredict2D(graphFilename=MODELS_PATH+'/mtg_jamendo_moodtheme-discogs-effnet-1.pb')(discogs_embeddings)
    jamendo_values = np.median(jamendo_predictions, axis=0)
    jamendo_dict = {jamendo_class:jamendo_value for (jamendo_class, jamendo_value) in zip(jamendo_classes, jamendo_values)}
    
    # Jamendo instrument labels
    jamendo_instrument_predictions = TensorflowPredict2D(graphFilename=MODELS_PATH+'/mtg_jamendo_instrument-discogs-effnet-1.pb')(discogs_embeddings)
    jamendo_instrument_values = np.median(jamendo_instrument_predictions, axis=0)
    jamendo_instrument_dict = {jamendo_class:jamendo_value for (jamendo_class, jamendo_value) in zip(jamendo_instrument_classes, jamendo_instrument_values)}
    
    # Acoustic
    acoustic_predictions = TensorflowPredict2D(graphFilename=MODELS_PATH+'/mood_acoustic-audioset-vggish-1.pb', output="model/Softmax")(vggish_embeddings)
    acoustic = np.median(acoustic_predictions, axis=0)[0]
    
    # Electronic
    electronic_predictions = TensorflowPredict2D(graphFilename=MODELS_PATH+'/mood_electronic-audioset-vggish-1.pb', output="model/Softmax")(vggish_embeddings)
    electronic = np.median(electronic_predictions, axis=0)[0]
    
    # Voice/Instrumental
    voice_instrumental_predictions = np.median(TensorflowPredict2D(graphFilename=MODELS_PATH+'/voice_instrumental-audioset-vggish-1.pb', output="model/Softmax")(vggish_embeddings), axis=0)
    voice = voice_instrumental_predictions[0]
    instrumental = voice_instrumental_predictions[1]
    
    # Gender (Male/Female)
    gender_predictions = np.median(TensorflowPredict2D(graphFilename=MODELS_PATH+'/gender-audioset-vggish-1.pb', output="model/Softmax")(vggish_embeddings), axis=0)
    female = gender_predictions[0]
    male = gender_predictions[1]
    
    # Timbre (Bright/Dark)
    timbre_predictions = np.median(TensorflowPredict2D(graphFilename=MODELS_PATH+'/timbre-discogs-effnet-1.pb', output="model/Softmax")(discogs_embeddings), axis=0)
    bright = timbre_predictions[0]
    dark = timbre_predictions[1]   
    
    # Reverb (Dry/Wet)
    reverb_predictions = np.median(TensorflowPredict2D(graphFilename=MODELS_PATH+'/nsynth_reverb-discogs-effnet-1.pb', output="model/Softmax")(discogs_embeddings), axis=0)
    dry = reverb_predictions[0]
    wet = reverb_predictions[1]
    
    # Return model results
    features = {
        'Embeddings': vggish_embeddings,
        'Approachability': approachability,
        'Engagement': engagement,
        'Valence': valence,
        'Arousal': arousal,
        'Aggressive': aggressive,
        'Happy': happy,
        'Party': party,
        'Relaxed': relaxed,
        'Sad': sad,
        'Jamendo Labels': jamendo_dict,
        'Jamendo Instruments': jamendo_instrument_dict,
        'Acoustic': acoustic,
        'Electronic': electronic,
        'Voice': voice,
        'Instrumental': instrumental,
        'Male': male,
        'Female': female,
        'Bright': bright,
        'Dark': dark,
        'Dry': dry,
        'Wet': wet
    }
    return features

# %%
def extract_audio_features(audio_file):
    # Load the audio file
    audio16k = MonoLoader(filename=audio_file, sampleRate=16000)()
    audio44k = MonoLoader(filename=audio_file)()

    # Run algorithms
    algorithm_features = run_essentia_models(audio44k, audio16k)

    # Merge results
    return algorithm_features

# %% [markdown]
# #### Main Code

# %%
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

# %%
def process_song(song_path):
    song = SongPath(song_path)
    song_features = extract_audio_features(song.path)
    return song.index, song_features

# %%
def process_songs():
    tracemalloc.start()
    
    song_paths = np.array([os.path.join(DOWNLOAD_FOLDER, song_filename) for song_filename in os.listdir(DOWNLOAD_FOLDER)])

    songs_data_lower, songs_data_higher = [len(song_paths)//48*0, len(song_paths)//48*1]
    #songs_data_lower, songs_data_higher = [0, 20]
    song_paths = song_paths[songs_data_lower:songs_data_higher]
    
    hdf5_file_path = 'data/song_embeddings_1.h5'

    with h5py.File(hdf5_file_path, 'w') as hdf5_file:
        with mp.Manager() as manager:
            kill_thread = manager.Value('b', False)

            main_process = psutil.Process(os.getpid())
            memory_thread = threading.Thread(target=monitor_memory_usage, args=(main_process, kill_thread))
            memory_thread.start()
            
            song_results = []
            for song_path in tqdm(song_paths, desc="Processing Songs"):
                processed_song = process_song(song_path)
                song_results.append(processed_song)
                        
            kill_thread.value = True

        # Aggregate results in the pandas dataframe
        songs_data_full = songs_data.copy(deep=True)
        for song_index, song_features in song_results:
            for feature, value in song_features.items():
                if feature == "Embeddings":
                    song_video_id = songs_data_full.iloc[song_index]['videoID']
                    if song_video_id in hdf5_file:
                        print(f"Dataset for {song_video_id} already exists, skipping.")
                        continue
                    hdf5_file.create_dataset(song_video_id, data=value, compression="gzip")
                    continue
                
                if feature not in songs_data_full.columns and isinstance(value, (tuple, set, list, np.ndarray, dict)):
                    songs_data_full[feature] = np.nan
                    songs_data_full[feature] = songs_data_full[feature].astype(object)
                songs_data_full.at[song_index, feature] = value

    return songs_data_full

# %%
songs_data_full = process_songs()
songs_data_full

# %%
print(songs_data_full.dropna(subset=['Approachability']))

# %%
songs_data_full.to_csv('data/songs_data_models_1.csv')

