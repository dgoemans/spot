import { createStore, applyMiddleware } from 'redux';
import { reducer } from './reducer';
import { fetchMiddleware } from './fetch-middleware';

export const makeStore = (debug: boolean = false) => createStore(
  reducer,
  { config: { debug }, data: { loading: false }, errors: [] },
  applyMiddleware(fetchMiddleware),
);
