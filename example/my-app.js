/* eslint-disable no-console */
const express = require('express');
const { initializeSpot } = require('spot');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || '12967';

const inMemoryStore = {
  users: {
    '00001': {
      name: 'Spot',
      role: 'Good Boy',
      age: 7,
    },
    '00002': {
      name: 'Rufus',
      role: 'Security',
      age: 3,
    },
  },
};

app.get('/get-users', (req, res) => {
  console.log('Get All Users');
  res.status(200).send(JSON.stringify(inMemoryStore.users));
});

app.get('/get-user', (req, res) => {
  console.log(`Get Single User: ${JSON.stringify(req.query)}`);
  const { id } = req.query;
  res.status(200).send(JSON.stringify(inMemoryStore.users[id]));
});

app.post('/update-user', (req, res) => {
  console.log(`Update User: ${JSON.stringify(req.body)}`);
  const {
    id, name, age, role,
  } = req.body;

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

const main = async () => {
  const spot = initializeSpot(`http://localhost:${port}`);

  // Queries can be awaited
  await spot.query('get-users', null, ['users']);
  await spot.query('get-user', { id: '00001' }, ['users', '00001']);

  console.log(JSON.stringify(spot.data, null, 2));

  // So can commands can be awaited
  await spot.command('update-user', { id: '00001', role: 'Best friend' });

  // You can also set subscribers instead of awaiting
  spot.query('get-users', null, ['users']);
  await new Promise((resolve) => spot.subscribeOnce(resolve));

  console.log(JSON.stringify(spot.data, null, 2));

  // Subscription works with commands too
  spot.command('update-user', { id: '00002', age: 4 });
  await new Promise((resolve) => spot.subscribeOnce(resolve));

  await spot.query('get-user', { id: '00002' }, ['users', '00002']);

  console.log(JSON.stringify(spot.data, null, 2));

  process.exit();
};

main();
