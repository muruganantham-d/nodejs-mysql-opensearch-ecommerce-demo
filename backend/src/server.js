// HEADER: Backend startup entrypoint that checks dependencies and starts HTTP server.
require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./db');
const opensearchClient = require('./config/opensearch');
const { waitForOpenSearch, ensureIndex } = require('./services/opensearchService');
const logger = require('./utils/logger');

async function bootstrap() {
  try {
    await sequelize.authenticate();
    logger.info('MySQL connection successful.');
  } catch (error) {
    logger.error('MySQL connection failed. API still starts, but DB endpoints will fail.', error);
  }

  try {
    const connectionInfo = await waitForOpenSearch({
      maxAttempts: Number(process.env.OPENSEARCH_PING_RETRIES) || 15,
      delayMs: Number(process.env.OPENSEARCH_PING_DELAY_MS) || 2000
    });
    logger.info(
      `OpenSearch connection successful after ${connectionInfo.attempts} attempt(s). Nodes: ${opensearchClient.configuredNodes.join(', ')}`
    );

    await ensureIndex();
    logger.info('OpenSearch index check complete.');
  } catch (error) {
    logger.error('OpenSearch index setup failed. Search endpoints may fail until OpenSearch is healthy.', error);
  }

  const port = Number(process.env.PORT) || 4000;

  app.listen(port, () => {
    logger.info(`Backend server listening on http://localhost:${port}`);
  });
}

bootstrap();

/*
BOTTOM EXPLANATION
- Responsibility: Runs startup tasks (DB ping + index ensure) and starts Express listener.
- Key syntax: Async bootstrap lets startup checks use `await` before opening server port.
- Common mistakes: Crashing hard on optional dependency startup makes local debugging slower.
*/
