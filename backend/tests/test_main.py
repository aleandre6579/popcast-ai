from fastapi.testclient import TestClient
from main import app  # Replace with the actual file where your FastAPI app is defined

client = TestClient(app)


def test_read_root():
    """Test the root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {
        "message": "Hello, World!"
    }  # Replace with the actual response of your root endpoint
