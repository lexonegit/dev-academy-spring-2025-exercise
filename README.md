# Solita Dev Academy Sprint 2025 Exercise (Leevi Seppälä)

### Electricity statistics app

- Frontend: NodeJS, React + Vite (TypeScript)
- Backend: NodeJS, Fastify (TypeScript)

## Instructions (installing & running locally)

1. **Make sure you already have the provided PostgreSQL database running at `http://localhost:5432` (Docker)**
   - <a href="https://github.com/solita/dev-academy-spring-2025-exercise#instructions-for-running-the-database">If NOT, the instructions are here</a>
2. Running the backend

   1. Open a new terminal and navigate to `backend/`
   2. Run `npm install`
   3. Run `npm start`
   4. Keep the terminal open

3. Running the frontend

   1. Open a new terminal and navigate to `frontend/`
   2. Run `npm install`
   3. Run `npm start`
   4. Keep the terminal open and navigate to `http://localhost:5173`
   5. Test all the features!

In case of any problems, make sure the ports are correctly set (these can be changed in `config.json`, with both the backend and frontend)

## Running the backend service in Docker

This is optional, but you can also run the backend service in a Docker container

1. Open a new terminal, navigate to `backend/`
2. Run `docker compose up --build --renew-anon-volumes -d`
3. After some waiting, the backend should be running at `http://localhost:5555`
4. You can verify this by going to <a href="http://localhost:5555/api/test">http://localhost:5555/api/test</a>

## Project feature description

- Daily statistics list
  - Total electricity production per day (mWh)
  - Total electricity consumption per day (mWh)
  - Average electricity price per day (snt/kWh)
  - Longest consecutive time in hours, when electricity price has been negative, per day
  - Date range limits
  - Sorting by column
  - Pagination
  - Searching by date
  - Filtering
- Single day view
  - Total electricity production per day (mWh)
  - Total electricity consumption per day (mWh)
  - Average electricity price per day (snt/kWh)
  - Hour with the most consumption compared to production
  - Top 3 cheapest hours of the day
  - Electricity production per hour (mWh)
  - Electricity consumption per hour (mWh)
  - Electricity price per hour (snt/kWh)
  - Sorting by column

## What could be improved on this

- The backend should respect the client-sided pagination limits when returning data
- E2E testing
- Layout and styling
