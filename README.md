# Spot

![Node.js CI](https://github.com/dgoemans/spot/workflows/Node.js%20CI/badge.svg?branch=main&event=push)

# Installing

`npm install spot-store`

# Example

See code in the `example` directory for a sample usage (and a naive dummy backend)

```javascript
  // Initialize client with a base url 
  const spot = initializeSpot(apiBaseUrl);
  
  // Query a list endpoint and store the results under 'users'
  spot.query('fetch-users', { userId: 'id-one' }, ['users']);
  
  // Send a command to update a user
  spot.command('update-user', { userId: 'id-one', age: 7 });

  // Query a specific user and override the user stored at 'users/id-two'
  spot.query('fetch-user', { userId: 'id-two' }, ['users', 'id-two']);

```

# Contributing

Pull Requests are always welcome!

# License

Note that this is not free software if you are a company with a high enough revenue. Please see License.md.
