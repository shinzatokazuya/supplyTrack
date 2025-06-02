document.addEventListener('DOMContentLoaded', async () => {
    const tabela = document.getElementById('tabelaDevolucoes');

    try {
        const response = await fetch('/api/gestor/devolucoes');
        if (!response.ok) throw new Error('Erro ao buscar devoluções');
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
