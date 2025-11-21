# Quiz App

## Overview
This is the Quiz App for the assignment. Frontend is HTML/CSS/JS (served as static files). Backend is Node.js + Express + MongoDB using Mongoose. The server decides which questions to include, starts the game, tracks and stores scores, and serves the frontend.

## Features implemented
- Home page, Quiz page, Results page
- Signup/Login (JWT)
- Save users' scores and play history in MongoDB
- User profile showing play history
- Leaderboard (top 10 best scores)
- Local questions file for early phase; OpenTDB support ready for later phase
- Deployable to Render or similar providers

## Folder structure
(see project root structure in submission)

## How to run locally

1. Install Node.js (v18+ recommended) and npm.
2. Clone this repo to your machine.
3. Create a MongoDB Atlas cluster (free tier) and get the connection string (replace `<username>`, `<password>` and DB name).
4. In `backend/` create a `.env` file from `.env.example`:
5. Install dependencies with: npm install and start project with: npm start
6. Open `http://localhost:4000` in your browser. The server serves the frontend.

## Using the app
- Create an account (Signup) or play as guest via `Play Now (guest)`.
- Start a quiz from the Quiz page. After finishing you'll be redirected to the Results page.
- If signed-in, scores are saved to your profile.

