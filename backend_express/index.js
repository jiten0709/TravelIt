// Entry Point of the API Server

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

/* Creates an Express application.
The express() function is a top-level
function exported by the express module.
*/
const app = express();
// parse application/json
app.use(bodyParser.json());
app.use(cors());
const Pool = require("pg").Pool;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "TravelIt",
  password: "postgres",
  dialect: "postgres",
  port: 5432,
});

/* To handle the HTTP Methods Body Parser
is used, Generally used to extract the
entire body portion of an incoming
request stream and exposes it on req.body
*/

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  cors({
    origin: "*",
  })
);

pool.connect((err, client, release) => {
  if (err) {
    return console.error("Error acquiring client", err.stack);
  }
  client.query("SELECT NOW()", (err, result) => {
    release();
    if (err) {
      return console.error("Error executing query", err.stack);
    }
    console.log("Connected to Database !");
  });
});

// ---------- USER'S DATA ------------
app.get("/testdatausers", (req, res, next) => {
  console.log("TEST DATA :");
  pool.query("SELECT * FROM travelit.users").then((testData) => {
    console.log(testData);
    //res.send(testData.rows);
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
    "Select count(*) from travelit.users u WHERE u.username = $1",
    [username],
    (error, result) => {
      console.log(result.rows);
      //console.log(result.rows);

      if (error) {
        throw error;
      } else {
        count = result.rows[0].count;
        // console.log("---- " + count);
        // console.log(" ... " + count);
        if (count == 0) {
          // console.log("Add....");

          const instQ =
            "INSERT INTO travelit.users (username, user_password, user_email) VALUES($1, $2, $3) RETURNING *";
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
          // console.log("else....");
          res.status(201).send({ errors: "username already exists" });
        }
      }
    }
  );
});

app.post("/isValidUser", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  console.log("TEST DATA :");
  //console.log(req.body);
  const { username, user_password } = req.body;

  pool.query(
    "Select * from travelit.users u WHERE u.username = $1 AND u.user_password = $2",
    [username, user_password],
    (error, result) => {
      console.log(result.rows);
      //console.log(result.rows);

      if (error) {
        throw error;
      } else {
        if (result.rowCount >= 1) {
          console.log(" ok .... ");
          //res.json({mess:"valid"});
          res.status(200).json(result.rows);
        } else {
          res.status(200).json({ errors: "Invalid User/Password." });
        }
      }
    }
  );
});

// ---------- FEEBACK'S DATA ------------
app.post("/addFeedback", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  console.log("Add DATA :");
  console.log(req.body);
  const { username, user_feedback } = req.body;
  const instQ =
    "INSERT INTO travelit.feedback (username, user_feedback) VALUES($1, $2) RETURNING * ";
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
    // Fetch all reviews
    const query = "SELECT * FROM travelit.test";
    const { rows } = await pool.query(query);

    // Initialize maps to store positive and negative sentiment counts for each place
    const placeSentimentCounts = new Map();
    const placeNegativeCounts = new Map();

    const natural = require("natural");
    const tokenizer = new natural.WordTokenizer();
    const SentimentAnalyzer = natural.SentimentAnalyzer;
    const stemmer = natural.PorterStemmer;
    const analyzer = new SentimentAnalyzer("English", stemmer, "afinn");

    // Iterate through the reviews
    for (const review of rows) {
      const words = tokenizer.tokenize(review.comment);
      const sentimentScore = analyzer.getSentiment(words);
      let sentimentLabel;

      if (sentimentScore > 0) {
        sentimentLabel = "positive";
      } else {
        sentimentLabel = "negative";
      }

      // Update the sentiment label for this review in the database
      const updateSentimentQuery = `
          UPDATE travelit.test
          SET sentiment = $1
          WHERE rev_id = $2
        `;
      await pool.query(updateSentimentQuery, [sentimentLabel, review.rev_id]);

      if (sentimentScore > 0) {
        // Update or initialize the positive count for this place
        const place = review.place;
        const currentPositiveCount = placeSentimentCounts.get(place) || 0;
        placeSentimentCounts.set(place, currentPositiveCount + 1);
      } else if (sentimentScore < 0) {
        // Update or initialize the negative count for this place
        const place = review.place;
        const currentNegativeCount = placeNegativeCounts.get(place) || 0;
        placeNegativeCounts.set(place, currentNegativeCount + 1);
      }
    }

    // Update the positive_count and negative_count in the database
    for (const [place, positiveCount] of placeSentimentCounts.entries()) {
      const negativeCount = placeNegativeCounts.get(place) || 0;

      const updateCountsQuery = `
          UPDATE travelit.test
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
    var place = req.query.place; // Use req.query to get the place parameter from the URL
    const query = "SELECT * FROM travelit.test WHERE place=$1"; // Update with your query
    const { rows } = await pool.query(query, [place]);
    // Return the rows as JSON
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
        "SELECT * FROM travelit.test WHERE sentiment='positive' AND place=$1";
      const { rows } = await pool.query(query, [place]);
      res.json({
        data: rows,
      });
    } else if (action == "fetchNegative") {
      var query =
        "SELECT * FROM travelit.test WHERE sentiment='negative' AND place=$1";
      const { rows } = await pool.query(query, [place]);
      res.json({
        data: rows,
      });
    } else if (action == "fetchNegativeNPositive") {
      var query =
        // "SELECT * FROM travelit.review WHERE place=$1";
        "SELECT * FROM travelit.test WHERE place = $1 AND (sentiment = 'positive' OR sentiment = 'negative')";
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
    // Get the city parameter from the request query
    // const city = req.query.city
    const query = "SELECT place, positive_count FROM travelit.test";
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
    // Get the city parameter from the request query
    // const city = req.query.city
    const query = "SELECT place, negative_count FROM travelit.test";
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
    FROM travelit.test
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
    const { city, kind } = req.query; // Get the city and kind parameters from the request query
    const query = `
      SELECT DISTINCT place, positive_count
      FROM travelit.test
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
      SELECT DISTINCT place FROM travelit.test 
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

// app.post("/addReview", (req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   console.log("Add DATA :");
//   console.log(req.body);
//   const { name, kind, place, city, comment } = req.body;
//   const instQ =
//     "INSERT INTO travelit.review (name, kind, place, city, comment) VALUES($1, $2, $3, $4, $5) RETURNING * ";
//   pool.query(instQ, [name, kind, place, city, comment], (error) => {
//     if (error) {
//       throw error;
//     }
//     res.status(201).send();
//     res.json({ message: 'Review added successfully' });
//   });
// });

app.post("/addReview", (req, res) => {
  const review = req.body;
  console.log("Data added:", review);

  // Insert review into the database
  pool.query(
    "INSERT INTO travelit.test (name, city, kind, place, comment) VALUES ($1, $2, $3, $4, $5)",
    [review.name, review.city, review.kind, review.place, review.comment],
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

// ----------------------
// Require the Routes API
// Create a Server and run it on the port 3000
const server = app.listen(3000, function () {
  let host = server.address().address;
  let port = server.address().port;
  // Starting the Server at the port 3000
  console.log("Server is running on port 3000");
});
