# dev-academy-spring-2025-exercise (Leevi Seppälä)

### Electricity statistics app

- Frontend: NodeJS, React + Vite (TypeScript)
- Backend: NodeJS, Fastify (TypeScript)

## Instructions (installing & running locally)

1. ### Make sure you already have the provided PostgreSQL database running at `http://localhost:5432` (Docker)
   - <a href="https://github.com/solita/dev-academy-spring-2025-exercise#instructions-for-running-the-database" target="_blank">IF NOT, then you can find the instructions here</a>
2. Running the backend

   - Open a new terminal and navigate to `backend/`
   - Install dependencies with `npm install`
   - Run the application with `npm start`
   - Keep the terminal open

3. Running the frontend
   - Open a new terminal and navigate to `frontend/`
   - Install dependencies with `npm install`
   - Run the application with `npm start`
   - Keep the terminal open and navigate to <a href="http://localhost:4173" target="_blank">http://localhost:4173</a>
   - Test all the features!

In case of any problems, make sure the ports are correctly set. These can be changed in `config.json` (with both the backend and the frontend)

## Running the backend with Docker

This is optional, but you can also run the backend in a Docker container

1. Open a new terminal, navigate to `backend/`
2. Build Docker image and run it as a container with `docker compose up --build -d`
3. After some waiting, the backend should now be running at `http://localhost:5555`
4. Verify this by going to <a href="http://localhost:5555/api/test" target="_blank">http://localhost:5555/api/test</a>

## Listing of project features

<a href="https://www.youtube.com/watch?v=_n7wbfeAhfY" target="_blank">See video demonstration</a>
- Responsive layout scaling
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
