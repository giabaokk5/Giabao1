const app = require('./src/app');
const config = require('./src/config');

const server = app.listen(config.PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 HTCD Shop Backend Server is running!`);
  console.log(`📡 Port: ${config.PORT}`);
  console.log(`🌍 Environment: ${config.NODE_ENV}`);
  console.log(`🩺 Health check: http://localhost:${config.PORT}/api/health`);
  console.log(`===============================================`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
