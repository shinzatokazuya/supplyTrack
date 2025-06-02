// public/js/detalhes_devolucao.js
document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const idDevolucao = params.get('idDevolucao'); // Obtém o ID da devolução da URL

    const idDevolucaoExibidoElement = document.getElementById('idDevolucaoExibido');
    const dataSolicitacaoElement = document.getElementById('dataSolicitacao');
    const statusDevolucaoElement = document.getElementById('statusDevolucao');
    const nomeGestorElement = document.getElementById('nomeGestor');
    const dataRespostaElement = document.getElementById('dataResposta');
    const mensagemRespostaElement = document.getElementById('mensagemResposta');
    const tabelaItens = document.getElementById('tabelaItensDevolucao');
    const mensagemErroElement = document.getElementById('mensagemErro');

    mensagemErroElement.textContent = 'Carregando dados...';
    mensagemErroElement.style.color = 'blue';

    // **Validação de sessão do cliente**
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
        window.location.href = '/html/painel_gestor.html'; // Ou para o login
        return;
    }

    if (!idDevolucao) {
        mensagemErroElement.textContent = 'ID da devolução não especificado na URL.';
        mensagemErroElement.style.color = 'red';
        console.error('ID da devolução não encontrado na URL.');
        return;
    }

    try {
        // Fetch para obter os detalhes da devolução (usando a mesma rota do gestor)
        const response = await fetch(`/api/devolucoes/${idDevolucao}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
        }
        const devolucao = await response.json();
        console.log('Dados da devolução recebidos para cliente:', devolucao);

        // Preenche os campos de exibição
        if (idDevolucaoExibidoElement) idDevolucaoExibidoElement.textContent = devolucao.idDevolucao;
        if (dataSolicitacaoElement) dataSolicitacaoElement.textContent = new Date(devolucao.dataSolicitacao).toLocaleDateString('pt-BR');
        if (statusDevolucaoElement) statusDevolucaoElement.textContent = devolucao.status;
        if (nomeGestorElement) nomeGestorElement.textContent = devolucao.nomeGestor || 'Aguardando gestor';
        if (dataRespostaElement) dataRespostaElement.textContent = devolucao.dataResposta ? new Date(devolucao.dataResposta).toLocaleDateString('pt-BR') : 'Ainda não respondido';
        if (mensagemRespostaElement) mensagemRespostaElement.textContent = devolucao.mensagemResposta || 'Nenhuma mensagem do gestor ainda.';

        // Popula a tabela de itens
        if (devolucao.itens && devolucao.itens.length > 0) {
            tabelaItens.innerHTML = ''; // Limpa a mensagem de carregamento
            devolucao.itens.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.nomeProduto}</td>
                    <td>${item.empresaFornecedora}</td>
                    <td>${item.quantidade}</td>
                    <td>${item.motivo}</td>
                `;
                tabelaItens.appendChild(tr);
            });
            mensagemErroElement.textContent = ''; // Limpa a mensagem de carregamento
        } else {
            tabelaItens.innerHTML = '<tr><td colspan="4">Nenhum item encontrado para esta devolução.</td></tr>';
            mensagemErroElement.textContent = '';
        }

    } catch (error) {
        console.error('Erro ao carregar detalhes da devolução para o cliente:', error);
        mensagemErroElement.textContent = 'Erro ao carregar detalhes da devolução: ' + error.message;
        mensagemErroElement.style.color = 'red';
        tabelaItens.innerHTML = '<tr><td colspan="4">Erro ao carregar dados.</td></tr>';
    }
});
