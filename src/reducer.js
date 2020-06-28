import { buildUrl } from "./build-url";

export function commandQuery(state, action) {
  switch (action.type) {
    case "QUERY_COMPLETE":
      return {
        ...state,
        ...action.payload,
      };
      break;
    case "COMMAND_COMPLETE":
      return {
        ...state,
        ...action.payload,
      };
      break;
    default:
      return {
        ...state,
      };
  }
}

export function configure(state, action) {
  if (action.type === "SETUP") {
    const { baseUrl } = action.payload;
    return {
      ...state,
      baseUrl,
    };
  }

  return { ...state };
}

function errors(state, action) {
  if (action.type === "ERROR") {
    return [...state, action.payload];
  }
  return [...state];
}

export const reducer = (state, action) => {
  console.log(
    `Got Action:\n${JSON.stringify(
      action,
      null,
      2
    )}\nCurrent State:\n${JSON.stringify(state, null, 2)}`
  );
  return {
    config: configure(state.config, action),
    data: commandQuery(state.data, action),
    errors: errors(state.errors, action),
  };
};
