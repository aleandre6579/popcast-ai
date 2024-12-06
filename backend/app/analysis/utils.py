import io

import librosa


def analyze_audio(file_bytes: bytes) -> dict:
    # Load audio from bytes
    audio, sr = librosa.load(io.BytesIO(file_bytes), sr=None)
    duration = librosa.get_duration(y=audio, sr=sr)
    mfccs = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=13)
    return {"duration": duration, "mfccs": mfccs.mean(axis=1).tolist()}
