FROM python:3.11-slim

WORKDIR /backend

# Copy the requirements
COPY requirements.txt /backend

# Install dependencies
RUN pip install -r /backend/requirements.txt

# Expose the port the app runs on
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
