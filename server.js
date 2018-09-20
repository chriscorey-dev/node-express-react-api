const express = require("express");
const path = require("path");
const mysql = require("mysql");

const dbInfo = require("./mysql-info.json");
const settings = require("./settings.json");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "build")));

// const conn = mysql.createConnection(dbInfo);

// Prioritized goals
// TODO: Make into NPM package
// TODO: CRUD stuff
// TODO: Currently getting first primary key and only filtering by that.
//       In the future I'd like to use referenced schemas to automatically do everything.
// TODO: Authentication/ authorization on CRUD operations
// TODO: Be able to make more database connections based on what's in settings.json
// TODO: Error handling. 400, 500?.
// TODO: Don't wait for databases to query just to tell the app to go to reat GUI
// TODO: React's caching is poo in Chrome

// TODO: Query parameters to count
//       sort (alphabetically? idk)
//       limit amount of results
// TODO: Configure server's git with www-data to give that user ownership

class Database {
  constructor(config) {
    this.connection = mysql.createConnection(config);
  }
  query(sql, args) {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, args, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }
  close() {
    return new Promise((resolve, reject) => {
      this.connection.end(err => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
}

(async () => {
  // Need to wait for API before deciding to make function or not

  // /api/  -  Lists dbs
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

  // Handling port
  const port = process.env.PORT || settings.server.port;
  app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
  });
})();

// Creating the API
async function createAPI() {
  settings.server.databases.forEach(db => {
    const mysqlInfo = require(db.mysqlInfo);
    const database = new Database(mysqlInfo);

    database
      .query("SHOW FULL TABLES WHERE Table_Type != 'VIEW'")
      .then(tables => {
        // /api/{db}  -  Lists tables in db
        app.get(`${path}/${mysqlInfo.database}`, (req, res) =>
          res.send(
            tables.map(table => table[`Tables_in_${mysqlInfo.database}`])
          )
        );

        // /api/{db}/{table} & /api/{db}/{table}/:id
        tables.forEach(table => {
          const tableName = table[`Tables_in_${mysqlInfo.database}`];

          database.query(`SHOW COLUMNS IN ${tableName}`).then(cols => {
            let pkField = [];
            cols.find(col => {
              col.Key === "PRI" && pkField.push(col.Field);
            });
            addURL(tableName, pkField[0], database, mysqlInfo);
          });
        });
      });
  });
  // Can this be done better?
  return await new Promise((resolve, reject) => setTimeout(resolve, 500));
}

function addURL(tableName, pkField, database, mysqlInfo) {
  // GET
  app.get(
    `${settings.server.path}/${mysqlInfo.database}/${tableName}`,
    (req, res) => {
      database.query(`SELECT * FROM ${tableName}`).then(rows => res.send(rows));
    }
  );

  app.get(
    `${settings.server.path}/${mysqlInfo.database}/${tableName}/:id`,
    (req, res) => {
      database
        .query(
          `SELECT * FROM ${tableName} WHERE ${pkField} = '${req.params.id}'`
        )
        .then(rows => {
          if (rows.length === 0) return NotFound;
          return rows[0];
        })
        .then(output => res.send(output));
    }
  );

  // PUT
  app.put(
    `${settings.server.path}/${mysqlInfo.database}/${tableName}/:id`,
    (req, res) => {
      const props = Object.keys(req.body);

      // TODO: Error handling in a bundle. This needs to attempt all at once and not run any commands if it fails for any reason.
      // Runs through each item to change in the
      // TODO: Errors:
      //       Can't change Primary Key's field
      //       Can't be null when !NULL.

      // TODO: Use Joi for validation
      // // Checking if body is valid:

      props.forEach(prop => {
        database
          .query(
            `UPDATE ${tableName} SET ${prop} = '${
              req.body[prop]
            }' WHERE ${pkField} = '${req.params.id}'`
          )
          .then(
            database
              .query(
                `SELECT * FROM ${tableName} WHERE ${pkField} = '${
                  req.params.id
                }'`
              )
              .then(rows => res.send(rows[0]))
          );
      });
    }
  );
}

// 404
const NotFound = {
  statusCode: 404,
  error: "Not Found",
  message: "Found no item that matches the ID"
};
