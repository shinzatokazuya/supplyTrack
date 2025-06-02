// public/js/nova_devolucao.js

const listaProdutos = []; // Array para armazenar os produtos que o cliente quer devolver

function adicionarItem() {
    // Captura os valores dos novos campos de input
    const nomeProduto = document.getElementById('nomeProduto').value.trim();
    const empresaFornecedora = document.getElementById('empresaFornecedora').value.trim();
    const quantidade = parseInt(document.getElementById('quantidade').value, 10);
    const motivo = document.getElementById('motivo').value.trim();

    // Validação básica dos campos
    if (nomeProduto === '' || empresaFornecedora === '' || isNaN(quantidade) || quantidade <= 0 || motivo === '') {
        alert('Por favor, preencha todos os campos corretamente (Nome do Produto, Empresa, Quantidade e Motivo).');
        return; // Impede a adição se a validação falhar
    }

    // Adiciona o novo item à listaProdutos
    listaProdutos.push({
        nomeProduto: nomeProduto,
        empresaFornecedora: empresaFornecedora,
        quantidade: quantidade,
        motivo: motivo
    });

    atualizarLista(); // Atualiza a exibição na tela
    limparCampos();   // Limpa os campos do formulário para nova entrada
}

function atualizarLista() {
    const lista = document.getElementById('listaProdutos');
    lista.innerHTML = ''; // Limpa a lista antes de redesenhá-la
    listaProdutos.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>Produto:</strong> ${item.nomeProduto},
            <strong>Empresa:</strong> ${item.empresaFornecedora},
            <strong>Qtd:</strong> ${item.quantidade},
            <strong>Motivo:</strong> ${item.motivo}
            <button onclick="removerItem(${index})">Remover</button>
        `;
        lista.appendChild(li);
    });
}

function removerItem(index) {
    listaProdutos.splice(index, 1); // Remove o item do array
    atualizarLista(); // Atualiza a exibição
}

function limparCampos() {
    document.getElementById('nomeProduto').value = '';
    document.getElementById('empresaFornecedora').value = '';
    document.getElementById('quantidade').value = '1'; // Reseta para 1
    document.getElementById('motivo').value = '';
}

// Envia a solicitação de devolução para o servidor
const form = document.getElementById('formNovaDevolucao');
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (listaProdutos.length === 0) {
        alert('Por favor, adicione pelo menos um produto à lista antes de enviar a solicitação.');
        return;
    }

    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario || !usuario.idUsuario) {
        alert('Usuário não autenticado ou ID do usuário não encontrado. Faça login novamente.');
        window.location.href = '/html/login.html';
        return;
    }

    console.log('Frontend: Enviando solicitação com idCliente:', usuario.idUsuario);
    console.log('Frontend: Itens a serem enviados:', listaProdutos);

    try {
        const resposta = await fetch('/api/cliente/nova-devolucao', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                idCliente: usuario.idUsuario,
                itens: listaProdutos // Envia o array de itens completo
            })
        });

        if (!resposta.ok) {
            const errorData = await resposta.json();
            console.error('Frontend: Erro do backend ao enviar solicitação:', errorData);
            alert(errorData.message || `Erro ao registrar solicitação (Status: ${resposta.status}).`);
            return;
        }

        const resultado = await resposta.json();

        if (resultado.sucesso) {
            alert('Solicitação de devolução registrada com sucesso!');
            listaProdutos.length = 0; // Limpa a lista após o sucesso
            atualizarLista(); // Atualiza a UI para mostrar a lista vazia
            window.location.href = '/html/painel_cliente.html'; // Redireciona
        } else {
            alert('Erro ao registrar solicitação: ' + (resultado.message || 'Erro desconhecido.'));
        }
    } catch (erro) {
        console.error('Frontend: Erro ao enviar solicitação (catch):', erro);
        alert('Erro ao enviar solicitação. Verifique o console para mais detalhes.');
    }
});
