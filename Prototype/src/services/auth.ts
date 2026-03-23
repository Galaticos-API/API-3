const API_URL = 'http://localhost:3000/api/auth';

// Função para registrar novo usuário
export async function registrarUsuario(email: string, senha: string) {
    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
    });
    return await response.json();
}

// Função para fazer login e salvar o token
export async function fazerLogin(email: string, senha: string) {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
    });
    const data = await response.json();

    // Se o login der certo (status 200), salva o token no sessionStorage com a chave correta
    if (response.ok) {
        sessionStorage.setItem('dm_token', data.token);
    }

    return { status: response.status, data };
}

// Função para acessar uma rota protegida usando o token salvo
export async function buscarPerfil() {
    const token = sessionStorage.getItem('dm_token');

    if (!token) {
        return { erro: 'Usuário não está logado' };
    }

    const response = await fetch(`${API_URL}/perfil`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    return await response.json();
}

// Função para sair (logout)
export function fazerLogout() {
    sessionStorage.removeItem('dm_token');
}