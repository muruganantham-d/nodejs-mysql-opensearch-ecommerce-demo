// HEADER: Controller for `/api/health` checking MySQL and OpenSearch connectivity.
const { sequelize } = require('../db');
const opensearchClient = require('../config/opensearch');

function extractBody(response) {
  return response && Object.prototype.hasOwnProperty.call(response, 'body') ? response.body : response;
}

async function checkHealth(req, res, next) {
  try {
    const mysql = { status: 'down', error: null };
    const opensearch = {
      status: 'down',
      error: null,
      nodes: opensearchClient.configuredNodes || [process.env.OPENSEARCH_URL || 'http://127.0.0.1:9200'],
      clusterStatus: null
    };

    try {
      await sequelize.authenticate();
      mysql.status = 'up';
    } catch (error) {
      mysql.error = error.message;
    }

    try {
      await opensearchClient.ping();
      const clusterHealthResponse = extractBody(await opensearchClient.cluster.health());
      opensearch.status = 'up';
      opensearch.clusterStatus = clusterHealthResponse.status || 'unknown';
    } catch (error) {
      opensearch.error = error.message;
    }

    const isHealthy = mysql.status === 'up' && opensearch.status === 'up';

    return res.status(isHealthy ? 200 : 503).json({
      success: isHealthy,
      timestamp: new Date().toISOString(),
      services: {
        mysql,
        opensearch
      },
      troubleshooting: {
        opensearch: [
          'Run: docker ps -a',
          'Run: curl http://127.0.0.1:9200',
          'If OpenSearch container exited, check logs: docker logs opensearch --tail 200',
          'For Windows reliability use OPENSEARCH_URL=http://127.0.0.1:9200'
        ]
      }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  checkHealth
};

/*
BOTTOM EXPLANATION
- Responsibility: Reports runtime dependency status so you can quickly diagnose local setup issues.
- Key syntax: Nested try/catch keeps one failed dependency from hiding the other dependency's status.
- Common mistakes: Returning only \"up/down\" without target node info makes connection debugging much harder.
*/
