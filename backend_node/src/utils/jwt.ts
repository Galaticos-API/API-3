import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

const ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET  ?? 'dev_access_secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'dev_refresh_secret';
const ACCESS_EXPIRY  = process.env.JWT_ACCESS_EXPIRY  ?? '15m';
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY ?? '7d';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Gera um par access + refresh token para o usuário.
 */
export function generateTokens(payload: JwtPayload): TokenPair {
  const accessToken = jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRY as jwt.SignOptions['expiresIn'],
  });

  const refreshToken = jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRY as jwt.SignOptions['expiresIn'],
  });

  return { accessToken, refreshToken };
}

/**
 * Verifica e decodifica um access token.
 * Lança JsonWebTokenError ou TokenExpiredError em caso de falha.
 */
export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, ACCESS_SECRET) as JwtPayload;
}

/**
 * Verifica e decodifica um refresh token.
 */
export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, REFRESH_SECRET) as JwtPayload;
}
