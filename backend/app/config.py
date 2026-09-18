from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg://campusai:campusai_dev_password@localhost:5432/campusai"
    jwt_secret: str = "change-this-in-production"
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 60

    class Config:
        env_file = ".env"

settings = Settings()
