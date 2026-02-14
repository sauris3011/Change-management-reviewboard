/**
 * Change Management System - Main Server
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./database/init');
const { initializeOpenAI } = require('./services/llmService');

// Import routes
const changesRoutes = require('./routes/changes');
const historyRoutes = require('./routes/history');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      database: 'connected',
      llm: process.env.OPENAI_API_KEY ? 'configured' : 'not_configured'
    }
  });
});

// API Routes
app.use('/api/v1', changesRoutes);
app.use('/api/v1/changes', historyRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    available_routes: [
      'POST /api/v1/evaluate-change',
      'GET /api/v1/predictions/:id',
      'GET /api/v1/changes/history',
      'GET /api/v1/changes/:id',
      'GET /api/v1/changes/stats/summary',
      'GET /health'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('Initializing database...');
    await initDatabase();
    console.log('Database initialized successfully');

    // Initialize OpenAI
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey && openaiKey !== 'your_openai_api_key_here') {
      console.log('Initializing OpenAI...');
      initializeOpenAI(openaiKey);
      console.log('OpenAI initialized successfully');
    } else {
      console.log('OpenAI API key not configured - using mock LLM responses');
      console.log('Set OPENAI_API_KEY in .env file to enable real LLM integration');
    }

    app.listen(PORT, () => {
      console.log('');
      console.log('='.repeat(60));
      console.log(`Change Management System Backend`);
      console.log('='.repeat(60));
      console.log(`Server running on: http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`LLM Service: ${openaiKey && openaiKey !== 'your_openai_api_key_here' ? 'OpenAI' : 'Mock'}`);
      console.log('');
      console.log('Available endpoints:');
      console.log(`  POST   http://localhost:${PORT}/api/v1/evaluate-change`);
      console.log(`  GET    http://localhost:${PORT}/api/v1/predictions/:id`);
      console.log(`  GET    http://localhost:${PORT}/api/v1/changes/history`);
      console.log(`  GET    http://localhost:${PORT}/api/v1/changes/:id`);
      console.log(`  GET    http://localhost:${PORT}/api/v1/changes/stats/summary`);
      console.log(`  GET    http://localhost:${PORT}/health`);
      console.log('='.repeat(60));
      console.log('');
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();
