document.getElementById('formLogin').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value.trim();
    const mensagemErro = document.getElementById('mensagemErro');

    if (email === '' || senha === '') {
        mensagemErro.textContent = 'Por favor, preencha todos os campos.';
        return;
    }

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        });

        const resultado = await response.json();

        if (resultado.sucesso) {
            // Armazena as informações do usuário no localStorage
            localStorage.setItem('usuario', JSON.stringify(resultado.usuario));

            // Redireciona de acordo com o tipo de usuário
            if (resultado.usuario.tipoUsuario === 'cliente') {
                window.location.href = '/html/painel_cliente.html';
            } else if (resultado.usuario.tipoUsuario === 'gestor') {
                window.location.href = '/html/painel_gestor.html';
            }
        } else {
            mensagemErro.textContent = 'Email ou senha inválidos.';
        }
    } catch (erro) {
        console.error('Erro ao tentar logar:', erro);
        mensagemErro.textContent = 'Erro ao conectar com o servidor.';
    }
});