window.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const idDevolucao = params.get('idDevolucao');

    const paragrafo = document.getElementById('mensagemResposta');
    const spanData = document.getElementById('dataSolicitacao');
    const spanStatus = document.getElementById('status');
    const tabela = document.getElementById('tabelaItens');

    if (!idDevolucao) {
        paragrafo.textContent = 'ID da devolução não informado.';
        return;
    }

    try {
        const resposta = await fetch(`/api/cliente/devolucao/${idDevolucao}/resposta`);
        const dados = await resposta.json();

        spanData.textContent = new Date(dados.dataSolicitacao).toLocaleString('pt-BR');
        spanStatus.textContent = dados.status;
        paragrafo.textContent = dados.mensagemResposta || 'Nenhuma resposta registrada.';

        dados.itens.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.nomeProduto}</td>
                <td>${item.quantidade}</td>
                <td>${item.motivo}</td>
            `;
            tabela.appendChild(tr);
        });

    } catch (erro) {
        console.error('Erro ao buscar dados da devolução:', erro);
        paragrafo.textContent = 'Erro ao carregar dados.';
    }
});
