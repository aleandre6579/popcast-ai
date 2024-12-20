from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.config import settings


engine = create_async_engine(settings.DATABASE_URL, echo=True)
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def init_db():
    from app.models import user

    async with engine.begin() as conn:
        await conn.run_sync(user.Base.metadata.create_all)


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
