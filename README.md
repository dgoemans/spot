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
  await spot.query('fetch-users', {}, ['users']);

  // Access the data
  spot.data.users['id-one'].name
  
  // Send a command to update a user
  await spot.command('update-user', { userId: 'id-one', age: 7 }, /* OPTIONAL */ { method: 'POST' });

  // Query a specific user and override the user stored at 'users/id-one'
  spot.query('fetch-user', { userId: 'id-one' }, ['users', 'id-one']);

  // Instead of awaiting you can also use subscription callback
  spot.subscribeOnce(() => {
    // Access the stored data
    spot.data.users['id-one'].name;
  })
  
```

## Listing approach

To use list results from an api, a convenient method is to use a dictionary with the IDs as the keys. 
This allows for convenient fetching in the form of:

```javascript
  await spot.query('fetch-users', {}, ['users']);
```

assuming the data returned is something like: 

```json
[
  "id-one": { 
    "name": "Spot",
    "age": 7
  },
  "id-two": { 
    "name": "Rufus",
    "age": 4
  }
]
```


# Contributing

Pull Requests are always welcome!

# License

Note that this is not free software if you are a company with a high enough revenue. Please see License.md.
