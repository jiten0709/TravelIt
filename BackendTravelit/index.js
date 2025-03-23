
// Entry Point of the API Server

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const { Pool } = require("pg");
const natural = require("natural");
require("dotenv").config(); // Load environment variables

// Creates an Express application
const app = express();
const PORT = process.env.DOCKER_BACKEND_PORT || 5004;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Database connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

// Set the search_path to include the "travelit" schema
pool.query('SET search_path TO "travelit", public', (err) => {
  if (err) {
    console.error("Error setting search_path:", err);
  } else {
    console.log('search_path set to "travelit"');
  }
});

// Log the current search_path
pool.query("SHOW search_path", (err, res) => {
  if (err) {
    console.error("Error fetching search_path:", err);
  } else {
    console.log("Current search_path:", res.rows[0].search_path);
  }
});

// Test the database connection
pool.query('SELECT * FROM "travelit"."review" LIMIT 1', (err, res) => {
  if (err) {
    console.error("Error testing database connection:", err);
  } else {
    console.log("Database connection successful. Sample data:", res.rows);
  }
});

// Serve the home page
app.get("/", (req, res) => {
  console.log("Welcome to Travelit API Service");
  res.status(200).send("Welcome to Travelit API Service");
});

// ---------- USER'S DATA ------------
app.get("/testdatausers", (req, res, next) => {
  try {
    console.log("TEST DATA :");
    pool.query('SELECT * FROM "travelit"."users"').then((testData) => {
      console.log(testData);
      res.status(200).json(testData.rows);
    });
  } catch (error) {
    console.error("Error fetching users data:", error);
    next(error);
  }
});

app.post("/addNewUser", async (req, res, next) => {
  try {
    const { username, user_password, user_email } = req.body;

    const result = await pool.query(
      'SELECT count(*) FROM users WHERE username = $1',
      [username]
    );

    const count = parseInt(result.rows[0].count, 10);
    if (count === 0) {
      const insertResult = await pool.query(
        'INSERT INTO users (username, user_password, user_email) VALUES ($1, $2, $3) RETURNING *',
        [username, user_password, user_email]
      );
      res.status(201).json(insertResult.rows);
    } else {
      res.status(409).json({ error: "Username already exists" });
    }
  } catch (error) {
    console.error("Error adding new user:", error);
    next(error);
  }
});

app.post("/isValidUser", (req, res, next) => {
  try {
    console.log("TEST DATA :");
    const { username, user_password } = req.body;

    pool.query(
      'SELECT * FROM "travelit"."users" u WHERE u.username = $1 AND u.user_password = $2',
      [username, user_password],
      (error, result) => {
        console.log(result.rows);
        if (error) {
          throw error;
        } else {
          if (result.rowCount >= 1) {
            console.log(" ok .... ");
            res.status(200).json(result.rows);
          } else {
            res.status(200).json({ errors: "Invalid User/Password." });
          }
        }
      }
    );
  } catch (error) {
    console.error("Error validating user:", error);
    next(error);
  }
});

// ---------- FEEDBACK'S DATA ------------
app.post("/addFeedback", (req, res, next) => {
  try {
    console.log("Add DATA :");
    console.log(req.body);
    const { username, user_feedback } = req.body;
    const instQ =
      'INSERT INTO "travelit"."feedback" (username, user_feedback) VALUES($1, $2) RETURNING * ';
    pool.query(instQ, [username, user_feedback], (error) => {
      if (error) {
        throw error;
      }
      res.status(201).send();
    });
  } catch (error) {
    console.error("Error adding feedback:", error);
    next(error);
  }
});

// ---------- REVIEW'S DATA ------------
app.get("/addSentiment", async (req, res, next) => {
  try {
    const query = 'SELECT * FROM "travelit"."review"';
    const { rows } = await pool.query(query);

    const placeSentimentCounts = new Map();
    const placeNegativeCounts = new Map();

    const tokenizer = new natural.WordTokenizer();
    const SentimentAnalyzer = natural.SentimentAnalyzer;
    const stemmer = natural.PorterStemmer;
    const analyzer = new SentimentAnalyzer("English", stemmer, "afinn");

    for (const review of rows) {
      const words = tokenizer.tokenize(review.comment);
      const sentimentScore = analyzer.getSentiment(words);
      let sentimentLabel;

      if (sentimentScore >= 0) {
        sentimentLabel = "positive";
      } else {
        sentimentLabel = "negative";
      }

      const updateSentimentQuery = `
          UPDATE "travelit"."review"
          SET sentiment = $1
          WHERE rev_id = $2
        `;
      await pool.query(updateSentimentQuery, [sentimentLabel, review.rev_id]);

      if (sentimentScore > 0) {
        const place = review.place;
        const currentPositiveCount = placeSentimentCounts.get(place) || 0;
        placeSentimentCounts.set(place, currentPositiveCount + 1);
      } else if (sentimentScore < 0) {
        const place = review.place;
        const currentNegativeCount = placeNegativeCounts.get(place) || 0;
        placeNegativeCounts.set(place, currentNegativeCount + 1);
      }
    }

    for (const [place, positiveCount] of placeSentimentCounts.entries()) {
      const negativeCount = placeNegativeCounts.get(place) || 0;

      const updateCountsQuery = `
          UPDATE "travelit"."review"
          SET positive_count = $1, negative_count = $2
          WHERE place = $3
        `;
      await pool.query(updateCountsQuery, [
        positiveCount,
        negativeCount,
        place,
      ]);
    }

    res.json({
      message:
        "Sentiment, positive counts, and negative counts updated successfully",
    });
  } catch (error) {
    console.error(
      "Error updating sentiment, positive counts, and negative counts:",
      error
    );
    next(error);
  }
});

app.get("/getreviews", async (req, res, next) => {
  try {
    const place = req.query.place;
    const query = 'SELECT * FROM review WHERE place = $1';
    const { rows } = await pool.query(query, [place]);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    next(error); // Pass the error to the global error handler
  }
});

app.post("/action", async (req, res, next) => {
  try {
    var action = req.body.action;
    var place = req.body.place;
    if (action == "fetchPositive") {
      var query =
        'SELECT * FROM "travelit"."review" WHERE sentiment=\'positive\' AND place=$1';
      const { rows } = await pool.query(query, [place]);
      res.json({
        data: rows,
      });
    } else if (action == "fetchNegative") {
      var query =
        'SELECT * FROM "travelit"."review" WHERE sentiment=\'negative\' AND place=$1';
      const { rows } = await pool.query(query, [place]);
      res.json({
        data: rows,
      });
    } else if (action == "fetchNegativeNPositive") {
      var query =
        'SELECT * FROM "travelit"."review" WHERE place = $1 AND (sentiment = \'positive\' OR sentiment = \'negative\')';
      const { rows } = await pool.query(query, [place]);
      res.json({
        data: rows,
      });
    }
  } catch (error) {
    console.error("Error fetching reviews:", error);
    next(error);
  }
});

app.get("/getPositiveCount", async (req, res, next) => {
  try {
    const query = 'SELECT place, positive_count FROM "travelit"."review"';
    const { rows } = await pool.query(query);
    const placeCounts = {};
    rows.forEach((row) => {
      placeCounts[row.place] = row.positive_count;
    });
    res.json(placeCounts);
  } catch (error) {
    console.log("Error fetching positive counts: ", error);
    next(error);
  }
});

app.get("/getNegativeCount", async (req, res, next) => {
  try {
    const query = 'SELECT place, negative_count FROM "travelit"."review"';
    const { rows } = await pool.query(query);
    const placeCounts = {};
    rows.forEach((row) => {
      placeCounts[row.place] = row.negative_count;
    });
    res.json(placeCounts);
  } catch (error) {
    console.log("Error fetching negative counts: ", error);
    next(error);
  }
});

app.get("/getChartData", async (req, res, next) => {
  try {
    const { city, kind } = req.query;
    console.log("Fetching chart data for city:", city, "and kind:", kind);

    const query = `
      SELECT DISTINCT place, positive_count, negative_count
      FROM "travelit"."review"
      WHERE city = $1 AND kind = $2
    `;
    const { rows } = await pool.query(query, [city, kind]);

    const chartData = {
      places: rows.map((row) => row.place),
      positiveCounts: rows.map((row) => row.positive_count),
      negativeCounts: rows.map((row) => row.negative_count),
    };

    res.json(chartData);
  } catch (error) {
    console.error("Error fetching chart data:", error);
    next(error);
  }
});

app.get("/getPlacesByCity", async (req, res, next) => {
  try {
    const { city, kind } = req.query;
    const query = `
      SELECT DISTINCT place, positive_count
      FROM "travelit"."review"
      WHERE city = $1 AND kind = $2
      ORDER BY positive_count DESC;
    `;
    const { rows } = await pool.query(query, [city, kind]);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching places by city and kind:", error);
    next(error);
  }
});

app.get("/getPlaces", async (req, res, next) => {
  try {
    const selectedCity = req.query.city;
    const selectedKind = req.query.kind;

    const query = `
      SELECT DISTINCT place FROM "travelit"."review" 
      WHERE city=$1 AND kind=$2 
      ORDER BY place ASC;
    `;

    const { rows } = await pool.query(query, [selectedCity, selectedKind]);

    const placeNames = rows.map((row) => row.place);

    res.json(placeNames);
  } catch (error) {
    console.error("Error fetching place names of:", error);
    next(error);
  }
});

app.post("/addReview", async (req, res, next) => {
  try {
    const review = req.body;
    console.log("Data added:", review);

    const query = `
      INSERT INTO "travelit"."review" (name, city, kind, place, comment, image_url)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    await pool.query(query, [
      review.name,
      review.city,
      review.kind,
      review.place,
      review.comment,
      review.image_url,
    ]);

    res.json({ message: "Review added successfully" });
    console.log("Review added successfully");
  } catch (error) {
    console.error("Error adding review:", error);
    next(error); // Pass the error to the global error handler
  }
});

// ---------- GLOBAL ERROR HANDLING ----------
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});