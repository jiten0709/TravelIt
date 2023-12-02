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
app.get("/getreviews", async (req, res) => {
  try {
    var place = req.query.place; // Use req.query to get the place parameter from the URL
    const query = "SELECT * FROM travelit.review WHERE place=$1"; // Update with your query
    const { rows } = await pool.query(query, [place]);
    // Analyze sentiment for each review and update the database
    const natural = require("natural");
    const tokenizer = new natural.WordTokenizer();

    const SentimentAnalyzer = natural.SentimentAnalyzer;
    const stemmer = natural.PorterStemmer;

    const analyzer = new SentimentAnalyzer("English", stemmer, "afinn");

    for (const review of rows) {
      const words = tokenizer.tokenize(review.comment);
      const sentimentScore = analyzer.getSentiment(words);
      let sentimentLabel;

      if (sentimentScore > 0) {
        sentimentLabel = "positive";
      } else if (sentimentScore < 0) {
        sentimentLabel = "negative";
      } else {
        sentimentLabel = "neutral";
      }

      // Update the sentiment column in the database
      const updateQuery = `
        UPDATE travelit.review
        SET sentiment = $1
        WHERE rev_id = $2
        ;
      `;
      await pool.query(updateQuery, [sentimentLabel, review.rev_id]);
    }
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
        "SELECT * FROM travelit.review WHERE sentiment='positive' AND place=$1";
      const { rows } = await pool.query(query, [place]);
      res.json({
        data: rows,
      });
    } else if (action == "fetchNegative") {
      var query =
        "SELECT * FROM travelit.review WHERE sentiment='negative' AND place=$1";
      const { rows } = await pool.query(query, [place]);
      res.json({
        data: rows,
      });
    } else if (action == 'fetchNegativeNPositive') {
      var query =
        // "SELECT * FROM travelit.review WHERE place=$1";
         "SELECT * FROM travelit.review WHERE place = $1 AND (sentiment = 'positive' OR sentiment = 'negative')";
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

app.post("/addReview", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  console.log("Add DATA :");
  console.log(req.body);
  const { name, kind, place, city, rating, comment } = req.body;
  const instQ =
    "INSERT INTO travelit.review (name, kind, place, city, rating, comment) VALUES($1, $2, $3, $4, $5, $6) RETURNING * ";
  pool.query(instQ, [name, kind, place, city, rating, comment], (error) => {
    if (error) {
      throw error;
    }
    res.status(201).send();
  });
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
