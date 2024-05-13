function cadastrarUsuario(request, response, usuarios) {
    const { nomeUsuario, email, senha } = request.body;

    const usuarioExistente = usuarios.find(usuario => usuario.email === email);
    if (usuarioExistente) {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify({ message: 'E-mail já cadastrado.' }));
    }

    const novoUsuario = {
        id: usuarios.length + 1,
        nomeUsuario,
        email,
        senha,
        dataRegistro: new Date()
    };

    usuarios.push(novoUsuario);

    response.writeHead(201, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(novoUsuario));
};

export default cadastrarUsuario;
