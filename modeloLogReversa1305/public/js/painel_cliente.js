// public/js/painel_cliente.js
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const tipoUsuario = localStorage.getItem('tipoUsuario');

    console.log("painel_cliente.js: Token lido do localStorage:", token ? token.substring(0, 20) + '...' : '[NULO/VAZIO/UNDEFINED]');
    console.log("painel_cliente.js: Tipo de Usuário lido do localStorage:", tipoUsuario);

    // Se não há token, redireciona (isso já está funcionando e gerando o alert)
    if (!token) {
        alert('Sessão expirada. Faça login novamente.');
        window.location.href = '/html/login.html';
        return;
    }

    // Exemplo da função para listar produtos (ou devoluções), adaptado para incluir o token
    async function carregarProdutos() { // Ou carregarDevolucoes, dependendo do que você quer carregar
        const idCliente = localStorage.getItem('idUsuario'); // Certifique-se que o idUsuario está sendo salvo no login.js também

        try {
            // VERIFIQUE ESTA CHAMADA FETCH
            const response = await fetch(`/api/cliente/${idUsuario}/devolucoes`, { // OU `/api/cliente/${idCliente}/devolucoes`
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // <<<<<<< ESTA LINHA É CRÍTICA!
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Erro ao carregar produtos/devoluções:', errorData); // Para ver a mensagem de erro do backend
                if (response.status === 403 && errorData.message === 'Token expirado. Faça login novamente.') {
                    alert('Sessão expirada. Faça login novamente.');
                    localStorage.clear();
                    window.location.href = '/html/login.html';
                } else {
                    alert('Erro ao carregar dados: ' + (errorData.message || 'Erro desconhecido.'));
                }
                return;
            }

            const data = await response.json();
            console.log('Dados carregados:', data);
            // Lógica para exibir a lista de produtos/devoluções na sua tela
            // Ex: preencher uma tabela HTML

        } catch (error) {
            console.error('Erro de rede ao carregar dados:', error);
            alert('Erro de conexão ao carregar dados.');
        }
    }

    // Chame a função quando a página carregar, ou quando um botão for clicado
    carregarProdutos(); // Exemplo: Carrega os produtos assim que a página é carregada
});
