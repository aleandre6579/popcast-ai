from essentia.standard import (
    TensorflowPredict2D,
    TensorflowPredictEffnetDiscogs,
    TensorflowPredictVGGish,
)


# Load Essentia models
MODELS_PATH = "/backend/models"
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
