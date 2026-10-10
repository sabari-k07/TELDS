# TELDS Testing Plan

## 1. Scope
The testing strategy covers:
1. Core mathematical calculations for energy loss and peak-hour classification.
2. CSV upload validation and error handling.
3. Authentication and Role-Based Access Control.
4. API endpoint contracts and responses.
5. End-to-end integration workflows.

## 2. Backend Automated Tests (Pytest)
Located in `backend/tests/`:
- `test_energy_calculator.py`:
  - Verifies $\Delta \text{ Energy}$ and $\text{Loss } \%$ calculations.
  - Verifies peak hour window matching (19:00 - 22:00).
  - Asserts that normal technical losses (below 6-8%) are not flagged as anomalies.
  - Verifies negative difference detection (consumer meter exceeding input).
- `test_auth.py`:
  - Verifies bcrypt password hashing.
  - Verifies JWT creation, decoding, and role claim verification.

Run tests:
```bash
cd backend
pytest
```

## 3. Frontend Component Tests (Vitest)
Located in `frontend/`:
- Verifies KPICards calculation formatting.
- Verifies CSV uploader drag-and-drop state.
- Verifies Role switcher triggers.

Run tests:
```bash
cd frontend
npm test
```
