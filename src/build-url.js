export const buildUrl = (base, endpoint, params = {}) => {
  const basis = `${base}/${endpoint}`;
  const queryString = params
    ? Object.entries(params).reduce((accum, current) => (
      `${accum
          + (accum.length === 0 ? '?' : '&')
      }${current[0]}=${current[1]}`
    ), '')
    : '';
  return `${basis}${queryString}`;
};
