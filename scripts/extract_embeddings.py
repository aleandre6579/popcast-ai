from pgvector.sqlalchemy import Vector
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv
import librosa
import os
import torch
import laion_clap
from tqdm import tqdm

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
    embedding = Column(Vector(512), nullable=False)

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
    return audio

def get_embeddings(model, audio_paths):
    with torch.no_grad():
        embeddings = model.get_audio_embedding_from_filelist(audio_paths, use_tensor=False)
    return embeddings

def process_and_store_audio_files_in_batches(audio_dir, batch_size=10):
    audio_paths = [os.path.join(audio_dir, filename) for filename in os.listdir(audio_dir) if filename.endswith(".mp3")]

    # Process audio files in batches with progress bar
    for i in tqdm(range(0, len(audio_paths), batch_size), desc="Processing batches"):
        batch_num = i // batch_size + 1
        if batch_num < 490:
            continue
        batch_paths = audio_paths[i:i + batch_size]
        print(f"Processing batch {i // batch_size + 1} with {len(batch_paths)} files...")
        
        try:
            embeddings = get_embeddings(clap_model, batch_paths)
            
            for filepath, embedding in zip(batch_paths, embeddings):
                filename = os.path.basename(filepath)
                _, videoID, _ = split_text_info(filename)
                
                audio_embedding = AudioEmbedding(
                    filename=filename,
                    video_id=videoID,
                    embedding=embedding,
                )
                try:
                    session.add(audio_embedding)
                    session.commit()
                    print(f"Stored embeddings for {filename}.")
                except Exception as e:
                    print(f"Error commiting change to DB for {filename}, batch {i // batch_size + 1}: {e}")
                    session.rollback()
        except Exception as e:
            print(f"Error processing batch {i // batch_size + 1}: {e}")

process_and_store_audio_files_in_batches(AUDIO_DIR, batch_size=50)
session.close()
