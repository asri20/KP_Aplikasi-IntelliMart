# IntelliMart — Frontend ↔ Backend integration (Phase 1)

This version connects the existing login, owner registration, owner dashboard store list,
and Create Store flow to the Node/Express API.

## Run

### Backend
```bat
cd intellimart-backend
npm install
npm run dev
```

Backend: http://localhost:5000

### Frontend
```bat
cd intellimart-complete-frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

## First checks

Open:
- http://localhost:5000/
- http://localhost:5000/api

Then use the frontend:
1. Register Owner.
2. Login with the registered email or the user's full name.
3. Owner Dashboard loads stores from `GET /api/stores`.
4. Create New Store inserts into `tm_store` through `POST /api/stores`.
5. Dashboard reloads the store list from the database.

## Important

The backend package had unresolved Git conflict markers and duplicate imports.
Those are removed in this integration version.

The frontend no longer uses localStorage as the source of truth for auth/stores.
It stores only the JWT/session needed by the UI and calls the backend API for data.

Do not commit `.env`. Copy `.env.example` to `.env` and fill in the database values.
