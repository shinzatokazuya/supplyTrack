
const listaProdutos = [];

// Carrega produtos do banco ao iniciar a página
window.addEventListener('DOMContentLoaded', async () => {
    const select = document.getElementById('produto');
    try {
        const resposta = await fetch('/api/cliente/produtos');
        const produtos = await resposta.json();

        // Adiciona uma opção inicial
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Selecione um produto';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        select.appendChild(defaultOption);

        produtos.forEach(produto => {
            const option = document.createElement('option');
            option.value = produto.idProduto;
            option.textContent = produto.nomeProduto;
            select.appendChild(option);
        });
    } catch (erro) {
        console.error('Erro ao carregar produtos:', erro);
        alert('Erro ao carregar lista de produtos.');
    }
});

function adicionarItem() {
    const produto = document.getElementById('produto').value;
    const nomeProduto = document.getElementById('produto').selectedOptions[0].text;
    const quantidade = document.getElementById('quantidade').value;
    const motivo = document.getElementById('motivo').value;

    if (produto && quantidade > 0 && motivo.trim() !== '') {
        listaProdutos.push({ idProduto: produto, nomeProduto, quantidade, motivo });
        atualizarLista();
        limparCampos();
    } else {
        alert('Preencha todos os campos para adicionar o produto.');
    }
}

function atualizarLista() {
    const lista = document.getElementById('listaProdutos');
    lista.innerHTML = '';
    listaProdutos.forEach((item, index) => {
        const li = document.createElement('li');
        li.textContent = `Produto: ${item.nomeProduto}, Quantidade: ${item.quantidade}, Motivo: ${item.motivo}`;
        lista.appendChild(li);
    });
}

function limparCampos() {
    document.getElementById('produto').selectedIndex = 0;
    document.getElementById('quantidade').value = '';
    document.getElementById('motivo').value = '';
}

// Envia a solicitação de devolução para o servidor
const form = document.getElementById('formNovaDevolucao');
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (listaProdutos.length === 0) {
        alert('Adicione pelo menos um produto.');
        return;
    }

    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario || !usuario.idUsuario) {
        alert('Usuário não autenticado. Faça login novamente.');
        window.location.href = '/html/login.html';
        return;
    }

    console.log('Frontend: Preparando para enviar solicitação.'); // DEBUG 1
    console.log('Frontend: idCliente a ser enviado:', usuario.idUsuario); // DEBUG 2
    console.log('Frontend: Itens a serem enviados:', listaProdutos); // DEBUG 3

    try {
        const resposta = await fetch('/api/cliente/nova-devolucao', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                idCliente: usuario.idUsuario,
                itens: listaProdutos
            })
        });

        const resultado = await resposta.json();

        if (resultado.sucesso) {
            alert('Solicitação registrada com sucesso!');
            window.location.href = '/html/painel_cliente.html';
        } else {
            alert('Erro ao registrar solicitação.');
        }
    } catch (erro) {
        console.error('Erro ao enviar solicitação:', erro);
        alert('Erro ao enviar solicitação.');
    }
});
