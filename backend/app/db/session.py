from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel
from app.core.config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=True, future=True)

async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def get_session() -> AsyncSession:
    async with async_session() as session:
        yield session

from sqlalchemy import text

async def init_db():
    async with engine.begin() as conn:
        # await conn.run_sync(SQLModel.metadata.drop_all) # For dev only, be careful
        await conn.run_sync(SQLModel.metadata.create_all)
        
        # Temporary migration for new column
        try:
            await conn.execute(text("ALTER TABLE taskexecution ADD COLUMN should_notify BOOLEAN DEFAULT FALSE"))
        except Exception:
            pass # Column likely exists
            
        try:
            await conn.execute(text("ALTER TABLE systemconfig ADD COLUMN name VARCHAR(255)"))
        except Exception as e:
            print(f"Migration warning: {e}") # Print error to help debug if it fails again
            
        # Temporary migration for TaskExecution new fields
        try:
            await conn.execute(text("ALTER TABLE taskexecution ADD COLUMN execution_env VARCHAR(255)"))
        except Exception:
            pass
        try:
            await conn.execute(text("ALTER TABLE taskexecution ADD COLUMN suite_stats JSON"))
        except Exception:
            pass
        try:
            await conn.execute(text("ALTER TABLE taskexecution ADD COLUMN triggered_by VARCHAR(255)"))
        except Exception:
            pass
