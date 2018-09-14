const express = require("express");
const path = require("path");
const mysql = require("mysql");

const dbInfo = require("./mysql-info.json");
const settings = require("./settings.json");

const app = express();

// TODO: Make query parameter to limit amount of results
// TODO: Query parameter to count
// TODO: Make query parameter to sort (alphabetically? idk)
// TODO: Error handling. 404, 400.
// TODO: CRUD stuff
// TODO: ? Make runQuery function and make it asyncronous so it has to wait for it to stop
// TODO: Don't wait for databases to query just to tell the app to go to reat GUI
// TODO: Be able to make more database connections based on what's in settings.json
// TODO: /api/ shows configured databases from settings.json

// Setting up urls
app.use(express.static(path.join(__dirname, "build")));

const conn = mysql.createConnection(dbInfo);

(async () => {
  // Need to wait for API before deciding to make function or not
  await createAPI();

  // Serving React
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "build/index.html"));
  });
  // Port stuffs
  const port = process.env.PORT || settings.server.port;
  app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
  });
})();

// This does a lot of the work
async function createAPI() {
  conn.connect(err => {
    if (err) return err;
    conn.query("SHOW FULL TABLES WHERE Table_Type != 'VIEW'", (err, tables) => {
      if (err) return err;

      // /api/{db}
      app.get(settings.server.path, (req, res) =>
        res.send(tables.map(table => table[`Tables_in_${dbInfo.database}`]))
      );

      // /api/sakila/{table} & /api/{db}/{table}/:id
      tables.forEach(table => {
        conn.query(
          `SHOW COLUMNS IN ${table[`Tables_in_${dbInfo.database}`]}`,
          (err, rows) => {
            if (err) return err;
            rows.find(
              row =>
                row.Extra === "auto_increment"
                  ? addURL(table[`Tables_in_${dbInfo.database}`], row.Field)
                  : addURL(table[`Tables_in_${dbInfo.database}`]) // No primary key, so no ID field
            );
          }
        );
      });
    });
  });
  // Can this be done better?
  return await new Promise((resolve, reject) => setTimeout(resolve, 500));
}

function addURL(table, idField) {
  app.get(`${settings.server.path}/${table}`, (req, res) => {
    console.log(`SELECT * FROM ${table}`);
    conn.query(
      `SELECT * FROM ${table}`,
      (err, rows) => (err ? res.send(err) : res.send(rows))
    );
  });

  app.get(`${settings.server.path}/${table}/:id`, (req, res) => {
    const query = idField
      ? `SELECT * FROM ${table} WHERE ${idField} = ${req.params.id}`
      : `SELECT * FROM ${table} LIMIT 1 OFFSET ${parseInt(req.params.id) - 1}`;
    conn.query(query, (err, rows) => (err ? res.send(err) : res.send(rows[0])));
  });

  app.put(`${settings.server.path}/${table}/:id`, (req, res) => {
    conn.query(
      `UPDATE film SET ${table} = 'ACADEMY DINOSAUR 2' WHERE ${idField} = 1 SELECT * FROM ${table} LIMIT 1 OFFSET ${parseInt(
        req.params.id
      ) - 1}`,
      (err, rows) => {
        if (err) return res.send(err);
        res.send(rows[0]);
      }
    );
  });
}
