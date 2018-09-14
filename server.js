const express = require("express");
const path = require("path");
const mysql = require("mysql");

const app = express();

const dbInfo = require("./mysql-info.json");
const settings = require("./settings.json");

// TODO: Make query parameter to limit amount of results
// TODO: Make query parameter to sort (alphabetically? idk)
// TODO: Error handling. 404, 400.
// TODO: CRUD stuff
// TODO: ? Make runQuery function and make it asyncronous so it has to wait for it to stop
// TODO: Don't wait for databases to query just to tell the app to go to reat GUI

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

      // /api/sakila
      app.get(settings.server.path, (req, res) => res.send(tables));

      // /api/sakila/{table} & /api/sakila/{table}/:id
      tables.forEach(table => {
        conn.query(`SHOW COLUMNS IN ${table.Tables_in_sakila}`, (err, rows) => {
          if (err) return err;
          rows.find(
            row =>
              row.Extra === "auto_increment"
                ? addURL(table.Tables_in_sakila, row.Field)
                : null
          );
        });
      });
    });
  });
  // Can this be done better?
  return await new Promise((resolve, reject) => setTimeout(resolve, 500));
}

function addURL(table, id) {
  app.get(`${settings.server.path}/${table}`, (req, res) => {
    conn.query(
      `SELECT * FROM ${table}`,
      (err, rows) => (err ? res.send(err) : res.send(rows))
    );
  });

  app.get(`${settings.server.path}/${table}/:id`, (req, res) => {
    console.log(`SELECT * FROM ${table} WHERE ${id} = ${req.params.id}`);
    conn.query(
      `SELECT * FROM ${table} WHERE ${id} = ${req.params.id}`,
      (err, rows) => (err ? res.send(err) : res.send(rows[0]))
    );
  });
}
