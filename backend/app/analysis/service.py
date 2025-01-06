import io

import librosa
import numpy as np
from app.analysis.features import extract_audio_features

def convert_mp3_to_spectrogram(audio, sample_rate):
    # Create a mel-spectrogram (frequently used spectrogram for audio analysis)
    spectrogram = librosa.feature.melspectrogram(
        y=audio, sr=sample_rate, n_mels=128, fmax=8000
    )

    # Convert the power spectrogram (amplitude squared) to decibels
    spectrogram_db = librosa.power_to_db(spectrogram, ref=np.max)

    return spectrogram_db, sample_rate


def get_similar_songs(audio):
    # Research paper:
    #   Split the user's song into 3 second clips.
    #   Calculate similarity score between each user clip with all clip embeddings
    #       stored in vector database
    #   For each user clip, keep the 10,000 highest similarity scores
    #   Count how many times a song is present in the top similarity scores
    #   Return the top 10 songs with the highest count 
    return None

def analyze_audio(file_bytes: bytes) -> dict:
    audio, sr = librosa.load(io.BytesIO(file_bytes), sr=None)
    #spectrogram = convert_mp3_to_spectrogram(audio, sr)
    audio_features = extract_audio_features(audio)


    return audio_features
