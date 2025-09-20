import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

// Routes
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import ahpRoutes from './routes/ahp.js';
import reportRoutes from './routes/reports.js';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:5173',
  credentials: true,
}));
// Attach a request ID for traceability
app.use((req, res, next) => {
  req.requestId = randomUUID();
  next();
});
// Add requestId to logs
morgan.token('id', (req) => req.requestId);
app.use(morgan(':id :method :url :status :res[content-length] - :response-time ms'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Make Prisma available to routes
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/ahp', ahpRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling (structured)
app.use((error, req, res, next) => {
  const status = error.status || 500;
  const code = error.code || (status === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR');
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[${req.requestId}]`, error);
  }
  res.status(status).json({
    ok: false,
    message: error.message || 'Internal server error',
    code,
    requestId: req.requestId,
    ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {}),
  });
});

// 404 handler (structured)
app.use('*', (req, res) => {
  res.status(404).json({ 
    ok: false,
    message: 'Route not found',
    code: 'NOT_FOUND',
    requestId: req.requestId,
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Handle Docker stop (SIGTERM) as well
process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully (SIGTERM)...');
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 AHP API available at http://localhost:${PORT}/api`);
});

export default app;