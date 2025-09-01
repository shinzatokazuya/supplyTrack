// public/js/analisar_solicitacao.js
document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const idDevolucao = params.get('idDevolucao'); // Obtém o ID da devolução da URL

    const tabelaItens = document.getElementById('tabelaItensDevolucao');
    const mensagemErroElement = document.getElementById('mensagemErro'); // Adicione este ID ao seu HTML se não tiver
    const btnEnviarResposta = document.getElementById('btnEnviarResposta');
    const campoMensagemResposta = document.getElementById('mensagemResposta');
    const selectStatus = document.getElementById('statusDevolucao'); // Novo: para escolher o status

    // Campos de exibição
    const clienteNomeElement = document.getElementById('clienteNome');
    const clienteEmailElement = document.getElementById('clienteEmail');
    const dataSolicitacaoElement = document.getElementById('dataSolicitacao');
    const statusAtualElement = document.getElementById('statusAtual');

    mensagemErroElement.textContent = 'Carregando dados...';
    mensagemErroElement.style.color = 'blue';

    // **Validação de sessão do gestor**
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

    if (usuario.tipoUsuario !== 'gestor') { // Apenas gestores podem acessar esta tela
        alert('Acesso negado. Esta página é apenas para gestores.');
        window.location.href = '/html/painel_cliente.html'; // Ou para o login
        return;
    }

    if (!idDevolucao) {
        mensagemErroElement.textContent = 'ID da devolução não especificado na URL.';
        mensagemErroElement.style.color = 'red';
        console.error('ID da devolução não encontrado na URL.');
        return;
    }

    try {
        // Fetch para obter os detalhes da devolução
        const response = await fetch(`/api/devolucoes/${idDevolucao}`); // Rota para buscar devolução por ID
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
        }
        const devolucao = await response.json();
        console.log('Dados da devolução recebidos:', devolucao);

        // Preenche os campos de exibição
        if (clienteNomeElement) clienteNomeElement.textContent = devolucao.nomeCliente || 'N/A';
        if (clienteEmailElement) clienteEmailElement.textContent = devolucao.emailCliente || 'N/A';
        if (dataSolicitacaoElement) dataSolicitacaoElement.textContent = new Date(devolucao.dataSolicitacao).toLocaleDateString('pt-BR');
        if (statusAtualElement) statusAtualElement.textContent = devolucao.status;
        if (campoMensagemResposta) campoMensagemResposta.value = devolucao.mensagemResposta || ''; // Preenche com resposta existente

        // Popula a tabela de itens
        if (devolucao.itens && devolucao.itens.length > 0) {
            tabelaItens.innerHTML = ''; // Limpa o "Erro ao carregar dados"
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

        // Preenche o select de status
        if (selectStatus) {
             const currentStatus = devolucao.status;
             Array.from(selectStatus.options).forEach(option => {
                 if (option.value === currentStatus) {
                     option.selected = true;
                 }
             });
        }


    } catch (error) {
        console.error('Erro ao carregar dados da devolução:', error);
        mensagemErroElement.textContent = 'Erro ao carregar dados da devolução: ' + error.message;
        mensagemErroElement.style.color = 'red';
        tabelaItens.innerHTML = '<tr><td colspan="4">Erro ao carregar dados.</td></tr>';
    }

    // Event Listener para o botão de Enviar Resposta
    if (btnEnviarResposta) {
        btnEnviarResposta.addEventListener('click', async () => {
            const statusSelecionado = selectStatus.value;
            const mensagem = campoMensagemResposta.value.trim();

            if (mensagem === '') {
                alert('A mensagem de resposta não pode ser vazia.');
                return;
            }
            if (statusSelecionado === '') {
                alert('Selecione um status para a devolução.');
                return;
            }

            try {
                const response = await fetch(`/api/devolucoes/${idDevolucao}/status`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        status: statusSelecionado,
                        mensagemResposta: mensagem,
                        idUsuarioGestor: usuario.idUsuario // Passa o ID do gestor logado
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
                }

                alert('Resposta enviada e status atualizado com sucesso!');
                window.location.href = '/html/painel_gestor.html'; // Redireciona de volta
            } catch (error) {
                console.error('Erro ao enviar resposta:', error);
                alert('Erro ao enviar resposta: ' + error.message);
            }
        });
    }
});
