import io

import librosa
import numpy as np


def convert_mp3_to_spectrogram(audio, sample_rate):
    # Create a mel-spectrogram (frequently used spectrogram for audio analysis)
    spectrogram = librosa.feature.melspectrogram(
        y=audio, sr=sample_rate, n_mels=128, fmax=8000
    )

    # Convert the power spectrogram (amplitude squared) to decibels
    spectrogram_db = librosa.power_to_db(spectrogram, ref=np.max)

    return spectrogram_db, sample_rate


def analyze_audio(file_bytes: bytes) -> dict:
    audio, sr = librosa.load(io.BytesIO(file_bytes), sr=None)
    spectrogram = convert_mp3_to_spectrogram(audio, sr)
    return spectrogram
