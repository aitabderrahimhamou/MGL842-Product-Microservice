const express = require("express");
const client = require("prom-client");

const app = express();

// Expose the /metrics endpoint for Prometheus to scrape
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  return res.send(await client.register.metrics());
});

module.exports = function startMetricsServer() {

  // Collect default metrics like CPU and memory usage
  client.collectDefaultMetrics();

  // Start the metrics server on port 9500
  app.listen(9500, () => {
    console.log("Metrics server started at http://localhost:9500");
  });
};



