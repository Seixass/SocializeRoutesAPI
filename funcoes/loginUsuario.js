function fazerLogin(request, response, usuarios) {
    const { email, senha } = request.body;

    const usuario = usuarios.find(usuario => usuario.email === email && usuario.senha === senha);
    if (!usuario) {
        response.writeHead(401, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify({ message: 'Credenciais inválidas' }));
    }

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(usuario));
};

export default fazerLogin;