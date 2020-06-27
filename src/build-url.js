export const buildUrl = (base, endpoint, params) => {
  const basis = `${base}/${endpoint}`;
  const queryString = Object.entries(params).reduce((accum, current) => {
    return (
      accum + (accum.length === 0 ? "?" : "&") + `${current[0]}=${current[1]}`
    );
  }, "");
  return `${basis}${queryString}`;
};
