const express = require("express");
const path = require("path");
const mysql = require("mysql");
const app = express();
const dbInfo = require("./dbInfo.json");

app.use(express.static(path.join(__dirname, "build")));

const SELECT_ALL_FILMS_QUERTY = "SELECT * FROM film";

const conn = mysql.createConnection(dbInfo);
conn.connect(err => {
  if (err) return console.log(err);
  console.log("connected as id " + conn.threadId);
  console.log(conn.state);
});

const users = [
  {
    id: 1,
    name: "Bob"
  },
  {
    id: 2,
    name: "Jack"
  },
  {
    id: 3,
    name: "Jill"
  }
];

// API get request before serving React
app.get("/api/users", (req, res) => {
  res.send(users);
});

app.get("/api/users/:id", (req, res) => {
  const user = users.find(user => user.id === parseInt(req.params.id));
  // 404 when bad id
  if (!user) return notFound(res);

  res.send(user);
});

// API get request before serving React
app.get("/api/sakila/films", (req, res) => {
  conn.query(SELECT_ALL_FILMS_QUERTY, (err, results) => {
    if (err) {
      return res.send(err);
    } else return res.send(results);
    // res.json({
    //   data: results
    // });
  });
});

// Serving React
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build/index.html"));
});

// // Port stuffs
// const port = process.env.PORT || 3002;
// app.listen(port, () => {
//   console.log(`Listening on port ${port}...`);
// });

// function notFound(res) {
//   res.status(404).send({ detail: "Not Found" });
// }
