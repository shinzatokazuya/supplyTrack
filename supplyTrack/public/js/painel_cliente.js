window.addEventListener('DOMContentLoaded', async () => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const tabela = document.getElementById('tabelaDevolucoes');

    if (!usuario) {
        alert('Sessão expirada. Faça login novamente.');
        window.location.href = '/html/login.html';
        return;
    }

    try {
        const resposta = await fetch(`/api/cliente/devolucoes/${usuario.idUsuario}`);
        const devolucoes = await resposta.json();

        devolucoes.forEach(dev => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${dev.idDevolucao}</td>
        <td>${new Date(dev.dataSolicitacao).toLocaleDateString('pt-BR')}</td>
        <td>${dev.status}</td>
        <td>
            <button onclick="window.location.href='/html/ver_resposta.html?idDevolucao=${dev.idDevolucao}'">
                Ver Resposta
            </button>
        </td>
    `;
    tabela.appendChild(tr);
});
    } catch (erro) {
        console.error('Erro ao carregar devoluções:', erro);
    }
});
