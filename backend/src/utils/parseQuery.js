// HEADER: Utility helpers for safely parsing query parameters from strings.
function parsePositiveInt(value, defaultValue) {
  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed) || parsed <= 0) {
    return defaultValue;
  }

  return parsed;
}

function parseOptionalNumber(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function parseOptionalBoolean(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  const normalized = String(value).trim().toLowerCase();

  if (normalized === 'true') {
    return true;
  }

  if (normalized === 'false') {
    return false;
  }

  return undefined;
}

module.exports = {
  parsePositiveInt,
  parseOptionalNumber,
  parseOptionalBoolean
};

/*
BOTTOM EXPLANATION
- Responsibility: Converts query string values into safe numbers/booleans with sane defaults.
- Key syntax: `Number.isNaN(...)` prevents invalid math/filter behavior from bad user input.
- Common mistakes: Trusting raw query strings causes pagination and filter bugs.
*/
