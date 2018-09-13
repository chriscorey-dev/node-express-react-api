const express = require("express"); //Express to run our app
const app = express(); //Initiate the app
const path = require("path"); //Navigate to build folder

app.use(express.static(path.join(__dirname, "build")));

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
  if (!user)
    return res.status(404).send("The user with the given ID does not exist.");

  res.send(user);
});

// Serving React
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build/index.html"));
});

// Port stuffs
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Listening on port", port);
});
