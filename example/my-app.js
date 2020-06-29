const express = require("express");
const path = require("path");
const { initializeSpot } = require("spot");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || "8000";

const inMemoryStore = {
  users: {
    "00001": {
      name: "Spot",
      role: "Good Boy",
      age: 7,
    },
    "00002": {
      name: "Rufus",
      role: "Security",
      age: 3,
    },
  },
};

app.get("/get-users", (req, res) => {
  console.log(`Get All Users`);
  res.status(200).send(JSON.stringify(inMemoryStore.users));
});

app.get("/get-user", (req, res) => {
  console.log(`Get Single User: ${JSON.stringify(req.query)}`);
  const id = req.query.id;
  res.status(200).send(JSON.stringify(inMemoryStore.users[id]));
});

app.post("/update-user", (req, res) => {
  console.log(`Update User: ${JSON.stringify(req.body)}`);
  const { id, name, age, role } = req.body;

  inMemoryStore.users[id] = {
    ...inMemoryStore.users[id],
    name,
    age,
    role,
  };
  res.status(200).send();
});

app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});

main = async () => {
  const spot = initializeSpot(`http://localhost:${port}`);
  spot.query("get-users", null, ["users"]);
  await new Promise((resolve) => spot.subscribeOnce(resolve));

  spot.query("get-user", { id: "00001" }, ["users", "00001"]);
  await new Promise((resolve) => spot.subscribeOnce(resolve));

  console.log(JSON.stringify(spot.getState(), null, 2));

  spot.command("update-user", { id: "00001", role: "Best friend" });
  await new Promise((resolve) => spot.subscribeOnce(resolve));

  spot.query("get-users", null, ["users"]);
  await new Promise((resolve) => spot.subscribeOnce(resolve));

  console.log(JSON.stringify(spot.getState(), null, 2));

  spot.command("update-user", { id: "00002", age: 4 });
  await new Promise((resolve) => spot.subscribeOnce(resolve));

  spot.query("get-user", { id: "00002" }, ["users", "00002"]);
  await new Promise((resolve) => spot.subscribeOnce(resolve));

  console.log(JSON.stringify(spot.getState(), null, 2));

  process.exit();
};

main();
