import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes';
import { authenticate } from './middlewares/auth.middleware';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// ─── Middlewares globais ──────────────────────────────────────────────────────

app.use(cors({
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  credentials: true,   // necessário para cookies httpOnly cruzarem origin
}));

app.use(express.json());
app.use(cookieParser());

// ─── Rotas públicas ───────────────────────────────────────────────────────────

app.use('/auth', authRoutes);

// ─── Rotas protegidas (exemplo) ───────────────────────────────────────────────
// Adicione aqui as rotas de dados do BaCen (TSK-11)
// app.use('/dados', authenticate, dadosRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

export default app;
