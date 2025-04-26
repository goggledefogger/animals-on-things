from fastapi import FastAPI
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

app = FastAPI(
    title="Pets-On-Things API",
    description="API for generating AI images of animals.",
    version="0.1.0",
)

@app.get("/")
def read_root():
    """Root endpoint providing basic API info."""
    return {"message": "Welcome to the Pets-On-Things API!"}

@app.get("/health")
def health_check():
    """Health check endpoint."""
    # In the future, this could check DB connection, AI API status, etc.
    return {"status": "ok"}

# Add other routers/endpoints here later
# from .api import router as api_router
# app.include_router(api_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    # This is for local development running the file directly
    # Production deployment should use a proper ASGI server like Uvicorn or Gunicorn directly
    uvicorn.run(app, host="0.0.0.0", port=8000) 