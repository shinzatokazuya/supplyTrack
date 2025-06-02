// public/js/login.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('formLogin');
    const messageElement = document.getElementById('mensagemErro');

    if (!loginForm) {
        console.error("Erro: Elemento 'formLogin' não encontrado no DOM.");
        return;
    }

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;

        messageElement.textContent = ''; // Limpa mensagens anteriores
        messageElement.style.color = 'red'; // Define a cor padrão para erro

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, senha })
            });

            // Se a resposta não for bem-sucedida (ex: 400, 401, 500)
            if (!response.ok) {
                const errorData = await response.json();
                messageElement.style.color = 'red';
                messageElement.textContent = errorData.message || `Erro ${response.status}: Falha no login.`;
                console.error('Login falhou (backend retornou erro):', errorData);
                return; // Importante: parar aqui se houver erro
            }

            // Se a resposta for bem-sucedida (status 2xx)
            const data = await response.json();

            // **PONTO CRÍTICO:** Verifica se 'data.user' existe e tem o tipoUsuario
            if (data.user && data.user.tipoUsuario) {
                // Salva o objeto do usuário no localStorage
                // localStorage só armazena strings, então precisamos converter o objeto para JSON
                localStorage.setItem('usuario', JSON.stringify(data.user));
                console.log('Usuário salvo no localStorage:', data.user); // Para depuração

                messageElement.style.color = 'green';
                messageElement.textContent = data.message || 'Login bem-sucedido!';
                loginForm.reset(); // Limpa o formulário

                // Redireciona o usuário com base no tipo de usuário
                // Usamos setTimeout para garantir que o localStorage seja salvo antes do redirecionamento
                setTimeout(() => {
                    if (data.user.tipoUsuario === 'cliente') {
                        window.location.href = '/html/painel_cliente.html';
                    } else if (data.user.tipoUsuario === 'gestor') {
                        window.location.href = '/html/painel_gestor.html';
                    } else {
                        // Caso o tipo de usuário seja desconhecido/inválido
                        messageElement.style.color = 'orange';
                        messageElement.textContent = 'Login bem-sucedido, mas tipo de usuário inválido. Redirecionando para página inicial.';
                        window.location.href = '/html/tela_inicial.html';
                    }
                }, 500); // Pequeno atraso para garantir a gravação no localStorage

            } else {
                // Se a resposta.ok for true, mas data.user não veio ou está incompleto
                messageElement.style.color = 'red';
                messageElement.textContent = data.message || 'Erro: Dados de usuário incompletos recebidos do servidor.';
                console.error('Resposta de login bem-sucedida, mas sem dados de usuário completos:', data);
            }

        } catch (error) {
            console.error('Erro na requisição de login (catch no frontend):', error);
            messageElement.style.color = 'red';
            messageElement.textContent = 'Erro ao conectar com o servidor. Verifique sua conexão de rede.';
        }
    });
});
