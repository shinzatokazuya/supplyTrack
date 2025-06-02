// public/js/painel_gestor.js
document.addEventListener('DOMContentLoaded', async () => {
    const tabela = document.getElementById('tabelaDevolucoes');
    const welcomeMessage = document.querySelector('.container h1');

    const usuarioString = localStorage.getItem('usuario');
    console.log('Painel Gestor JS: Conteúdo de "usuario" no localStorage:', usuarioString); // Para depuração

    if (!usuarioString) {
        alert('Sessão expirada ou não iniciada. Faça login novamente.');
        window.location.href = '/html/login.html';
        return;
    }

    let usuario;
    try {
        usuario = JSON.parse(usuarioString);
        console.log('Painel Gestor JS: Usuário parseado:', usuario); // Para depuração
        if (welcomeMessage && usuario.nome) {
            welcomeMessage.textContent = `Bem-vindo(a), Gestor(a) ${usuario.nome}!`;
        }
    } catch (e) {
        console.error('Painel Gestor JS: Erro ao parsear dados do usuário do localStorage:', e);
        alert('Erro nos dados da sessão. Faça login novamente.');
        localStorage.removeItem('usuario');
        window.location.href = '/html/login.html';
        return;
    }

    if (usuario.tipoUsuario !== 'gestor') { // **MUDANÇA AQUI: VERIFICA 'gestor'**
        alert('Acesso negado. Você não tem permissão para acessar este painel.');
        localStorage.removeItem('usuario');
        window.location.href = '/html/login.html';
        return;
    }

    // ... (restante do seu código para buscar devoluções do gestor)
    try {
        const response = await fetch('/api/gestor/devolucoes');
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Erro HTTP: ${response.status} - ${response.statusText}`);
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
        console.error('Erro ao carregar devoluções do gestor:', err);
        tabela.innerHTML = '<tr><td colspan="4">Erro ao carregar as devoluções.</td></tr>';
    }
});
