// public/js/painel_gestor.js
document.addEventListener('DOMContentLoaded', async () => {
    const tabela = document.getElementById('tabelaDevolucoes');
    const welcomeMessage = document.querySelector('.container h1'); // Seleciona o h1 para personalizar

    // Tenta pegar o usuário do localStorage
    const usuarioString = localStorage.getItem('usuario');
    if (!usuarioString) {
        alert('Sessão expirada ou não iniciada. Faça login novamente.');
        window.location.href = '/html/login.html';
        return;
    }

    let usuario;
    try {
        usuario = JSON.parse(usuarioString);
        if (welcomeMessage && usuario.nome) {
            welcomeMessage.textContent = `Bem-vindo(a), Gestor(a) ${usuario.nome}!`;
        }
    } catch (e) {
        console.error('Erro ao parsear dados do usuário do localStorage:', e);
        alert('Erro nos dados da sessão. Faça login novamente.');
        window.location.href = '/html/login.html';
        return;
    }

    // Validação adicional do tipo de usuário
    if (usuario.tipoUsuario !== 'gestor') {
        alert('Acesso negado. Você não é um gestor.');
        localStorage.removeItem('usuario'); // Limpa dados inválidos
        window.location.href = '/html/login.html';
        return;
    }

    try {
        // Rota para o backend para buscar todas as devoluções
        const response = await fetch('/api/gestor/devolucoes');
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
        }
        const devolucoes = await response.json();

        if (!Array.isArray(devolucoes) || devolucoes.length === 0) {
            tabela.innerHTML = '<tr><td colspan="4">Nenhuma devolução encontrada.</td></tr>';
            return;
        }

        devolucoes.forEach(dev => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${dev.nomeCliente}</td>
                <td>${new Date(dev.dataSolicitacao).toLocaleDateString('pt-BR')}</td>
                <td>${dev.status}</td>
                <td>
                    <button onclick="window.location.href='/html/analisar_solicitacao.html?idDevolucao=${dev.idDevolucao}'">
                        Analisar
                    </button>
                </td>
            `;
            tabela.appendChild(tr);
        });
    } catch (err) {
        console.error('Erro ao carregar devoluções:', err);
        tabela.innerHTML = '<tr><td colspan="4">Erro ao carregar as devoluções.</td></tr>';
    }
});
