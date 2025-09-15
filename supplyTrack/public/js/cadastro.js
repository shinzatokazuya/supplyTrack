// public/js/cadastro.js
document.addEventListener('DOMContentLoaded', () => {
    const cadastroForm = document.getElementById('formCadastro');
    const messageElement = document.getElementById('mensagemErro');

    if (cadastroForm) {
        cadastroForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const nome = document.getElementById('nome').value;
            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;
            const tipoUsuario = document.getElementById('tipoUsuario').value;

            try {
                const response = await fetch('/api/auth/cadastro', { // Rota do seu backend
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ nome, email, senha, tipoUsuario })
                });

                const data = await response.json();

                if (response.ok) {
                    messageElement.style.color = 'green';
                    messageElement.textContent = data.message;
                    cadastroForm.reset(); // Limpa o formulário
                    // Opcional: Redirecionar para a página de login
                    setTimeout(() => {
                        window.location.href = '/html/login.html';
                    }, 2000);
                } else {
                    messageElement.style.color = 'red';
                    messageElement.textContent = data.message || 'Erro ao cadastrar.';
                }
            } catch (error) {
                console.error('Erro na requisição de cadastro:', error);
                messageElement.style.color = 'red';
                messageElement.textContent = 'Erro ao conectar com o servidor.';
            }
        });
    }
});
