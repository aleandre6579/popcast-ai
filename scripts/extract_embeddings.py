from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document
from langchain_postgres import PGVector
from langchain_postgres.vectorstores import PGVector

from dotenv import load_dotenv
import os

load_dotenv(dotenv_path="../.env")
db_password = os.getenv('POSTGRES_PASSWORD')

# Encoder model
embeddings = HuggingFaceEmbeddings(model_name="lukewys/laion_clap/music_audioset_epoch_15_esc_90.14.pt")
print("GOT embeddings")

# Postgres connection
connection = f"postgresql+psycopg://user:{db_password}@45.149.206.230:5432/popcastdb"
collection_name = "song_embeddings"

vector_store = PGVector(
    embeddings=embeddings,
    collection_name=collection_name,
    connection=connection,
    use_jsonb=True,
)
