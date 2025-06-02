// public/js/painel_cliente.js
document.addEventListener('DOMContentLoaded', async () => {
    const tabela = document.getElementById('tabelaDevolucoes');
    const welcomeMessage = document.querySelector('.container h1');

    const usuarioString = localStorage.getItem('usuario');
    if (!usuarioString) {
        alert('Sessão expirada. Faça login novamente.');
        window.location.href = '/html/login.html';
        return;
    }
    let usuario;
    try {
        usuario = JSON.parse(usuarioString);
    } catch (e) {
        console.error('Erro ao parsear dados do usuário:', e);
        alert('Erro nos dados da sessão. Faça login novamente.');
        window.location.href = '/html/login.html';
        return;
    }

    if (usuario.tipoUsuario !== 'cliente') { // Apenas clientes podem acessar esta tela
        alert('Acesso negado. Esta página é apenas para clientes.');
        window.location.href = '/html/painel_gestor.html';
        return;
    }

    if (welcomeMessage && usuario.nome) {
        welcomeMessage.textContent = `Bem-vindo(a), ${usuario.nome}!`;
    }

    try {
        // Rota para buscar devoluções de um cliente específico (idUsuarioCliente)
        const response = await fetch(`/api/cliente/devolucoes/${usuario.idUsuario}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Erro HTTP: ${response.status} - ${response.statusText}`);
        }
        const devolucoes = await response.json();
        console.log('Devoluções do cliente:', devolucoes);

        if (!Array.isArray(devolucoes) || devolucoes.length === 0) {
            tabela.innerHTML = '<tr><td colspan="4">Nenhuma devolução encontrada.</td></tr>';
            return;
        }

        tabela.innerHTML = ''; // Limpa a tabela
        devolucoes.forEach(dev => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${dev.idDevolucao}</td>
                <td>${new Date(dev.dataSolicitacao).toLocaleDateString('pt-BR')}</td>
                <td>${dev.status}</td>
                <td>
                    <button onclick="window.location.href='/html/detalhes_devolucao.html?idDevolucao=${dev.idDevolucao}'">
                        Ver Detalhes
                    </button>
                </td>
            `;
            tabela.appendChild(tr);
        });
    } catch (err) {
        console.error('Erro ao carregar devoluções do cliente:', err);
        tabela.innerHTML = '<tr><td colspan="4">Erro ao carregar as devoluções.</td></tr>';
    }
});
