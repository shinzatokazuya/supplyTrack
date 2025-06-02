// public/js/login.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('formLogin');
    const messageElement = document.getElementById('mensagemErro');

    if (!loginForm) {
        console.error("Elemento 'formLogin' não encontrado no DOM.");
        return;
    }

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;

        messageElement.textContent = ''; // Limpa mensagens anteriores
        messageElement.style.color = 'red'; // Cor padrão para erro

        try {
            const response = await fetch('/api/auth/login', { // Rota do seu backend
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, senha })
            });

            const data = await response.json();

            if (response.ok) {
                messageElement.style.color = 'green';
                messageElement.textContent = data.message || 'Login bem-sucedido!';
                loginForm.reset(); // Limpa o formulário

                if (data.user && data.user.tipoUsuario) { // Verifica se data.user e tipoUsuario existem
                    setTimeout(() => {
                        if (data.user.tipoUsuario === 'cliente') {
                            window.location.href = '/html/painel_cliente.html'; // Redireciona para o painel do cliente
                        } else if (data.user.tipoUsuario === 'gestor') {
                            window.location.href = '/html/painel_gestor.html'; // Redireciona para o painel do gestor
                        }
                    }, 1000);
                } else {
                    messageElement.style.color = 'orange'; // Cor diferente para alerta
                    messageElement.textContent = 'Login bem-sucedido, mas o tipo de usuário não foi especificado. Redirecionando para tela inicial.';
                    setTimeout(() => {
                        window.location.href = '/html/tela_inicial.html'; // Ou uma página de fallback
                    }, 1000);
                }

            } else {
                messageElement.style.color = 'red';
                messageElement.textContent = data.message || 'Erro ao fazer login. Verifique suas credenciais.';
            }
        } catch (error) {
            console.error('Erro na requisição de login (frontend):', error);
            messageElement.style.color = 'red';
            messageElement.textContent = 'Erro ao conectar com o servidor.';
        }
    });
});
