// public/js/historico_devolucoes.js
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Histórico de Devoluções carregado!');
    const tabelaHistorico = document.getElementById('historicoDevolucoes');

    // Validação de usuário (idealmente, apenas gestores deveriam acessar isso)
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

    try {
        // Rota para buscar o histórico completo de devoluções
        const resposta = await fetch('/api/historico/devolucoes'); // Rota definida em devolucaoRoutes.js

        if (!resposta.ok) {
            const errorData = await resposta.json();
            throw new Error(errorData.message || `Erro HTTP: ${resposta.status}`);
        }

        const devolucoes = await resposta.json();

        if (!Array.isArray(devolucoes) || devolucoes.length === 0) {
            tabelaHistorico.innerHTML = '<tr><td colspan="4">Nenhum histórico de devolução encontrado.</td></tr>';
            return;
        }

        devolucoes.forEach(dev => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${dev.nomeCliente}</td>
                <td>${new Date(dev.dataSolicitacao).toLocaleDateString('pt-BR')}</td>
                <td>${dev.dataResposta ? new Date(dev.dataResposta).toLocaleDateString('pt-BR') : 'Pendente'}</td>
                <td>${dev.status}</td>
            `;
            tabelaHistorico.appendChild(tr);
        });

    } catch (erro) {
        console.error('Erro ao carregar histórico de devoluções:', erro);
        tabelaHistorico.innerHTML = '<tr><td colspan="4">Erro ao carregar o histórico de devoluções.</td></tr>';
    }
});
