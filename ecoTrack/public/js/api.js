/**
 * API.JS - Módulo de Comunicação com o Backend (ATUALIZADO)
 *
 * Este arquivo foi atualizado para usar as novas rotas de autenticação
 * do backend, com validação adequada tanto no frontend quanto no backend.
 */

const API_BASE_URL = 'http://localhost:3001';

/**
 * Função auxiliar para fazer requisições HTTP
 */
async function fazerRequisicao(endpoint, options = {}) {
    try {
        const url = `${API_BASE_URL}${endpoint}`;
        const resposta = await fetch(url, options);
        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.message || 'Erro na requisição');
        }

        return dados;
    } catch (erro) {
        console.error('Erro na requisição:', erro);
        throw erro;
    }
}

/**
 * Requisição GET
 */
async function apiGet(endpoint) {
    return fazerRequisicao(endpoint, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });
}

/**
 * Requisição POST
 */
async function apiPost(endpoint, dados) {
    return fazerRequisicao(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });
}

/**
 * Requisição PUT
 */
async function apiPut(endpoint, dados) {
    return fazerRequisicao(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });
}

/**
 * Requisição DELETE
 */
async function apiDelete(endpoint) {
    return fazerRequisicao(endpoint, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
    });
}

/**
 * Mostra mensagem de erro ao usuário
 */
function mostrarErro(erro) {
    const mensagem = erro.message || erro.toString();
    const elementoErro = document.getElementById('mensagem-erro');

    if (elementoErro) {
        elementoErro.textContent = mensagem;
        elementoErro.classList.remove('hidden');
        elementoErro.classList.add('alerta-erro');

        setTimeout(() => {
            elementoErro.classList.add('hidden');
        }, 5000);
    } else {
        alert('Erro: ' + mensagem);
    }

    console.error('Erro:', erro);
}

/**
 * Mostra mensagem de sucesso ao usuário
 */
function mostrarSucesso(mensagem) {
    const elementoSucesso = document.getElementById('mensagem-sucesso');

    if (elementoSucesso) {
        elementoSucesso.textContent = mensagem;
        elementoSucesso.classList.remove('hidden');
        elementoSucesso.classList.add('alerta-sucesso');

        setTimeout(() => {
            elementoSucesso.classList.add('hidden');
        }, 3000);
    } else {
        alert(mensagem);
    }
}

// ============================================
// FUNÇÕES DE AUTENTICAÇÃO (ATUALIZADAS)
// ============================================

/**
 * Faz login do usuário usando a nova rota /auth/login
 *
 * MUDANÇA IMPORTANTE: Agora usa /auth/login em vez de /usuarios/login
 * e recebe uma resposta estruturada do backend
 */
async function fazerLogin(email, senha) {
    try {
        // Envia credenciais para a nova rota de autenticação
        const resposta = await apiPost('/auth/login', { email, senha });

        // Verifica se o login foi bem-sucedido
        if (resposta.success && resposta.usuario) {
            // Salva os dados do usuário no localStorage
            salvarSessao(resposta.usuario);
            return resposta.usuario;
        } else {
            throw new Error(resposta.message || 'Erro ao fazer login');
        }
    } catch (erro) {
        // Se for erro de autenticação, mantém a mensagem original
        if (erro.message.includes('incorretos') || erro.message.includes('inválido')) {
            throw erro;
        }
        // Caso contrário, usa mensagem genérica
        throw new Error('Email ou senha incorretos');
    }
}

/**
 * Registra um novo usuário usando a rota /auth/register
 *
 * MUDANÇA IMPORTANTE: Agora usa /auth/register em vez de /usuarios
 * e inclui validação no backend
 */
async function fazerCadastro(dados) {
    try {
        // Envia dados para a rota de registro
        const resposta = await apiPost('/auth/register', dados);

        // Verifica se o cadastro foi bem-sucedido
        if (resposta.success && resposta.usuario) {
            return resposta.usuario;
        } else {
            throw new Error(resposta.message || 'Erro ao fazer cadastro');
        }
    } catch (erro) {
        // Repassa o erro com a mensagem do backend
        throw new Error(erro.message || 'Erro ao criar conta');
    }
}

/**
 * Salva os dados do usuário no localStorage
 */
function salvarSessao(usuario) {
    localStorage.setItem('ecotrack_usuario', JSON.stringify(usuario));
}

/**
 * Recupera os dados do usuário do localStorage
 */
function obterSessao() {
    const dados = localStorage.getItem('ecotrack_usuario');
    return dados ? JSON.parse(dados) : null;
}

/**
 * Remove os dados do usuário do localStorage
 */
function limparSessao() {
    localStorage.removeItem('ecotrack_usuario');
}

/**
 * Verifica se há um usuário logado e redireciona se não houver
 */
function verificarAutenticacao() {
    const usuario = obterSessao();

    if (!usuario) {
        window.location.href = '/public/html/login.html';
        return null;
    }

    return usuario;
}

/**
 * Faz logout e redireciona para tela de login
 */
function fazerLogout() {
    limparSessao();
    window.location.href = '/public/html/login.html';
}
