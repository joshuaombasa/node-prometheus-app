const express = require('express');
const client = require('prom-client');

const app = express();
const PORT = 3000;

// Enable collection of default metrics (memory, CPU, etc.)
client.collectDefaultMetrics();

// Define a custom counter for HTTP requests
const HTTP_REQUEST_COUNTER = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

// Middleware to increment request counter
app.use((req, res, next) => {
  res.on('finish', () => {
    HTTP_REQUEST_COUNTER.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode,
    });
  });
  next();
});

// Root route
app.get('/', (req, res) => {
  res.send('Hello from Node.js!');
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
