// public/js/cadastro.js
document.addEventListener('DOMContentLoaded', () => {
    const cadastroForm = document.getElementById('formCadastro');
<<<<<<< HEAD:modeloLogReversa1305/public/js/cadastro.js
    const messageElement = document.getElementById('mensagemErro'); // Certifique-se de ter um <p id="message"></p> no seu HTML

    cadastroForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Impede o envio padrão do formulário

        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;
        const tipoUsuario = document.getElementById('tipoUsuario').value;

        // Limpa mensagens anteriores
        messageElement.textContent = '';
        messageElement.style.color = '';

        try {
            const response = await fetch('/api/auth/cadastro', { // Endpoint da sua API
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nome, email, senha, tipoUsuario })
            });

            const data = await response.json(); // Pega a resposta JSON do servidor

            if (response.ok) { // Verifica se a resposta HTTP é de sucesso (código 2xx)
                // 1. Mostrar mensagem de sucesso
                messageElement.style.color = 'green';
                messageElement.textContent = data.message || 'Usuário cadastrado com sucesso!';
                // data.message virá do backend, ex: 'Usuário registrado com sucesso!'

                // 2. Redirecionar para a tela de login após um pequeno atraso
                setTimeout(() => {
                    window.location.href = '/html/login.html'; // Caminho para sua tela de login
                }, 1500); // Redireciona após 1.5 segundos para o usuário ver a mensagem

            } else { // Se a resposta HTTP não for de sucesso (ex: 400, 409, 500)
                messageElement.style.color = 'red';
                // data.message virá do backend, ex: 'E-mail já cadastrado.'
                messageElement.textContent = data.message || 'Erro no cadastro. Tente novamente.';
            }
        } catch (error) {
            console.error('Erro ao enviar dados (problema de rede/servidor):', error);
            messageElement.style.color = 'red';
            messageElement.textContent = 'Não foi possível conectar ao servidor. Tente novamente mais tarde.';
        }
    });
=======
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
>>>>>>> 5fe1efb8ddc7c017b600200968d52d787fe27502:supplyTrack/public/js/cadastro.js
});
