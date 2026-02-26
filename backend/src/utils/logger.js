// HEADER: Lightweight logger utility to standardize log output format.
function formatMessage(level, message) {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] ${message}`;
}

const logger = {
  info(message) {
    console.log(formatMessage('INFO', message));
  },
  warn(message) {
    console.warn(formatMessage('WARN', message));
  },
  error(message, error) {
    console.error(formatMessage('ERROR', message));

    // Log full error details when available to make debugging easier.
    if (error) {
      console.error(error);
    }
  }
};

module.exports = logger;

/*
BOTTOM EXPLANATION
- Responsibility: Provides simple consistent logging methods (`info`, `warn`, `error`).
- Key syntax: `new Date().toISOString()` gives machine-readable timestamps.
- Common mistakes: Logging only custom text (without stack/object) hides root-cause details.
*/
