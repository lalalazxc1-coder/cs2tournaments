const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
app.set('trust proxy', 1); // Trust first proxy (Nginx)
const PORT = process.env.NODE_PORT || 5000;

// Import database connection and models
const { sequelize } = require('./config/database');
require('./models'); // Initialize models and associations

// Import WebSocket
const { initializeWebSocket } = require('./websocket');

// Import routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const userRoutes = require('./routes/user');
// const tournamentRoutes = require('./routes/tournament'); // Removed/Replaced
const adminRoutes = require('./routes/admin');

const compression = require('compression');
const RedisStore = require('connect-redis').default;
const { createClient } = require('redis');

// Initialize Redis Client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});
redisClient.connect().catch(console.error);

// Middleware
app.use(compression()); // Compress all responses
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Logger
const morgan = require('morgan');
const logger = require('./utils/logger');

const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  {
    stream: {
      // Configure Morgan to use our custom logger with the http severity
      write: (message) => logger.http(message.trim()),
    },
  }
);

app.use(morganMiddleware);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/api/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Session middleware (required for Passport)
const session = require('express-session');
const passport = require('passport');
require('./config/passport');

if (!process.env.SESSION_SECRET) {
  console.warn('WARNING: SESSION_SECRET is not defined in environment variables. Sessions may not be secure.');
}

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET || require('crypto').randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Secure in production
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Swagger Documentation (Only in Development)
if (process.env.NODE_ENV !== 'production') {
  const swaggerUi = require('swagger-ui-express');
  const swaggerSpecs = require('./config/swagger');

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
  console.log('📄 Swagger documentation available at /api-docs');
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/user', userRoutes);
app.use('/api/lobbies', require('./routes/lobby')); // Renamed from tournaments
app.use('/api/teams', require('./routes/team')); // New
app.use('/api/upload', require('./routes/upload')); // New upload route
app.use('/api/tournaments', require('./routes/tournaments')); // New real tournaments
app.use('/api/admin/matches', require('./routes/admin/matches')); // New
app.use('/api/admin', adminRoutes);
app.use('/api/players', require('./routes/players'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/notifications', require('./routes/notification'));

// Health check
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await sequelize.authenticate();

    // Check if tables exist
    const [lobbiesResult] = await sequelize.query("SHOW TABLES LIKE 'lobbies'");
    const [playersResult] = await sequelize.query("SHOW TABLES LIKE 'player_summary'");
    const [usersResult] = await sequelize.query("SHOW TABLES LIKE 'users'");

    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        tables: {
          lobbies: lobbiesResult.length > 0,
          player_summary: playersResult.length > 0,
          users: usersResult.length > 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: error.message
      }
    });
  }
});

// Error handling middleware
const errorHandler = require('./middleware/errorMiddleware');
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Database schema is managed through migrations in production
    // To update schema, run: npm run migrate
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔄 Syncing database models (development mode)...');
      try {
        await sequelize.sync({ alter: false });
      } catch (syncError) {
        console.error('Sync error (ignoring):', syncError.message);
      }
      console.log('✅ Database models synchronized.');
    } else {
      console.log('ℹ️  Database schema managed by migrations. Run "npm run migrate" to update.');
    }


    // Create HTTP server and initialize WebSocket
    const http = require('http');
    const httpServer = http.createServer(app);
    const io = initializeWebSocket(httpServer);
    console.log('🌐 WebSocket server initialized');

    httpServer.listen(PORT, () => {
      console.log(`🚀 CS2 Tournament Backend running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔌 WebSocket ready for connections`);
    });
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
}

startServer();

// Force restart trigger 5

module.exports = app;
