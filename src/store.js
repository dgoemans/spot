import { createStore } from "redux";
import { data } from "./reducer";

export const makeStore = (baseUrl) =>
  createStore(data, { baseUrl, data: {}, errors: [] });
