// Payload gravado dentro do JWT
export interface JwtPayload {
  id: number;
  email: string;
  role: string;
}

// Usuário retornado do banco (sem senha)
export interface UserPublic {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

// Usuário completo (com hash) — somente uso interno
export interface UserRow extends UserPublic {
  password: string;
}

// Extensão do Request do Express para incluir o user decodificado
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
