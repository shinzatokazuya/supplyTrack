// public/js/painel_cliente.js
window.addEventListener('DOMContentLoaded', async () => {
    const tabela = document.getElementById('tabelaDevolucoes');
    const welcomeMessage = document.querySelector('.container h1');

    // Tenta obter a string do usuário do localStorage
    const usuarioString = localStorage.getItem('usuario');
    console.log('Painel Cliente JS: Conteúdo de "usuario" no localStorage:', usuarioString); // Para depuração

    // Se não houver dados no localStorage, redireciona para o login
    if (!usuarioString) {
        alert('Sessão expirada ou não iniciada. Faça login novamente.');
        window.location.href = '/html/login.html';
        return; // Sai da função para evitar erros
    }

    let usuario;
    try {
        // Tenta parsear a string JSON para um objeto JavaScript
        usuario = JSON.parse(usuarioString);
        console.log('Painel Cliente JS: Usuário parseado:', usuario); // Para depuração

        // Se o objeto for válido, atualiza a mensagem de boas-vindas
        if (welcomeMessage && usuario.nome) {
            welcomeMessage.textContent = `Bem-vindo(a), ${usuario.nome}!`;
        }
    } catch (e) {
        // Se houver um erro ao parsear (string inválida), considera a sessão inválida
        console.error('Painel Cliente JS: Erro ao parsear dados do usuário do localStorage:', e);
        alert('Erro nos dados da sessão. Faça login novamente.');
        localStorage.removeItem('usuario'); // Opcional: limpa dados corrompidos
        window.location.href = '/html/login.html';
        return; // Sai da função
    }

    // Verifica se o tipo de usuário é o esperado para este painel
    if (usuario.tipoUsuario !== 'cliente') {
        alert('Acesso negado. Você não tem permissão para acessar este painel.');
        localStorage.removeItem('usuario'); // Limpa dados para forçar novo login com tipo correto
        window.location.href = '/html/login.html';
        return; // Sai da função
    }

    // ... (restante do seu código para buscar devoluções do cliente)
    try {
        const resposta = await fetch(`/api/cliente/devolucoes/${usuario.idUsuario}`);
        if (!resposta.ok) {
            const errorData = await resposta.json();
            throw new Error(errorData.message || `Erro HTTP: ${resposta.status}`);
        }
        const devolucoes = await resposta.json();

        if (!Array.isArray(devolucoes) || devolucoes.length === 0) {
            tabela.innerHTML = '<tr><td colspan="4">Nenhuma devolução encontrada.</td></tr>';
            return;
        }

        devolucoes.forEach(dev => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${new Date(dev.dataSolicitacao).toLocaleDateString('pt-BR')}</td>
                <td>${dev.status}</td>
                <td>
                    <button onclick="window.location.href='/html/ver_resposta.html?idDevolucao=${dev.idDevolucao}'">
                        Ver Resposta
                    </button>
                </td>
                <td>
                    <button onclick="window.location.href='/html/detalhes_devolucao.html?idDevolucao=${dev.idDevolucao}'">
                        Detalhes
                    </button>
                </td>
            `;
            tabela.appendChild(tr);
        });
    } catch (erro) {
        console.error('Erro ao carregar devoluções do cliente:', erro);
        tabela.innerHTML = '<tr><td colspan="4">Erro ao carregar as devoluções.</td></tr>';
    }
});
