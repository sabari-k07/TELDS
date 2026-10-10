import pytest
from app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token

def test_password_hashing_and_verification():
    raw = "testEngineerPassword456"
    hashed = get_password_hash(raw)
    assert hashed != raw
    assert verify_password(raw, hashed) is True
    assert verify_password("wrongPassword", hashed) is False

def test_jwt_token_flow():
    token = create_access_token(subject=42, role="ENGINEER")
    payload = decode_access_token(token)
    assert payload is not None
    assert payload["sub"] == "42"
    assert payload["role"] == "ENGINEER"
