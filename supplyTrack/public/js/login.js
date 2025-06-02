// public/js/login.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('formLogin');
    const messageElement = document.getElementById('mensagemErro');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;

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
                    messageElement.textContent = data.message;
                    loginForm.reset(); // Limpa o formulário

                    // Em uma aplicação real, você armazenaria o token de autenticação (se houver)
                    // e redirecionaria o usuário com base no tipo de usuário.
                    if (data.user.tipoUsuario === 'cliente') {
                        setTimeout(() => {
                            window.location.href = '/html/painel_cliente.html'; // Redireciona para o painel do cliente
                        }, 1000);
                    } else if (data.user.tipoUsuario === 'gestor') {
                        setTimeout(() => {
                            window.location.href = '/html/painel_gestor.html'; // Redireciona para o painel do gestor
                        }, 1000);
                    }
                } else {
                    messageElement.style.color = 'red';
                    messageElement.textContent = data.message || 'Erro ao fazer login.';
                }
            } catch (error) {
                console.error('Erro na requisição de login:', error);
                messageElement.style.color = 'red';
                messageElement.textContent = 'Erro ao conectar com o servidor.';
            }
        });
    }
});
