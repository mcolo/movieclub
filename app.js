import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import axios from "axios";
import pg from "pg";
import dotenv from "dotenv";
import { corsOptions } from "./utils/cors.js";
import { suggestions } from "./utils/trie.js";
import { getMovieData } from "./utils/movieData.js";
import { startCronJob } from "./utils/keepAlive.js";

dotenv.config();
// prevent heroku dyno from sleeping
startCronJob();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use("/api/*", cors(corsOptions));

app.get("/keepAlive", (req, res) => {
  console.log("i'm awake");
  res.send({ boop: "snoot" });
});

app.post("/api/search/", (req, res) => {
  const prefix = req.body.prefix;
  const ids = suggestions(prefix);
  if (ids) {
    const movieData = getMovieData(ids);
    res.send({
      movieData,
    });
  } else {
    res.status(404).send();
  }
});

app.post("/api/savePicks", (req, res) => {
  let picks = req.body.picks;
  const id = req.body.id;
  const title = req.body.title;
  if (!picks) {
    res.status(500).send("No ids in request");
    return;
  }
  if (picks.length >= 10) {
    res.status(500).send("Too many picks");
    return;
  }
  if (picks.length < 2) {
    res.status(500).send("Not enough picks");
    return;
  }

  picks = JSON.stringify(picks);

  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  client.connect();
  // if id is passed, then we are updating that entry
  // otherwise create a new one
  if (id) {
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
  }
});

app.get("/api/loadpicks/:id", async (req, res) => {
  const id = req.params.id;
  if (!id) {
    res.status(404).send("No id :(");
    return;
  }

  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  client.connect();

  try {
    const cachedRes = await client.query(
      "SELECT * FROM picks, moviedata WHERE picks.id = moviedata.id AND picks.id = $1",
      [id]
    );
    if (cachedRes.rows[0]) {
      console.log("\n\n sending from cache \n\n");
      res.send({
        picks: {
          title: cachedRes.rows[0].title,
          data: JSON.parse(cachedRes.rows[0].data),
        },
      });
      client.end();
      return;
    }
  } catch (err) {
    res.status(500).send("failed to do first query");
    client.end();
    return;
  }

  let pickRes = null;
  try {
    pickRes = await client.query("SELECT * FROM picks WHERE id = $1", [id]);
    if (!pickRes.rows[0]) {
      res.status(500).send("no picks with that id");
      client.end();
      return;
    }
  } catch (err) {
    res.status(500).send("failed to do second query");
    client.end();
    return;
  }

  const picks = JSON.parse(pickRes.rows[0].picks);
  const promiseArr = picks.map((pick) => {
    return getMovieDataFromImdb(pick.imdbID);
  });
  console.log("\n\n fetching from rapidapi \n\n");
  Promise.all(promiseArr)
    .then(async (movieData) => {
      const dataRes = await client.query(
        "INSERT INTO moviedata(id, data) VALUES($1, $2) ON CONFLICT (id) DO NOTHING",
        [id, JSON.stringify(movieData)]
      );
      res.send({
        picks: {
          title: pickRes.rows[0].title,
          data: movieData,
        },
      });
      client.end();
    })
    .catch((err) => {
      res.status(500).send("failed to fetch imdb data");
      client.end();
    });
});

app.post("/api/storeData", (req, res) => {});

app.get("/api/picks/:id", (req, res) => {
  const id = req.params.id;
  if (!id) {
    res.status(404).send("No id queried.");
  }

  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  client.connect();

  client.query("SELECT * FROM picks WHERE id = $1", [id], (err, result) => {
    if (err) {
      res.status(500).send("we have a problem");
      throw err;
    }
    // res.send({
    //   pickData: result.rows[0],
    // });

    const response = {};
    response.title = result.rows[0].title;
    const picks = JSON.parse(result.rows[0].picks);
    const promiseArr = picks.map((pick) => {
      return getMovieDataFromImdb(pick.imdbID);
    });
    Promise.all(promiseArr)
      .then(async (movieData) => {
        response.movieData = movieData;
        const exists = await client.query(
          "SELECT exists(select * from moviedata where id = $1)",
          [id]
        );
        if (exists) {
          // do nothing
        } else {
          client.query(
            "INSERT INTO moviedata (id, data) values ($1, $2) RETURNING id",
            [id, movieData],
            (err, result) => {
              if (err)
                res
                  .status(500)
                  .send("failed to insert new data into moviedata");
              res.send({ message: "data inserted into " + id });
            }
          );
        }
        res.send({
          data: response,
        });
      })
      .catch((err) => {
        client.end();
      });
    client.end();
  });
});

app.post("/api/movieData", (req, res) => {
  const ids = req.body.ids;
  if (ids.length > 10) {
    res.status(400).send("Cannot fetch more than 10 ids at a time.");
  }
  if (!ids || ids.length < 1) {
    res.status(404).send("No ids were requested");
  }
  const movieDataPromises = ids.map((id) => getMovieDataFromImdb(id));
  Promise.all(movieDataPromises)
    .then((movieData) => {
      res.send({
        movieData,
      });
    })
    .catch((err) => res.status(500).send("Fetching movie data failed"));
});

function getMovieDataFromImdb(id) {
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
