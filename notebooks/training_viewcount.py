import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import torchaudio
from torch.nn.utils.rnn import pack_padded_sequence, pad_sequence

import pandas as pd
import numpy as np
from dotenv import load_dotenv
import os
import random
import librosa

# Global Constants
load_dotenv()
DOWNLOAD_FOLDER = os.getenv("DOWNLOAD_FOLDER")
SAMPLE_RATE = 22050


# Check if CUDA is available
if torch.cuda.is_available():
    DEVICE = "cuda"
else:
    DEVICE = "cpu"
print(f"Using {DEVICE} device")


# Transforms audio signal to mel spectrogram
mel_spectrogram = torchaudio.transforms.MelSpectrogram(
    sample_rate=SAMPLE_RATE, n_fft=1024, hop_length=512, n_mels=128
)

class AudioDataset(Dataset):
    def __init__(self, folder_path, songs_df, input_num=0, sample_rate=22050, n_mels=128):
        self.sample_rate = sample_rate
        self.songs_df = songs_df
        self.n_mels = n_mels
        self.audio_files = [os.path.join(folder_path, f) for f in os.listdir(folder_path) if f.endswith('.mp3')]
        if input_num:
            self.audio_files = random.sample(self.audio_files, input_num)

    def __len__(self):
        return len(self.audio_files)

    def __getitem__(self, idx):
        try:
            # Get mel spectrogram of the audio
            audio_path = self.audio_files[idx]
            audio, _ = librosa.load(audio_path, sr=self.sample_rate)
            mel_spec = librosa.feature.melspectrogram(y=audio, sr=self.sample_rate, n_mels=self.n_mels)
            mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)
            spectrogram = torch.tensor(mel_spec_db, dtype=torch.float32).transpose(0, 1).to(DEVICE)

            # Get the audio's viewcount
            _, videoID, _ = self.split_text_info(audio_path)
            target_viewcount = songs_df[songs_df['videoID'] == videoID]['views'].iloc[0]
            target = torch.tensor(target_viewcount, dtype=torch.float32).to(DEVICE)

            return spectrogram, target
        except Exception as e:
            print(f"ERROR: {e}")

    def split_text_info(self, file_path):
        try:
            base_name = os.path.basename(file_path)
            parts = base_name.split("^")
            if len(parts) != 3:
                raise ValueError("Filename does not match the expected format 'index^videoID^songTitle.mp3'")
            index, videoID, songTitle = parts
            return int(index), videoID, songTitle
        except Exception as e:
            print(f"Error parsing file path '{file_path}': {e}")
            return None, None, None


class LSTM(nn.Module):
    def __init__(self, input_size=128, hidden_size=128, num_layers=2):
        super(LSTM, self).__init__()
        self.lstm = nn.LSTM(input_size=input_size, hidden_size=hidden_size, num_layers=num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, 1)

    def forward(self, x):
        """
        Args:
            x: Mel spectrogram (batch_size, time_steps, n_mels)
        Returns:
            out: Predicted view count (batch_size, 1)
        """
        output, (h_n, c_n) = self.lstm(x)
        last_hidden_state = h_n[-1]  # Shape: (batch_size, hidden_size)
        out = self.fc(last_hidden_state)  # Shape: (batch_size, 1)
        return out


# Training Hyperparameters
EPOCHS = 1
LEARNING_RATE = 1e-3

def train_model(model, dataloader, epochs=10, learning_rate=0.001, use_lengths=False):
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)
    model.train()

    for epoch in range(epochs):
        total_loss = 0
        for spectrogram, target in dataloader:
            print("NEW SONG")
            optimizer.zero_grad()
            output = model(spectrogram)
            loss = criterion(output, target)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
            print("FINISHED SONG")

        print(f"Epoch [{epoch+1}/{epochs}], Loss: {total_loss / len(dataloader):.4f}")

# Model
print("Instatiating LSTM Model...")
lstm = LSTM().to(DEVICE)

print("Instatiating Dataloader...")
songs_df = pd.read_csv('/mnt/d/AlexStuff/songs_data_full.csv', index_col=0)
dataset = AudioDataset(DOWNLOAD_FOLDER, songs_df, input_num=10)
dataloader = DataLoader(dataset, batch_size=1, shuffle=True)

print("Training LSTM Model...")
train_model(lstm, dataloader, epochs=EPOCHS, learning_rate=LEARNING_RATE)


