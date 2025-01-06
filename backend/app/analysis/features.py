import io
import json
import librosa
import numpy as np
from app.analysis.models import *
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


with open(
    "/backend/data/mtg_jamendo_moodtheme-discogs-effnet-1.json", "r"
) as jamendo_file:
    jamendo_metadata = json.load(jamendo_file)
jamendo_classes = jamendo_metadata["classes"]

with open(
    "/backend/data/mtg_jamendo_instrument-discogs-effnet-1.json", "r"
) as jamendo_file:
    jamendo_instrument_metadata = json.load(jamendo_file)
jamendo_instrument_classes = jamendo_instrument_metadata["classes"]


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
    features["Approachability"] = np.median(np.squeeze(approachability))
    features["Engagement"] = np.median(np.squeeze(engagement))
    arousal_valence_predictions = np.median(arousal_valence, axis=0)
    features["Valence"] = arousal_valence_predictions[0]
    features["Arousal"] = arousal_valence_predictions[1]
    features["Aggressive"] = np.median(aggressive, axis=0)[0]
    features["Happy"] = np.median(happy, axis=0)[0]
    features["Party"] = np.median(party, axis=0)[0]
    features["Relaxed"] = np.median(relaxed, axis=0)[0]
    features["Sad"] = np.median(sad, axis=0)[0]
    jamendo_predictions = np.median(jamendo_labels, axis=0)
    jamendo_dict = {
        jamendo_class: jamendo_value
        for jamendo_class, jamendo_value in zip(jamendo_classes, jamendo_predictions)
    }
    features["Jamendo Labels"] = jamendo_dict
    jamendo_instrument_predictions = np.median(jamendo_instruments, axis=0)
    jamendo_instrument_dict = {
        jamendo_class: jamendo_value
        for jamendo_class, jamendo_value in zip(
            jamendo_instrument_classes, jamendo_instrument_predictions
        )
    }
    features["Jamendo Instruments"] = jamendo_instrument_dict
    features["Acoustic"] = np.median(acoustic, axis=0)[0]
    features["Electronic"] = np.median(electronic, axis=0)[0]
    voice_instrumental_predictions = np.median(voice_instrumental, axis=0)
    features["Voice"] = voice_instrumental_predictions[0]
    features["Instrumental"] = voice_instrumental_predictions[1]
    gender_predictions = np.median(gender, axis=0)
    features["Female"] = gender_predictions[0]
    features["Male"] = gender_predictions[1]
    timbre_predictions = np.median(timbre, axis=0)
    features["Bright"] = timbre_predictions[0]
    features["Dark"] = timbre_predictions[1]
    reverb_predictions = np.median(reverb, axis=0)
    features["Dry"] = reverb_predictions[0]
    features["Wet"] = reverb_predictions[1]
    features["Embeddings"] = vggish_embeddings

    return features


def run_essentia_algorithms(audio44k, audio16k):
    _, mfcc_coeffs = MFCC(inputSize=len(audio16k))(audio16k)
    danceability_score = Danceability()(audio44k)
    loudness_score = Loudness()(audio16k)
    bpm, beat_positions, _, _, _ = RhythmExtractor2013(method="multifeature")(audio44k)
    key, scale, _ = KeyExtractor()(audio44k)
    energy_score = Energy()(audio16k)

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
    dynamic_complexity_score, _ = DynamicComplexity()(audio16k)

    mel_bands = get_mel_bands(audio44k)
    novelty_curve = NoveltyCurve()(mel_bands)
    novelty_score = np.median(np.abs(np.diff(novelty_curve)))

    beats_loudness, beats_loudness_band_ratio = BeatsLoudness(beats=beat_positions)(
        audio44k
    )
    beatogram = Beatogram()(beats_loudness, beats_loudness_band_ratio)
    time_signature = Meter()(beatogram)

    features = {
        "Danceability": danceability_score[0],
        "Loudness": loudness_score,
        "BPM": bpm,
        "Key": key,
        "Key Scale": scale,
        "Energy": energy_score,
        "Chords Significance": chords_significance,
        "Inharmonicity": hnr_score,
        "Timbre": np.mean(mfcc_coeffs),
        "Onset Rate": onset_rate_score[1],
        "Brightness": brightness_score,
        "Dynamic Complexity": dynamic_complexity_score,
        "Novelty": novelty_score,
        "Time Signature": time_signature,
    }

    return features


def extract_audio_features(audio):
    # Load the audio file
    audio44k = MonoLoader(filename=audio)()
    audio16k = MonoLoader(filename=audio, sampleRate=16000)()
    return "TEST"
    # Run algorithms
    algorithm_features = run_essentia_algorithms(audio44k, audio16k)

    # Merge results
    return algorithm_features
