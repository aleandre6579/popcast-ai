from fastapi import FastAPI
from app.auth.routes import auth_router
from app.analysis.routes import analysis_router
from app.db import init_db
from app.routers import user

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    await init_db()

app.include_router(user.router)

@app.get("/")
async def root():
    return {"message": "Welcome to FastAPI with PostgreSQL!"}

# Include routers
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(analysis_router, prefix="/analysis", tags=["Analysis"])

