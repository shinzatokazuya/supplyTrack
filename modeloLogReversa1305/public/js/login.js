// public/js/login.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('formLogin'); // Assumindo que você tem um form com id loginForm
    const messageElement = document.getElementById('mensagemErro'); // Um elemento para exibir mensagens

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const senha = document.getElementById('loginSenha').value; // Alterado para 'loginSenha' ou o ID do seu campo de senha

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, senha }) // Envia 'senha'
            });

            const data = await response.json();

            if (response.ok) {
                messageElement.style.color = 'green';
                messageElement.textContent = data.message;

                // >>> SALVAR O TOKEN E TIPO DE USUÁRIO AQUI <<<
                localStorage.setItem('token', data.token);
                localStorage.setItem('tipoUsuario', data.user.tipoUsuario); // Armazene para facilitar o redirecionamento

                console.log("Login bem-sucedido. Token e tipo de usuário salvos.");
                console.log("Tipo de usuário salvo:", data.user.tipoUsuario);
                console.log("Login bem-sucedido. Token salvo no localStorage:", data.token);

                // Redirecionar com base na tipoUsuario
                if (data.user.tipoUsuario === 'cliente') { // Acesso a data.user.tipoUsuario
                    window.location.href = '/html/painel_cliente.html';
                } else if (data.user.tipoUsuario === 'gestor') {
                    window.location.href = '/html/painel_gestor.html';
                }

            } else {
                messageElement.style.color = 'red';
                messageElement.textContent = data.message || 'Erro no login.';
            }
        } catch (error) {
            console.error('Erro ao enviar dados de login:', error);
            messageElement.style.color = 'red';
            messageElement.textContent = 'Erro ao conectar com o servidor.';
        }
    });
});
