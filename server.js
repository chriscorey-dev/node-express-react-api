const express = require("express");
const path = require("path");
const mysql = require("mysql");

const app = express();

const dbInfo = require("./mysql-info.json");
const settings = require("./settings.json");

// app.use(express.static(path.join(__dirname, "build")));

const conn = mysql.createConnection(dbInfo);

conn.connect(err => {
  if (err) return console.log(err);
  // console.log("connected as id " + conn.threadId);
  // console.log(conn.state);
});

app.get("/api/sakila", (req, res) => {
  conn.query("SHOW TABLES", (err, results) => {
    if (err) return res.send(err);
    return res.send(results);
  });
});

app.get("/api/sakila/films", (req, res) => {
  conn.query("SELECT * FROM film LIMIT 10", (err, results) => {
    if (err) return res.send(err);
    return res.send(results);
  });
});

app.get("/api/sakila/films/:id", (req, res) => {
  conn.query(
    `SELECT * FROM film WHERE film_id = ${parseInt(req.params.id)}`,
    (err, results) => {
      if (err) return res.send(err);
      return res.send(results);
    }
  );
});

function handle404(res) {
  res.status(404).send(err => {
    [
      {
        code: err.status,
        error: true,
        message: "Specified id was not found"
        // data: {
        //   id: "meta"
        // }
      }
    ];
  });
}

// Serving React
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build/index.html"));
});

// Port stuffs
const port = process.env.PORT || settings.server.port;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

function notFound(res) {
  res.status(404).send({ detail: "Not Found" });
}
