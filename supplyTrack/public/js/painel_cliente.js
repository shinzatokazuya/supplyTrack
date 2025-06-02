// public/js/painel_cliente.js
window.addEventListener('DOMContentLoaded', async () => {
    // Tenta pegar o usuário do localStorage
    const usuarioString = localStorage.getItem('usuario');
    const tabela = document.getElementById('tabelaDevolucoes');
    const welcomeMessage = document.querySelector('.container h1'); // Seleciona o h1 para personalizar

    if (!usuarioString) {
        alert('Sessão expirada ou não iniciada. Faça login novamente.');
        window.location.href = '/html/login.html';
        return;
    }

    let usuario;
    try {
        usuario = JSON.parse(usuarioString);
        if (welcomeMessage && usuario.nome) {
            welcomeMessage.textContent = `Bem-vindo(a), ${usuario.nome}!`;
        }
    } catch (e) {
        console.error('Erro ao parsear dados do usuário do localStorage:', e);
        alert('Erro nos dados da sessão. Faça login novamente.');
        window.location.href = '/html/login.html';
        return;
    }

    // Validação adicional do tipo de usuário
    if (usuario.tipoUsuario !== 'cliente') {
        alert('Acesso negado. Você não é um cliente.');
        localStorage.removeItem('usuario'); // Limpa dados inválidos
        window.location.href = '/html/login.html';
        return;
    }

    try {
        // Rota para o backend para buscar devoluções do cliente
        const resposta = await fetch(`/api/cliente/devolucoes/${usuario.idUsuario}`);

        if (!resposta.ok) {
            if (resposta.status === 404) { // Exemplo de tratamento para não encontrado
                tabela.innerHTML = '<tr><td colspan="4">Nenhuma devolução encontrada.</td></tr>';
                return;
            }
            throw new Error(`Erro HTTP: ${resposta.status}`);
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
        console.error('Erro ao carregar devoluções:', erro);
        tabela.innerHTML = '<tr><td colspan="4">Erro ao carregar as devoluções.</td></tr>';
    }
});
