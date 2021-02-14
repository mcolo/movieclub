const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = process.env.PORT || 3000;
const trieUtils = require("./utils/index").Trie;
const movieUtils = require("./utils/index").Movies;
const cors = require("cors");
const axios = require("axios").default;
require("dotenv").config();
const { Client } = require("pg");
const keepAlive = require("./keepAlive");

// prevent heroku dyno from sleeping
keepAlive.startCronJob();

app.use(bodyParser.json());

const whitelist = [
  "http://localhost:8080",
  "http://localhost",
  "http://192.168.1.2:8080",
  "http://192.168.1.2",
  "http://127.0.0.1:8080",
  "http://169.254.126.135:8080",
  "https://competent-jackson-ccddd8.netlify.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.options("*", cors(corsOptions));

app.post("/search/", cors(corsOptions), (req, res) => {
  const prefix = req.body.prefix;
  const ids = trieUtils.suggestions(prefix);
  if (ids) {
    const movieData = movieUtils.getMovieData(ids);
    res.send({
      movieData,
    });
  } else {
    res.status(404).send();
  }
});

app.get("/keepAlive", (req, res) => {
  console.log("i'm alive");
  res.send({ boop: "snoot" });
});

app.post("/savePicks", cors(corsOptions), (req, res) => {
  const picks = JSON.stringify(req.body.picks);
  const id = req.body.id;
  const title = req.body.title;
  if (!picks) res.status(400).send("No ids in request");

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  client.connect();

  if (id) {
    // update picks
    // set picks = picks and title = title where id = id
    client.query(
      `UPDATE picks SET picks=$1, title=$2 WHERE id=$3`,
      [picks, title, id],
      (err, result) => {
        if (err) {
          res.status(500).send("update failed");
          throw err;
        }
        res.send({ message: "update successful" });
      }
    );
  } else {
    client.query(
      `INSERT INTO picks (picks, title) values ($1, $2) RETURNING id`,
      [picks, title],
      (err, results) => {
        if (err) {
          res.status(500).send("insert failed");
          throw err;
        }
        res.send({ id: results.rows[0].id });
      }
    );
    // insert picks into database, get back picks id
    // send picks id back
  }
});

app.get("/picks/:id", cors(corsOptions), (req, res) => {
  const id = req.params.id;
  if (!id) {
    res.status(404).send("No id queried.");
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  client.connect();

  client.query(`SELECT * FROM picks WHERE id = ${id};`, (err, result) => {
    if (err) {
      res.status(500).send("we have a problem");
      throw err;
    }
    res.send(result.rows[0]);
    client.end();
  });
});

app.post("/movieData/", cors(corsOptions), (req, res) => {
  const ids = req.body.ids;
  if (ids.length > 10) {
    res.status(400).send("Cannot fetch more than 10 ids at a time.");
  }
  if (!ids || ids.length < 1) {
    res.status(404).send("No ids were requested");
  }
  const movieDataPromises = ids.map((id) => getMovieData(id));
  Promise.all(movieDataPromises)
    .then((movieData) => {
      res.send(movieData);
    })
    .catch((err) => res.status(500).send("Fetching movie data failed"));
});

function getMovieData(id) {
  const options = {
    method: "GET",
    url: "https://movie-database-imdb-alternative.p.rapidapi.com/",
    params: { i: "", r: "json" },
    headers: {
      "x-rapidapi-key": process.env.RAPID_API_KEY,
      "x-rapidapi-host": process.env.RAPID_API_HOST,
    },
  };

  options.params.i = id;
  return axios
    .request(options)
    .then(function (res) {
      return res.data;
    })
    .catch(function (error) {
      console.error(error);
    });
}

app.listen(port, () => console.log(`listening at http://localhost:${port}`));
