const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initDB } = require('./config/db');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const houseRoutes = require('./routes/houseRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const consumptionRoutes = require('./routes/consumptionRoutes');
const forecastRoutes = require('./routes/forecastRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[HTTP] ${req.method} ${req.url}`);
    next();
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Electricity Consumption Forecasting & Energy Management System',
    timestamp: new Date().toISOString()
  });
});

const { submitContactMessage } = require('./controllers/adminController');

// Mount All API Routes
app.post('/api/contact', submitContactMessage);
app.use('/api/auth', authRoutes);
app.use('/api/house', houseRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/consumption', consumptionRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Serve static frontend build in production if built
const path = require('path');
const fs = require('fs');
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
async function startServer() {
  await initDB();

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`⚡ Electricity Forecasting & Management System API`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🔌 Health: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}

startServer();

module.exports = app;
