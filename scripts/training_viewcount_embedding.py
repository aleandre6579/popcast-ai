import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import torchaudio.transforms as transforms
import psycopg2
import pandas as pd
import numpy as np
from dotenv import load_dotenv
import os
from pgvector.psycopg2 import register_vector
from psycopg2.extras import DictCursor
from torch_audiomentations import Compose, Gain, PolarityInversion
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.orm import declarative_base, sessionmaker

# Load environment variables
load_dotenv()
load_dotenv(dotenv_path="../.env")

# Check if CUDA is available
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using {DEVICE} device")

# Database Connection
POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD')
DATABASE_URL = f"postgresql://user:{POSTGRES_PASSWORD}@45.149.206.230:5432/popcastdb"
DB_CONFIG = {
    "host": '45.149.206.230',
    "dbname": os.getenv('POSTGRES_DB'),
    "user": os.getenv('POSTGRES_USER'),
    "password": POSTGRES_PASSWORD,
    "port": 5432
}

db_connection = psycopg2.connect(**DB_CONFIG)
register_vector(db_connection)
cursor = db_connection.cursor(cursor_factory=DictCursor)

engine = create_engine(DATABASE_URL)


# Function to fetch songs data from the database
def fetch_songs_df():
    query = "SELECT video_id, views FROM songs"
    return pd.read_sql(query, engine)

# Function to fetch audio embeddings from the database
def fetch_embedding(video_id):
    try:
        cur = db_connection.cursor()
        cur.execute("SELECT embedding FROM audio_embeddings WHERE video_id = %s", (video_id,))
        result = cur.fetchone()
        if result:
            return np.array(result[0])
        else:
            raise ValueError(f"No embedding found for video ID: {video_id}")
    except Exception as e:
        print(f"Database error: {e}")
        return None

# Define data augmentation transformations
class AudioAugmentations:
    def __init__(self, sample_rate=48100):
        self.sample_rate = sample_rate
        self.transforms = [
            transforms.TimeStretch(),
            transforms.PitchShift(sample_rate, n_steps=2),
            lambda x: x + 0.005 * torch.randn_like(x),
            lambda x: F.convolve(x, torch.randn(1, 1, 4000) * 0.1)  # Simulate reverberation with random impulse response
        ]
    
    def augment(self, audio_tensor):
        augmented_samples = []
        for transform in self.transforms:
            augmented_audio = audio_tensor.clone()
            if torch.rand(1).item() > 0.5:
                augmented_audio = transform(augmented_audio)
        augmented_samples.append(augmented_audio)
        return augmented_samples
    
# Initialize augmentation callable
apply_augmentation = Compose(
    transforms=[
        Gain(
            min_gain_in_db=-15.0,
            max_gain_in_db=5.0,
            p=0.5,
        ),
        PolarityInversion(p=0.5)
    ]
)

audioAugmentations = AudioAugmentations()

# Custom Dataset with Augmentations
class AudioEmbeddingDataset(Dataset):
    def __init__(self, songs_df, augment=False):
        self.songs_df = songs_df
        self.video_ids = songs_df['video_id'].tolist()
        self.view_counts = songs_df['views'].tolist()

    def __len__(self):
        return len(self.video_ids)

    def __getitem__(self, idx):
        video_id = self.video_ids[idx]
        embedding = fetch_embedding(video_id)
        if embedding is None:
            raise ValueError(f"Failed to retrieve embedding for {video_id}")
        embedding_tensor = torch.tensor(embedding, dtype=torch.float32).to(DEVICE)
        targets = [torch.tensor(self.view_counts[idx], dtype=torch.float32).to(DEVICE)]
        embeddings = [embedding_tensor]
        if self.augment:

            apply_augmentation(audio_samples, sample_rate=16000)

            augmented_embeddings = audioAugmentations.augment(embedding_tensor)
            embeddings.extend(augmented_embeddings)
            targets.extend([targets[0]] * len(augmented_embeddings))
        return torch.stack(embeddings), torch.stack(targets)

# LSTM Model
class LSTM(nn.Module):
    def __init__(self, input_size=512, hidden_size=128, num_layers=2):
        super(LSTM, self).__init__()
        self.lstm = nn.LSTM(input_size=input_size, hidden_size=hidden_size, num_layers=num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, 1)

    def forward(self, x):
        output, (h_n, c_n) = self.lstm(x.unsqueeze(1))
        last_hidden_state = h_n[-1]  # Shape: (batch_size, hidden_size)
        out = self.fc(last_hidden_state)  # Shape: (batch_size, 1)
        return out

# Training Function
def train_model(model, dataloader, epochs=10, learning_rate=0.001):
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)
    model.train()

    for epoch in range(epochs):
        total_loss = 0
        for embeddings, targets in dataloader:
            optimizer.zero_grad()
            embeddings = embeddings.view(-1, embeddings.size(-1))
            targets = targets.view(-1, 1)
            output = model(embeddings)
            loss = criterion(output, targets)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
        print(f"Epoch [{epoch+1}/{epochs}], Loss: {total_loss / len(dataloader):.4f}")


audio_path = '/mnt/f/AlexStuff/Songs/0^LlWGt_84jpg^Special Breed.mp3'

# Load data from PostgreSQL
songs_df = fetch_songs_df()

print(songs_df[:20])

dataset = AudioEmbeddingDataset(songs_df, augment=True)
dataloader = DataLoader(dataset, batch_size=50, shuffle=True)

# Instantiate model
lstm = LSTM(input_size=512).to(DEVICE)

# Train the model
train_model(lstm, dataloader, epochs=10, learning_rate=0.001)
