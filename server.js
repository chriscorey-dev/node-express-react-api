const express = require("express");
const path = require("path");
const mysql = require("mysql");

const dbInfo = require("./mysql-info.json");
const settings = require("./settings.json");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "build")));

const conn = mysql.createConnection(dbInfo);

// Prioritized goals
// TODO: CRUD stuff
// TODO: Be able to make more database connections based on what's in settings.json
// TODO: Error handling. 404, 400.
// TODO: Don't wait for databases to query just to tell the app to go to reat GUI
// TODO: React's caching is poo in Chrome

// TODO: Make query parameter to count
// TODO: Make query parameter to sort (alphabetically? idk)
// TODO: Make query parameter to limit amount of results
// TODO: ? Make runQuery function and make it asyncronous so it has to wait for it to stop
// TODO: Configure server's git with www-data to give that user ownership

(async () => {
  // Need to wait for API before deciding to make function or not

  // /api/  -  Lists dbs
  // app.get(settings.path, (req, res) =>
  app.get("/api", (req, res) =>
    res.send(
      settings.server.databases.map(database => {
        const db = require(database.mysqlInfo);
        return db.database;
      })
    )
  );
  await createAPI();

  // Serving React
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
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

      // /api/{db}  -  Lists tables in db
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
    // app.get(`${settings.server.path}/:table/:id`, (req, res) => {    // TODO: LOOK INTO THIS
    const query = idField
      ? `SELECT * FROM ${table} WHERE ${idField} = ${req.params.id}`
      : `SELECT * FROM ${table} LIMIT 1 OFFSET ${parseInt(req.params.id) - 1}`;
    conn.query(query, (err, rows) => (err ? res.send(err) : res.send(rows[0])));
  });

  app.put(`${settings.server.path}/${table}/:id`, (req, res) => {
    // TODO: Use Joi for validation
    // if (!req.body) return res.status(400).send({ error: "badd sauce" });
    // if (!prop)
    //   return res.status(400).send({ error: `No field with name of ${prop}` });

    const props = Object.keys(req.body);
    props.forEach(prop => {
      conn.query(
        `UPDATE ${table} SET ${prop} = '${req.body[prop]}' WHERE ${idField} = ${
          req.params.id
        }`,
        (err, rows) => {
          if (err) return err;
          // TODO: Return SELECT statement of modified field
          // conn.query(
          //   `SELECT * FROM ${table} WHERE ${idField} = ${req.params.id}`,
          //   (err, rows) => {
          // res.send(rows);
          //   }
          // );
        }
      );
    });
  });
}
