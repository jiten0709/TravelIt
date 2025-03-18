
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

// Handle database errors
pool.on("error", (err) => {
  console.error("Unexpected database error:", err);
  process.exit(-1);
});

// Serve the home page
app.get("/", (req, res) => {
  console.log("Welcome to Travelit API Service");
  res.status(200).send("Welcome to Travelit API Service");
});

// ---------- USER'S DATA ------------
app.get("/testdatausers", (req, res, next) => {
  console.log("TEST DATA :");
  pool.query('SELECT * FROM "travelit"."users"').then((testData) => {
    console.log(testData);
    res.status(200).json(testData.rows);
  });
});

app.post("/addNewUser", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  console.log("Add DATA :");
  console.log(req.body);
  const { username, user_password, user_email } = req.body;
  let count = 0;

  pool.query(
    'SELECT count(*) FROM "travelit"."users" u WHERE u.username = $1',
    [username],
    (error, result) => {
      console.log(result.rows);
      if (error) {
        throw error;
      } else {
        count = result.rows[0].count;
        if (count == 0) {
          const instQ =
            'INSERT INTO "travelit"."users" (username, user_password, user_email) VALUES($1, $2, $3) RETURNING *';
          pool.query(
            instQ,
            [username, user_password, user_email],
            (error, result) => {
              if (error) {
                throw error;
              }
              res.status(201).send(result.rows);
            }
          );
        } else {
          res.status(201).send({ errors: "username already exists" });
        }
      }
    }
  );
});

app.post("/isValidUser", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
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
});

// ---------- FEEDBACK'S DATA ------------
app.post("/addFeedback", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
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
});

// ---------- REVIEW'S DATA ------------
app.get("/addSentiment", async (req, res) => {
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
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/getreviews", async (req, res) => {
  try {
    var place = req.query.place;
    const query = 'SELECT * FROM "travelit"."review" WHERE place=$1';
    const { rows } = await pool.query(query, [place]);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/action", async (req, res) => {
  try {
    res.header("Access-Control-Allow-Origin", "*");
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
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/getPositiveCount", async (req, res) => {
  try {
    res.header("Access-Control-Allow-Origin", "*");
    const query = 'SELECT place, positive_count FROM "travelit"."review"';
    const { rows } = await pool.query(query);
    const placeCounts = {};
    rows.forEach((row) => {
      placeCounts[row.place] = row.positive_count;
    });
    res.json(placeCounts);
  } catch (error) {
    console.log("Error fetching positive counts: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/getNegativeCount", async (req, res) => {
  try {
    res.header("Access-Control-Allow-Origin", "*");
    const query = 'SELECT place, negative_count FROM "travelit"."review"';
    const { rows } = await pool.query(query);
    const placeCounts = {};
    rows.forEach((row) => {
      placeCounts[row.place] = row.negative_count;
    });
    res.json(placeCounts);
  } catch (error) {
    console.log("Error fetching negative counts: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/getChartData", async (req, res) => {
  try {
    res.header("Access-Control-Allow-Origin", "*");
    const { city, kind } = req.query;
    const query = `
      SELECT DISTINCT place, positive_count, negative_count
      FROM "travelit"."review"
      WHERE city = $1 AND kind = $2
    `;
    const { rows } = await pool.query(query, [city, kind]);

    const places = rows.map((row) => row.place);
    const positiveCounts = rows.map((row) => row.positive_count);
    const negativeCounts = rows.map((row) => row.negative_count);

    const chartData = {
      places: places,
      positiveCounts: positiveCounts,
      negativeCounts: negativeCounts,
    };

    res.json(chartData);
  } catch (error) {
    console.error("Error fetching chart data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/getPlacesByCity", async (req, res) => {
  try {
    res.header("Access-Control-Allow-Origin", "*");
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
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/getPlaces", async (req, res) => {
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
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/addReview", (req, res) => {
  const review = req.body;
  console.log("Data added:", review);

  pool.query(
    'INSERT INTO "travelit"."review" (name, city, kind, place, comment, image_url) VALUES ($1, $2, $3, $4, $5, $6)',
    [review.name, review.city, review.kind, review.place, review.comment, review.image_url],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: "Error inserting review" });
        console.log("Error inserting review:", err);
      } else {
        res.json({ message: "Review added successfully" });
        console.log("Review added successfully");
      }
    }
  );
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});