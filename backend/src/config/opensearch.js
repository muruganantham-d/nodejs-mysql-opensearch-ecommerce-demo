// HEADER: Initializes and exports the OpenSearch client for local node usage.
const { Client } = require('@opensearch-project/opensearch');

function buildNodeList(primaryNode) {
  const fallbackNode = 'http://127.0.0.1:9200';
  const nodes = [primaryNode || fallbackNode];

  try {
    const parsed = new URL(nodes[0]);

    // Windows often resolves localhost to IPv6 first; add IPv4 fallback for reliability.
    if (parsed.hostname === 'localhost') {
      nodes.push(`${parsed.protocol}//127.0.0.1:${parsed.port || '9200'}`);
    }
  } catch (error) {
    // If URL parsing fails, use safe fallback to avoid immediate boot failure.
    nodes.push(fallbackNode);
  }

  return [...new Set(nodes)];
}

const configuredNodes = buildNodeList(process.env.OPENSEARCH_URL || 'http://127.0.0.1:9200');

const opensearchClient = new Client({
  nodes: configuredNodes,
  maxRetries: 5,
  requestTimeout: 30000
});

// Expose configured nodes so health endpoint can show exact runtime target(s).
opensearchClient.configuredNodes = configuredNodes;

module.exports = opensearchClient;

/*
BOTTOM EXPLANATION
- Responsibility: Provides one shared OpenSearch client used by indexing and search services.
- Key syntax: `new Client({ nodes: [...] })` allows fallback URLs for better local reliability.
- Common mistakes: Using only `localhost` can fail on some Windows IPv6/loopback setups.
*/
