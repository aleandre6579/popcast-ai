# %% [markdown]
# #### Dependencies

# %%
import os
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
import librosa
import time
import multiprocessing
from dotenv import load_dotenv
from tqdm import tqdm
import sys

from essentia.standard import (
    MonoLoader,
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
    FrameGenerator,
    Windowing,
    MelBands,
    BeatsLoudness,
    Beatogram,
    Meter,
)

# %% [markdown]
# #### Global Constants

# %%
load_dotenv()
DOWNLOAD_FOLDER = os.getenv('DOWNLOAD_FOLDER')
CPU_THREADS = int(os.getenv('CPU_THREADS'))

# %% [markdown]
# #### Data

# %%
songs_data = pd.read_csv('data/songs_final.csv')

# %% [markdown]
# #### Feature Extraction Functions

# %%
def create_spectrogram_image(spectrogram_db, sample_rate):
    plt.figure(figsize=(10, 4))
    librosa.display.specshow(spectrogram_db, sr=sample_rate, x_axis='time', y_axis='mel', fmax=11025)
    plt.colorbar(format='%+2.0f dB')
    plt.title(f"Mel-Spectrogram")
    plt.tight_layout()
    plt.show()
    plt.close()

# %%
def mp3_to_spectrogram(audio_path, sample_rate, create_image=False):
    try:
        mp3, _ = librosa.load(audio_path, sr=sample_rate)
        spectrogram = librosa.feature.melspectrogram(y=mp3, sr=sample_rate, n_mels=128, fmax=11025)
        spectrogram_db = librosa.power_to_db(spectrogram, ref=np.max)

        if create_image:
            create_spectrogram_image(spectrogram_db, sample_rate)
    except Exception as e:
        print(f"ERROR 4: {e}")
    return spectrogram_db

# %%
def get_mel_bands(audio):
    try:
        spectrum = Spectrum()
        frame_generator = FrameGenerator(audio, frameSize=2048, hopSize=1024)
        window = Windowing(type='hann')

        mel_bands = MelBands(numberBands=40)
        mel_band_energies = []

        for frame in frame_generator:
            spec = spectrum(window(frame))
            mel_band_energies.append(mel_bands(spec))

        mel_band_energies = np.array(mel_band_energies)
    except Exception as e:
        print(f"ERROR 3: {e}")
    return mel_band_energies

# %%
def run_essentia_algorithms(audio44k, audio16k):
    try:
        _, mfcc_coeffs = MFCC(inputSize=len(audio16k))(audio16k)
        danceability_score = Danceability()(audio44k)
        loudness_score = Loudness()(audio16k)
        bpm, beat_positions, _, _, _ = RhythmExtractor2013(method="multifeature")(audio44k)
        key, scale, _ = KeyExtractor()(audio44k)
        energy_score = Energy()(audio16k)

        ### Chord Significances
        _, _, _, _, chords, _, _, _, _, _, _, _ = TonalExtractor()(audio44k)
        unique_chords, counts = np.unique(chords, return_counts=True)
        chords_significance = {chord: significance for (chord, significance) in zip(unique_chords, counts)}

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
        if frequencies[0]: 
            hnr_score = Inharmonicity()(frequencies, magnitudes)
        ###
        
        onset_rate_score = OnsetRate()(audio44k)
        brightness_score = SpectralCentroidTime()(audio44k)
        dynamic_complexity_score, _ = DynamicComplexity()(audio16k)
        
        mel_bands = get_mel_bands(audio44k)
        novelty_curve = NoveltyCurve()(mel_bands)
        novelty_score = np.median(np.abs(np.diff(novelty_curve)))
        
        beats_loudness, beats_loudness_band_ratio = BeatsLoudness(beats=beat_positions)(audio44k)
        beatogram = Beatogram()(beats_loudness, beats_loudness_band_ratio)
        time_signature = Meter()(beatogram)
    except Exception as e:
        print(f"ERROR 1: {e}")
    
    features = {
        'Danceability': danceability_score[0],
        'Loudness': loudness_score,
        'BPM': bpm,
        'Key': key,
        'Key Scale': scale,
        'Energy': energy_score,
        'Chords Significance': chords_significance,
        'Inharmonicity': hnr_score,
        'Timbre': np.mean(mfcc_coeffs),
        'Onset Rate': onset_rate_score[1],
        'Brightness': brightness_score,
        'Dynamic Complexity': dynamic_complexity_score,
        'Novelty': novelty_score,
        'Time Signature': time_signature,
    }
    return features

# %%
def extract_audio_features(audio_file):
    try:
        # Load the audio file
        audio44k = MonoLoader(filename=audio_file)()
        audio16k = MonoLoader(filename=audio_file, sampleRate=16000)()

        # Run algorithms
        algorithm_features = run_essentia_algorithms(audio44k, audio16k)
        spectrogram = mp3_to_spectrogram(audio_file, 22050)
    except Exception as e:
        print(f"ERROR 2: {e}")

    # Merge results
    return algorithm_features | {'Spectrogram': spectrogram}

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
    try:
        song = SongPath(song_path)
        song_features = extract_audio_features(song.path)
    except Exception as e:
        print(f"ERROR 5: {e}")
    return song.index, song_features

# %%
def process_songs():
    try:
        song_paths = [os.path.join(DOWNLOAD_FOLDER, song_filename) for song_filename in os.listdir(DOWNLOAD_FOLDER)]

        songs_data_lower, songs_data_higher = [0, len(songs_data)//6]
        song_paths = song_paths[songs_data_lower:songs_data_higher]
        
        with multiprocessing.Pool(CPU_THREADS) as pool:
            results = list(tqdm(pool.imap(process_song, song_paths), total=len(song_paths)))

        # Aggregate results in the pandas dataframe
        songs_data_full = songs_data.copy(deep=True)
        for song_index, song_features in results:
            for feature, value in song_features.items():
                if feature not in songs_data_full.columns and isinstance(value, (tuple, set, list, np.ndarray, dict)):
                    songs_data_full[feature] = np.nan
                    songs_data_full[feature] = songs_data_full[feature].astype(object)
                songs_data_full.at[song_index, feature] = value
    except Exception as e:
        print(f"ERROR 6: {e}")
    return songs_data_full

# %%
songs_data_full = process_songs()
songs_data_full

# %%
songs_data_full.to_csv('data/songs_data_full_1.csv', index=True)

# %%
import IPython
IPython.display.Audio("/mnt/f/Alex Stuff/Songs/100445^jZ4KXPkHjh8^25 Lighters.mp3")


