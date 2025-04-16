const express = require('express');
const client = require('prom-client');

const app = express();
const port = 3000;

// Enable collection of default metrics (like memory, CPU usage)
client.collectDefaultMetrics();

// Create a custom counter metric
const requestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

// Middleware to count requests
app.use((req, res, next) => {
  res.on('finish', () => {
    requestCounter.inc({
      method: req.method,
      route: req.route ? req.route.path : req.path,
      status: res.statusCode,
    });
  });
  next();
});

// Sample route
app.get('/', (req, res) => {
  res.send('Hello from Node.js!');
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// Start server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
