import fetchMock from 'jest-fetch-mock';
import * as crypto from 'crypto';

import { initializeSpot, Spot } from '../src';

Object.defineProperty(global, 'crypto', {
  value: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getRandomValues: (arr:any) => crypto.randomBytes(arr.length),
  },
});

interface User {
  name: string;
  role: string;
  age: number;
}

interface DataType {
  users: {
    [k: string]: User
  }
}

let users: { [k: string]: User } = {};

const baseUrl = 'http://example.com';
const authToken = 'AUTH_TOKEN';

const waitForLoadingDone = (spot: Spot<DataType>) => new Promise(spot.subscribeOnce);

describe('spot', () => {
  beforeAll(() => {
    fetchMock.enableMocks();
  });

  beforeEach(() => {
    users = {
      'id-one': {
        name: 'Spot',
        role: 'Good Boy',
        age: 7,
      },
      'id-two': {
        name: 'Rufus',
        role: 'Home Security',
        age: 3,
      },
    };
    fetchMock.resetMocks();
    fetchMock.doMock();
    fetchMock.mockIf(/^http:\/\/example.com.*$/, async (req) => {
      if (req.url.startsWith(`${baseUrl}/fetch-user`)) {
        const tokens = req.url.split('=');
        return {
          status: 200,
          body: JSON.stringify(users[tokens[1]]),
        };
      } if (req.url.startsWith(`${baseUrl}/update-user`)) {
        const json = await req.json();
        users[json.userId].age = json.age;
        return {
          body: '',
          status: 200,
        };
      } if (req.url.startsWith(`${baseUrl}/invalid-json`)) {
        return {
          body: '<>.aspojdas <XMC98yyfdbshbx hjbgas',
          status: 200,
        };
      } if (req.url.startsWith(`${baseUrl}/list-users`)) {
        return {
          status: 200,
          body: JSON.stringify(users),
        };
      } if (req.url.startsWith(`${baseUrl}/delete-user`)) {
        const json = await req.json();
        delete users[json.userId];
        return {
          status: 200,
          body: '',
        };
      } if (req.url.startsWith(`${baseUrl}/authorized-endpoint`)) {
        if (req.headers.get('authorization') === authToken) {
          return {
            body: '{}',
            status: 200,
          };
        }
        return {
          body: 'NOT AUTHORIZED',
          status: 401,
        };
      }
      return {
        status: 404,
        body: 'Not Found',
      };
    });
  });

  it('Can fetch data', async () => {
    const spot = initializeSpot<DataType>(baseUrl);

    {
      spot.query('fetch-user', { userId: 'id-one' }, ['users', 'id-one']);
      expect(spot.data).toMatchObject({ loading: true });

      await waitForLoadingDone(spot);

      const expectedResult = {
        users: {
          'id-one': { age: 7, name: 'Spot', role: 'Good Boy' },
        },
        loading: false,
      };

      expect(spot.data).toMatchObject(expectedResult);
    }

    {
      await spot.query('fetch-user', { userId: 'id-two' }, ['users', 'id-two']);

      const expectedResult = {
        users: {
          'id-one': { age: 7, name: 'Spot', role: 'Good Boy' },
          'id-two': { age: 3, name: 'Rufus', role: 'Home Security' },
        },
        loading: false,
      };
      expect(spot.data).toMatchObject(expectedResult);
    }
  });

  it('Adds errors when the fetch fails', async () => {
    const spot = initializeSpot<DataType>(baseUrl);

    spot.query('invalid-json');
    expect(spot.data).toMatchObject({ loading: true });

    await waitForLoadingDone(spot);

    expect(spot.data).toMatchObject({ loading: false });
    expect(spot.errors).toHaveLength(1);
    expect(spot.errors[0]).toMatchSnapshot();
  });

  it('Can execute commands data', async () => {
    const spot = initializeSpot<DataType>(baseUrl);

    {
      await spot.query('fetch-user', { userId: 'id-two' }, ['users', 'id-two']);

      const expectedResult = {
        users: {
          'id-two': { age: 3, name: 'Rufus', role: 'Home Security' },
        },
        loading: false,
      };
      expect(spot.data).toMatchObject(expectedResult);
    }

    await spot.command('update-user', { userId: 'id-two', age: 4 });

    {
      await spot.query('fetch-user', { userId: 'id-two' }, ['users', 'id-two']);

      const expectedResult = {
        users: {
          'id-two': { age: 4, name: 'Rufus', role: 'Home Security' },
        },
        loading: false,
      };
      expect(spot.data).toMatchObject(expectedResult);
    }
  });

  it('Can look up data by path', async () => {
    const spot = initializeSpot<DataType>(baseUrl);

    await spot.query('fetch-user', { userId: 'id-two' }, ['users', 'id-two']);

    const user = spot.get(['users', 'id-two']);
    expect(user).toMatchObject({ age: 3, name: 'Rufus', role: 'Home Security' });

    const sameuser = (spot.data).users['id-two'];
    expect(sameuser).toMatchObject({ age: 3, name: 'Rufus', role: 'Home Security' });
  });

  it('Can delete data', async () => {
    const spot = initializeSpot<DataType>(baseUrl);

    {
      await spot.query('list-users', {}, ['users']);

      const expectedResult = {
        users: {
          'id-one': { age: 7, name: 'Spot', role: 'Good Boy' },
          'id-two': { age: 3, name: 'Rufus', role: 'Home Security' },
        },
        loading: false,
      };

      expect(spot.data).toMatchObject(expectedResult);
    }

    {
      await spot.command('delete-user', { userId: 'id-two' });

      await spot.query('list-users', {}, ['users']);

      const expectedResult = {
        users: {
          'id-one': { age: 7, name: 'Spot', role: 'Good Boy' },
        },
        loading: false,
      };

      expect(spot.data).toMatchObject(expectedResult);
    }
  });

  it('Can run multiple queries with the subscribe once', async () => {
    const spot = initializeSpot<DataType>(baseUrl);

    spot.query('fetch-user', { userId: 'id-two' }, ['users', 'id-two']);
    spot.query('fetch-user', { userId: 'id-one' }, ['users', 'id-one']);

    expect(spot.data.loading).toBe(true);
    expect(Object.keys(spot.data.spot.active)).toHaveLength(2);

    await waitForLoadingDone(spot);

    expect(Object.keys(spot.data.spot.active)).toHaveLength(0);
    expect(spot.data.loading).toBe(false);
    expect(spot.data.users['id-two']).toMatchObject({ age: 3, name: 'Rufus', role: 'Home Security' });
    expect(spot.data.users['id-one']).toMatchObject({ age: 7, name: 'Spot', role: 'Good Boy' });
  });

  it('Inserts authorization headers data', async () => {
    const spot = initializeSpot<DataType>(baseUrl);

    await spot.query('authorized-endpoint', {}, ['auth'], { authorization: 'WRONG TOKEN' });
    expect(spot.errors).toHaveLength(1);
    expect(spot.errors[0]).toBe('Error: QUERY FAILED 401: Unauthorized');

    await spot.query('authorized-endpoint', {}, ['auth'], { authorization: authToken });
    const successResult = {
      auth: {},
      loading: false,
    };

    expect(spot.data).toMatchObject(successResult);
  });
});
