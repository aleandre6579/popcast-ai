from fastapi import FastAPI

from app.analysis.routes import analysis_router
from app.auth.routes import auth_router
from app.users.routes import user_router
from app.db import init_db


app = FastAPI()


@app.on_event("startup")
async def startup_event():
    await init_db()


@app.get("/")
async def root():
    return {"message": "Hello, World!"}


# Include routers
app.include_router(user_router, prefix="/users", tags=["Users"])
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(analysis_router, prefix="/analysis", tags=["Analysis"])
