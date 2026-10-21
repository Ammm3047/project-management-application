import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Server } from 'socket.io';

import { connectDB } from './config/db.js';
import { initSocket } from './socket/index.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const { PORT = 5000, MONGO_URI, CLIENT_URL = 'http://localhost:5173' } = process.env;

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set. Refusing to start.');
  process.exit(1);
}

const app = express();
const server = http.createServer(app);

const io = new Server(server, { cors: { origin: CLIENT_URL, credentials: true } });
app.set('io', io); // controllers (Step 2) emit via req.app.get('io')

app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Step 2: mount routes here
// app.use('/api/auth', authRoutes);
// app.use('/api/boards', boardRoutes);

app.use(notFound);
app.use(errorHandler);

initSocket(io);

connectDB(MONGO_URI)
  .then(() => server.listen(PORT, () => console.log(`Server running on :${PORT}`)))
  .catch((err) => {
    console.error('Startup failed:', err.message);
    process.exit(1);
  });
