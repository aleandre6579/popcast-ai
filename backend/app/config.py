import os

from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv(dotenv_path="../.env")


class Settings(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore", env_file_encoding="utf-8")

    POSTGRES_HOST: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str


# Default values
POSTGRES_HOST = "localhost"
POSTGRES_USER = "user"
POSTGRES_PASSWORD = "password"
POSTGRES_DB = "database"

settings = Settings(
    POSTGRES_HOST=os.getenv("POSTGRES_HOST", POSTGRES_HOST),
    POSTGRES_USER=os.getenv("POSTGRES_USER", POSTGRES_USER),
    POSTGRES_PASSWORD=os.getenv("POSTGRES_PASSWORD", POSTGRES_PASSWORD),
    POSTGRES_DB=os.getenv("POSTGRES_DB", POSTGRES_DB),
)
