import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';

/**
 * Middleware `authenticate`
 * Protege rotas que exigem login.
 * Lê o token do header: Authorization: Bearer <token>
 *
 * Uso:
 *   router.get('/dados', authenticate, dadosController)
 *   app.use('/dashboard', authenticate, dashboardRoutes)
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token de acesso não fornecido.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err: any) {
    const expired = err?.name === 'TokenExpiredError';
    res.status(401).json({
      error: expired
        ? 'Token expirado. Renove via POST /auth/refresh.'
        : 'Token inválido.',
    });
  }
}

/**
 * Middleware `authorize`
 * Restringe rotas por role (ex: 'admin').
 *
 * Uso:
 *   router.delete('/user/:id', authenticate, authorize('admin'), deleteUser)
 */
export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      return;
    }
    next();
  };
}
