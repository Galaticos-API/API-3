import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import db from '../database/db';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import { authenticate } from '../middlewares/auth.middleware';
import { UserRow, UserPublic } from '../types';

const router = Router();

// ─── Helpers ─────────────────────────────────────────────────────────────────

const COOKIE_OPTIONS = {
  httpOnly: true,                                      // inacessível ao JS do browser
  secure: process.env.NODE_ENV === 'production',       // HTTPS em produção
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,                    // 7 dias em ms
};

function setRefreshCookie(res: Response, token: string): void {
  res.cookie('refreshToken', token, COOKIE_OPTIONS);
}

// ─── POST /auth/register ─────────────────────────────────────────────────────

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Campos obrigatórios: name, email, password.' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: 'Senha deve ter ao menos 8 caracteres.' });
      return;
    }

    // Verifica e-mail duplicado
    const existing = db
      .prepare('SELECT id FROM users WHERE email = ?')
      .get(email);

    if (existing) {
      res.status(409).json({ error: 'E-mail já cadastrado.' });
      return;
    }

    const hash = await bcrypt.hash(password, 12);

    const result = db
      .prepare(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?) RETURNING id, name, email, role, created_at'
      )
      .get(name, email, hash, 'analyst') as UserPublic;

    const tokens = generateTokens({ id: result.id, email: result.email, role: result.role });
    setRefreshCookie(res, tokens.refreshToken);

    res.status(201).json({
      user: result,
      accessToken: tokens.accessToken,
    });
  } catch (err) {
    console.error('[POST /auth/register]', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// ─── POST /auth/login ─────────────────────────────────────────────────────────

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      res.status(400).json({ error: 'Campos obrigatórios: email, password.' });
      return;
    }

    const user = db
      .prepare('SELECT * FROM users WHERE email = ?')
      .get(email) as UserRow | undefined;

    // Mesmo erro para e-mail não encontrado e senha errada (evita user enumeration)
    if (!user) {
      res.status(401).json({ error: 'Credenciais inválidas.' });
      return;
    }

    const senhaCorreta = await bcrypt.compare(password, user.password);
    if (!senhaCorreta) {
      res.status(401).json({ error: 'Credenciais inválidas.' });
      return;
    }

    const tokens = generateTokens({ id: user.id, email: user.email, role: user.role });
    setRefreshCookie(res, tokens.refreshToken);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken: tokens.accessToken,
    });
  } catch (err) {
    console.error('[POST /auth/login]', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// ─── POST /auth/refresh ───────────────────────────────────────────────────────

router.post('/refresh', (req: Request, res: Response): void => {
  try {
    const token: string | undefined = req.cookies?.refreshToken;

    if (!token) {
      res.status(401).json({ error: 'Refresh token ausente.' });
      return;
    }

    const decoded = verifyRefreshToken(token);

    // Confirma que o usuário ainda existe no banco
    const user = db
      .prepare('SELECT id, email, role FROM users WHERE id = ?')
      .get(decoded.id) as { id: number; email: string; role: string } | undefined;

    if (!user) {
      res.clearCookie('refreshToken');
      res.status(401).json({ error: 'Usuário não encontrado.' });
      return;
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Rotation: emite novo refresh token a cada renovação
    setRefreshCookie(res, newRefreshToken);

    res.json({ accessToken });
  } catch (err: any) {
    res.clearCookie('refreshToken');
    res.status(403).json({ error: 'Refresh token inválido ou expirado. Faça login novamente.' });
  }
});

// ─── POST /auth/logout ────────────────────────────────────────────────────────

router.post('/logout', (_req: Request, res: Response): void => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logout realizado com sucesso.' });
});

// ─── GET /auth/me (rota protegida) ────────────────────────────────────────────

router.get('/me', authenticate, (req: Request, res: Response): void => {
  try {
    const user = db
      .prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?')
      .get(req.user!.id) as UserPublic | undefined;

    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado.' });
      return;
    }

    res.json({ user });
  } catch (err) {
    console.error('[GET /auth/me]', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

export default router;
