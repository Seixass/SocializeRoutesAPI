import http from 'http';
import { parse } from 'url';
import cadastrarUsuario from './usuarios.js';
import fazerLogin from './login.js';

let usuarios = [];

const server = http.createServer((request, response) => {
    const { method, url } = request;
    const { pathname } = parse(url, true);

    if (method === 'POST' && pathname === '/usuarios') {
        handleUsuarios(request, response);
    } else if (method === 'POST' && pathname === '/login') {
        handleLogin(request, response);
    } else {
        // Tratar outras rotas
    }
});

function handleUsuarios(request, response) {
    let body = '';
    request.on('data', chunk => {
        body += chunk.toString();
    });
    request.on('end', () => {
        const requestBody = JSON.parse(body);
        cadastrarUsuario(request, response, usuarios, requestBody);
    });
}

function handleLogin(request, response) {
    let body = '';
    request.on('data', chunk => {
        body += chunk.toString();
    });
    request.on('end', () => {
        const requestBody = JSON.parse(body);
        fazerLogin(request, response, usuarios, requestBody);
    });
}

server.listen(3333, () => {
    console.log('Servidor rodando na porta 3333');
});