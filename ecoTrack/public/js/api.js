/*
 * API.JS - Módulo de Comunicação com o Backend
 *
 * Este arquivo contém todas as funções necessárias para fazer requisições
 * HTTP ao servidor backend. Ele abstrai a complexidade do fetch() e
 * fornece uma interface simples para o resto da aplicação.
 *
 * Todas as páginas que precisam se comunicar com o servidor devem
 * importar este arquivo primeiro.
 */

const API_BASE_URL = 'http://localhost:3001';

/**
 * Função auxiliar para fazer requisições HTTP
 * Esta função é usada internamente pelas outras funções deste arquivo
 *
 * @param {string} endpoint - O caminho da API (exemplo: '/usuarios')
 * @param {Object} options - Opções do fetch (método, headers, body, etc)
 * @returns {Promise} - Promessa que resolve com os dados da resposta
 */

async function fazerRequisicao(endpoint, options = {}) {
    try {
        // Monta a URL completa usando a base e o endpoint
        const url = `${API_BASE_URL}${endpoint}`;

        // Faz a REQUISIÇÃO HTTP
        const resposta = await fetch(url, options);

        // Extrai o corpo da resposta como JSON
        const dados = await resposta.json();

        // Se a resposta NÃO foi bem sucedida
        if (!resposta.ok) {
            throw new Error(dados.message || 'Erro na requisição');
        }

        return dados;
    } catch (erro) {
        // Registra o erro na console
        console.log('Erro na requisição:', erro);
        throw erro;
    }
}

/**
 * Faz uma requisição GET para buscar dados
 * Use esta função quando quiser LER/BUSCAR dados do servidor
 *
 * Exemplo de uso:
 * const usuarios = await apiGet('/usuarios');
 * const usuario = await apiGet('/usuarios/123');
 *
 * @param {string} endpoint - Caminho do recurso na API
 * @returns {Promise} - Dados retornados pelo servidor
 */
async function apiGet(endpoint) {
    return fazerRequisicao(endpoint, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

/**
 * Faz uma requisição POST para criar novos dados
 * Use esta função quando quiser CRIAR/ADICIONAR um novo registro
 *
 * Exemplo de uso:
 * const novoUsuario = await apiPost('/usuarios', {
 *   nome: 'João',
 *   email: 'joao@example.com'
 * });
 *
 * @param {string} endpoint - Caminho do recurso na API
 * @param {Object} dados - Objeto com os dados a serem enviados
 * @returns {Promise} - Resposta do servidor (geralmente contém ID do novo registro)
 */
async function apiPost(endpoint, dados) {
    return fazerRequisicao(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
    });
}

/**
 * Faz uma requisição PUT para atualizar dados existentes
 * Use esta função quando quiser ATUALIZAR/EDITAR um registro existente
 *
 * Exemplo de uso:
 * await apiPut('/usuarios/123', {
 *   nome: 'João Silva',
 *   email: 'joao.silva@example.com'
 * });
 *
 * @param {string} endpoint - Caminho do recurso (incluindo ID)
 * @param {Object} dados - Objeto com os dados atualizados
 * @returns {Promise} - Resposta do servidor
 */
async function apiPut(endpoint, dados) {
    return fazerRequisicao(endpoint, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
    })
}

/**
 * Faz uma requisição DELETE para remover dados
 * Use esta função quando quiser DELETAR/REMOVER um registro
 *
 * Exemplo de uso:
 * await apiDelete('/usuarios/123');
 *
 * @param {string} endpoint - Caminho do recurso (incluindo ID)
 * @returns {Promise} - Resposta do servidor
 */
async function apiDelete(endpoint) {
    return fazerRequisicao(endpoint, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

/**
 * Mostra uma mensagem de erro ao usuário
 * Esta função procura por um elemento com ID 'mensagem-erro' na página
 * e exibe a mensagem de erro nele. Se não existir, usa alert()
 *
 * @param {string|Error} erro - Mensagem de erro ou objeto Error
 */
function mostrarErro(erro) {
    // Extrai a mensagem de erro
    const mensagem = errp.message || erro.toString();

    // Procura por um elemento na página para exibir o erro
    const elementoErro = document.getElementById('mensagem-erro');

    if (elementoErro) {
        elementoErro.textContent = mensagem;
        elementoErro.classList.remove('hidden');
        elementoErro.classList.add('alerta-erro');

        // Remove a mensagem após 5 segundos
        setTimeout(() => {
            elementoErro.classList.add('hidden');
        }, 5000);
    } else {
        alert('Erro: ' + mensagem);
    }

    // Registrar na console
    console.log('Erro: ' + mensagem);
}

/**
 * Mostra uma mensagem de sucesso ao usuário
 * Similar ao mostrarErro, mas para mensagens positivas
 *
 * @param {string} mensagem - Mensagem de sucesso
 */
function mostrarSucesso(mensagem) {
    const elementoSucesso = document.getElementById('mensagem-sucesso');

    if (elementoSucesso) {
        elementoSucesso.textContent = mensagem;
        elementoSucesso.classList.remove('hidden');
        elementoSucesso.classList.add('alerta-sucesso');

        // Remove mensagem após 3 segundos
        setTimeout(() => {
            elementoSucesso.classList.add('hidden');
        }, 3000);
    } else {
        alert(mensagem);
    }
}

/**
 * Funções específicas para autenticação
 * Estas são funções auxiliares para login, logout e verificação de sessão
 */

/**
 * Faz login do usuário
 * Envia email e senha para o servidor e armazena os dados do usuário
 *
 * @param {string} email - Email do usuário
 * @param {string} senha - Senha do usuário
 * @returns {Promise} - Dados do usuário autenticado
 */
async function fazerLogin(email, senha) {
    try {
        // Envia credencias para o servidor
        const resposta = await apiPost('/usuarios/login', { email, senha });

        // Se o login foi bem sucedido, salva os dados
        salvarSessao(resposta.usuario);

        return resposta.usuario;
    } catch (erro) {
        throw new Error('Email ou senha incorretos');
    }
}

/**
 * Salva os dados do usuário logado no localStorage
 * Isso permite que o usuário permaneça logado mesmo após fechar o navegador
 *
 * @param {Object} usuario - Dados do usuário
 */
function salvarSessao(usuario) {
    localStorage.setItem('ecotrack_usuario', JSON.stringify(usuario));
}

/**
 * Recupera os dados do usuário logado do localStorage
 *
 * @returns {Object|null} - Dados do usuário ou null se não estiver logado
 */
function obterSessao() {
    const dados = localStorage.getItem('ecotrack_usuario');
    return dados ? JSON.parse(dados) : null;
}

/**
 * Remove os dados do usuário do localStorage (logout)
 */
function limparSessao() {
    localStorage.removeItem('ecotrack_usuario');
}

/**
 * Verifica se há um usuário logado e redireciona para login se não houver
 * Use esta função no início de páginas que requerem autenticação
 *
 * @returns {Object|null} - Dados do usuário logado ou null
 */
function verificarAutenticacao() {
    const usuario = obterSessao();

    // Se não há usuário logado, redireciona para página de login
    if (!usuario) {
        window.location.href = '/public/html/login.html';
        return null;
    }

    return usuario;
}

/**
 * Faz logout do usuário e redireciona para tela de login
 */
function fazerLogout() {
    limparSessao();
    window.location.href = '/public/html/login.html';
}
