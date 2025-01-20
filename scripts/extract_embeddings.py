from pgvector.sqlalchemy import Vector
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv
import librosa
import os
import torch
import laion_clap

# Constants
load_dotenv(dotenv_path="../.env")
load_dotenv()
AUDIO_DIR = os.getenv('DOWNLOAD_FOLDER')
POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD')
DATABASE_URL = f"postgresql://user:{POSTGRES_PASSWORD}@45.149.206.230:5432/popcastdb"
CLAP_MODEL_PATH = "./models/music_audioset_epoch_15_esc_90.14.pt"
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

class CLAPModel(torch.nn.Module):
    def __init__(self):
        super(CLAPModel, self).__init__()
        # Define the layers or architecture here
        pass

    def forward(self, x):
        # Define the forward pass here
        pass

# Database Tables
Base = declarative_base()

class AudioEmbedding(Base):
    __tablename__ = "audio_embeddings"
    id = Column(Integer, primary_key=True)
    video_id = Column(String, unique=True, nullable=False)
    filename = Column(String, unique=True, nullable=False)
    audio = Column(Vector(512), nullable=False)
    vector = Column(Vector(512), nullable=False)


def load_clap_model(model_path):
    model = laion_clap.CLAP_Module(enable_fusion=False, device=DEVICE, amodel='HTSAT-base')
    model.load_ckpt('models/music_audioset_epoch_15_esc_90.14.pt')
    return model

clap_model = load_clap_model(CLAP_MODEL_PATH)


def connect_to_database():
    engine = create_engine(DATABASE_URL)
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    return Session()

session = connect_to_database()


def split_text_info(filepath):
    try:
        base_name = os.path.basename(filepath)
        parts = base_name.split("^")
        if len(parts) != 3:
            raise ValueError("Filename does not match the expected format 'index^videoID^songTitle.mp3'")
        index, videoID, songTitle = parts
        return int(index), videoID, songTitle
    except Exception as e:
        print(f"Error parsing file path '{filepath}': {e}")
        return None, None, None

def preprocess_audio(audio_path, sample_rate=48000):
    audio, sr = librosa.load(audio_path, sr=sample_rate, mono=True)
    if sr != sample_rate:
        raise ValueError(f"Audio sample rate {sr} doesn't match required rate {sample_rate}.")
    audio_tensor = torch.tensor(audio).unsqueeze(0)  # Add batch dimension
    return audio_tensor


def get_embeddings(model, audio_paths):
    print(audio_paths[0])
    with torch.no_grad():
        embeddings = model.get_audio_embedding_from_filelist(audio_paths, use_tensor=False)
    return embeddings


def process_and_store_audio_files(audio_dir):
    for filename in os.listdir(audio_dir):
        if filename.endswith(".mp3"):
            filepath = os.path.join(audio_dir, filename)
            print(f"Processing {filename}...")

            try:
                audio_tensor = preprocess_audio(filepath)
                print("AUDIO TENSOR")
                print(audio_tensor, audio_tensor.shape)
                embeddings = get_embeddings(clap_model, os.listdir(audio_dir))
                print("EMBEDDINGS")
                print(embeddings)
                # Store embeddings in the database
                _, videoID, _ = split_text_info(filepath)
                audio_embedding = AudioEmbedding(
                    filename=filename,
                    videoID=videoID,
                    audio=audio_tensor.tolist(),
                    vector=embeddings.tolist(),
                )
                print("AUDIO EMBEDDING")
                print(audio_embedding)
                return
                session.add(audio_embedding)
                session.commit()
                print(f"Stored embeddings for {filename}.")

            except Exception as e:
                print(f"Error processing {filename}: {e}")


#process_and_store_audio_files(AUDIO_DIR)
embeddings = get_embeddings(clap_model, audio_paths[:2])
print(len(embeddings))
print(embeddings[0], embeddings[0].shape)
session.close()
