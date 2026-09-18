# IntelliMart — Complete Frontend Starter

This project is a working frontend flow from registration to the Owner Dashboard.

## Flow

Splash Screen
→ Login
→ Register
→ Registration Success
→ Login
→ Owner Dashboard

## Owner rule

Public registration does NOT expose a role selector.

Every public registration is created as:

role = OWNER

The Owner can then create stores and later assign/invite managers.

## Demo

Email:
owner@intellimart.local

Password:
owner123

## Run

1. Install Node.js 18+.
2. Extract the zip.
3. Open a terminal in the project folder.
4. Run:

npm install
npm run dev

5. Open the localhost URL shown by Vite.

## Important

The current authentication is a localStorage mock so the whole frontend can be tested immediately without a backend.

The code is intentionally separated into:
- src/services/auth.js
- src/services/store.js

When your backend Modul 1 is ready, replace those service functions with fetch/axios calls to your API. The UI and routing can remain largely unchanged.

## Reset local demo

Open browser DevTools Console and run:

localStorage.clear()
location.reload()
