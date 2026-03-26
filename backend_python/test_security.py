import pytest
from fastapi.testclient import TestClient
from api.routes import database
from main import app

client = TestClient(app)

def test_read_home():
    response = client.get("/")
    assert response.status_code == 200
    assert "Segurança aprimorada" in response.json()["message"]

def test_get_uf_valid():
    response = client.get("/database/uf/SP")
    # if the database is not populated yet, it returns 404, but it passes validation
    assert response.status_code in [200, 404]
    
def test_sql_injection_get_uf():
    # Attempting SQL Injection
    # Pydantic should catch this because sigla_uf is strictly validated (max_length=2, regex=^[A-Z]{2}$)
    response = client.get("/database/uf/SP' OR 1=1;--")
    assert response.status_code == 422 # Unprocessable Entity (Input validation failed)

def test_sql_injection_get_invalid_format():
    response = client.get("/database/uf/123")
    assert response.status_code == 422 # Input validation failed

from unittest.mock import patch

def test_stack_trace_hiding_on_bad_request():
    # Mock SQLite connection to raise an exception unconditionally 
    # and observe if the stack trace leaks
    with patch("sqlite3.connect", side_effect=Exception("ERRO SECRETO DO BANCO!")):
        response = client.get("/database/uf/SP")
    
    # Needs to return 500 error according to the Global Exception Handler
    assert response.status_code == 500
    data = response.json()
    
    # Asserting that the stack trace is HIDDEN from the end user
    assert "ERRO SECRETO DO BANCO" not in str(data)
    assert "detail" in data
    assert data["detail"] == "Erro interno do servidor. Por favor, tente novamente mais tarde."

def test_database_creation_route():
    # We will just test that the schema validation works for the config
    response = client.post("/database/create", json={"force_recreate": "not_a_boolean"})
    assert response.status_code == 422
