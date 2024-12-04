from fastapi import FastAPI
from app.auth.routes import auth_router
from app.analysis.routes import analysis_router

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

# Include routers
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(analysis_router, prefix="/analysis", tags=["Analysis"])

