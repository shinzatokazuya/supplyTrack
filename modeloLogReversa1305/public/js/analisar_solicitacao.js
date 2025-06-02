let idDevolucao = null;

window.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    idDevolucao = urlParams.get('idDevolucao'); // define no escopo global
    const tabelaItens = document.getElementById('listaItens');

    if (!idDevolucao) {
        alert('ID da devolução não informado.');
        return;
    }

    try {
        const resposta = await fetch(`/api/gestor/devolucoes/${idDevolucao}/itens`);
        const itens = await resposta.json();

        if (!Array.isArray(itens) || itens.length === 0) {
            tabelaItens.innerHTML = '<tr><td colspan="3">Nenhum item encontrado.</td></tr>';
            return;
        }

        itens.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.nomeProduto}</td>
                <td>${item.quantidade}</td>
                <td>${item.motivo}</td>
            `;
            tabelaItens.appendChild(tr);
        });
    } catch (erro) {
        console.error('Erro ao carregar itens da devolução:', erro);
        tabelaItens.innerHTML = '<tr><td colspan="3">Erro ao carregar dados.</td></tr>';
    }
});

document.getElementById('formResposta').addEventListener('submit', async function(event) {
    event.preventDefault();
    const resposta = document.getElementById('resposta').value.trim();
    const gestor = JSON.parse(localStorage.getItem('usuario'));

    if (!idDevolucao || !gestor || gestor.tipoUsuario !== 'gestor') {
        alert('Erro de autenticação ou parâmetro inválido.');
        return;
    }

    if (resposta === '') {
        alert('Por favor, digite uma mensagem para o cliente.');
        return;
    }

    try {
        const response = await fetch('/api/gestor/responder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                idDevolucao: parseInt(idDevolucao),
                idGestor: gestor.idUsuario,
                mensagemResposta: resposta
            })
        });

        const resultado = await response.json();

        if (resultado.sucesso) {
            alert('Resposta enviada com sucesso!');
            window.location.href = '/html/painel_gestor.html';
        } else {
            alert('Erro ao enviar resposta.');
        }
    } catch (erro) {
        console.error('Erro ao enviar resposta:', erro);
        alert('Erro ao enviar resposta ao servidor.');
    }
});
