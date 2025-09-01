// public/js/painel_gestor.js
document.addEventListener('DOMContentLoaded', async () => {
    const tabela = document.getElementById('tabelaDevolucoes');
    const welcomeMessage = document.querySelector('.container h1');

    const usuarioString = localStorage.getItem('usuario');
    // ... (suas validações de sessão e tipo de usuário)
    if (!usuarioString || JSON.parse(usuarioString).tipoUsuario !== 'gestor') {
        alert('Acesso negado. Faça login como gestor.');
        window.location.href = '/html/login.html';
        return;
    }
    const usuario = JSON.parse(usuarioString);
    if (welcomeMessage && usuario.nome) {
        welcomeMessage.textContent = `Bem-vindo(a), Gestor(a) ${usuario.nome}!`;
    }


    try {
        const response = await fetch('/api/gestor/devolucoes'); // Busca todas as devoluções para o gestor
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Erro HTTP: ${response.status} - ${response.statusText}`);
        }
        const devolucoes = await response.json();

        if (!Array.isArray(devolucoes) || devolucoes.length === 0) {
            tabela.innerHTML = '<tr><td colspan="4">Nenhuma devolução encontrada.</td></tr>';
            return;
        }

        tabela.innerHTML = ''; // Limpa a tabela antes de adicionar novos dados
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
