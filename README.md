# TravelIt

TravelIt is a web application designed to help users explore and review travel destinations. It provides a platform to view destinations, read reviews, and analyze sentiments for various places.

## Features

- Explore destinations categorized by type (historical, adventurous, etc.).
- View images and descriptions of destinations.
- Read positive and negative reviews for each destination.
- Sentiment analysis of reviews using Natural Language Processing (NLP).
- Backend powered by PostgreSQL and Express.js.

## Technologies Used

### Frontend

- HTML5, CSS3, JavaScript
- jQuery

### Backend

- Node.js with Express.js
- PostgreSQL database
- Natural Language Processing using `natural` library

## Installation

### Prerequisites

- Node.js installed
- PostgreSQL installed

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/jiten0709/TravelIt.git
   cd TravelIt
   ```
2. Install dependencies:
   ```bash
   cd backend_express
   npm install
   ```
3. Install frontend dependencies (if applicable):
   ```bash
    cd ../FrontendTravelit
    npm install
   ```
4. Set up the PostgreSQL database:

- Start the PostgreSQL server.
- Create a database and configure it in the backend.

5. Start the backend server:
   ```bash
   cd ../backend_express
   node index.js
   ```
6. Open the frontend:

- Navigate to FrontendTravelit/index.html.
- Use a live server (e.g., VS Code's Live Server extension) to run the application.
