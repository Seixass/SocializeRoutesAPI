import http from 'node:http';
import fs from 'node:fs';
import { formidable } from "formidable";
import lerDadosUsuario from './funcoes/lerDadosUsuarios.js';

const PORT = 3333;

const ApiResponse = (res, status, data) => {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
}

const server = http.createServer(async (request, response) => {
    const { method, url } = request;

    if (url === '/usuarios' && method === "GET") { // Listar usuários
        lerDadosUsuario((err, usuarios) => {
            if (err) {
                return ApiResponse(response, 500, { message: 'Erro ao ler o arquivo' });
            }
            return ApiResponse(response, 200, usuarios);
        });
    } else if (method === 'POST' && url === '/usuarios') { // Cadastrar usuários
        let body = '';
        request.on('data', (chunk) => {
            body += chunk;
        });
        request.on('end', () => {
            if (!body) {
                return ApiResponse(response, 400, { message: 'Corpo da solicitação vazio' });
            }
            const novoUsuario = JSON.parse(body);
            lerDadosUsuario((err, usuarios) => {
                if (err) {
                    return ApiResponse(response, 500, { message: 'Erro ao cadastrar o usuário' });
                }
                novoUsuario.id = usuarios.length + 1;
                usuarios.push(novoUsuario);
                fs.writeFile('usuarios.json', JSON.stringify(usuarios, null, 2), (err) => {
                    if (err) {
                        return ApiResponse(response, 500, { message: 'Erro ao cadastrar o usuário no arquivo' });
                    }
                    return ApiResponse(response, 201, novoUsuario);
                });
            });
        });
    } else if (url === '/login' && method === "POST") { // Login usuários
        let body = '';
        request.on('data', (chunk) => {
            body += chunk;
        });
        request.on('end', () => {
            if (!body) {
                return ApiResponse(response, 400, { message: 'Corpo da solicitação vazio' });
            }
            const novoLogin = JSON.parse(body);
            lerDadosUsuario((err, usuarios) => {
                if (err) {
                    return ApiResponse(response, 500, { message: 'Erro ao logar o usuário' });
                }
                const user = usuarios.find((usuario) => usuario.email === novoLogin.email && usuario.senha === novoLogin.senha);
                if (!user) {
                    return ApiResponse(response, 404, { message: 'Credenciais inválidas' });
                }
                return ApiResponse(response, 200, { message: 'Login bem-sucedido' });
            });
        });
    } else if (url.startsWith('/perfil/') && method === 'GET') { // Encontrar perfil pelo ID
        const id = parseInt(url.split('/')[2])
        lerDadosUsuario((err, perfil) => {
            if (err) {
                return ApiResponse(response, 500, { message: 'Erro interno no servidor' });
            }
            const perfilEncontrado = perfil.find((perfil) => perfil.id === id)
            if (!perfilEncontrado) {
                return ApiResponse(response, 404, { message: 'Perfil não encontrado' });
            }
            return ApiResponse(response, 200, perfilEncontrado);
        });
    } else if (method === 'PUT' && url.startsWith('/perfil/')) { // Atualizar Perfil
        const id = parseInt(url.split('/')[2])
        let body = ''
        request.on('data', (chunk) => {
            body += chunk
        })
        request.on('end', () => {
            if (!body) {
                return ApiResponse(response, 400, { error: "O corpo da requisição está vazio!" })
            }
            lerDadosUsuario((err, usuarios) => {
                if (err) {
                    return ApiResponse(response, 500, { message: 'Erro ao ler dados do usuário' })
                }
                const indexPerfil = usuarios.findIndex((perfil) => perfil.id === id)
                if (indexPerfil === -1) {
                    return ApiResponse(response, 404, { message: 'Perfil não encontrado' })
                }
                const perfilAtualizado = JSON.parse(body)
                perfilAtualizado.id = id
                usuarios[indexPerfil] = perfilAtualizado
                fs.writeFile('usuarios.json', JSON.stringify(usuarios, null, 2), (err) => {
                    if (err) {
                        return ApiResponse(response, 500, { message: 'Não é possível atualizar o perfil' })
                    }
                    return ApiResponse(response, 200, perfilAtualizado)
                })
            });
        });
    } else if (method === "POST" && url.startsWith("/perfil/imagem")) { // Upload de uma imagem para o perfil

        const id = parseInt(url.split('/')[3])
        const form = formidable({})
        let arquivos;
        let campos;
        try {
            [arquivos, campos] = await form.parse(request)
        } catch (err) {
            return ApiResponse(response, 500, { error: "Não foi possível carregar!" })
        }
        fs.rename(campos.file[0].filepath, `imgs/${campos.file[0].newFilename}.png`, (err) => {
            if (err) { return ApiResponse(response, 500, { error: "Erro interno do servidor!" }) }
        })
        lerDadosUsuario((err, usuarios) => {
            if (err) {
                return ApiResponse(response, 500, { message: 'Erro ao cadastrar o usuário' });
            }
            const indexatt = usuarios.findIndex((user) => user.id === id)
            usuarios[indexatt].perfil.imagem = `imgs/${campos.file[0].newFilename}.png`
            fs.writeFile('usuarios.json', JSON.stringify(usuarios, null, 2), (err) => {
                if (err) {
                    return ApiResponse(response, 500, { message: 'Erro ao cadastrar o usuário no arquivo' });
                }
            });
        });
        return ApiResponse(response, 200, { campos, arquivos });
    } else {
        return ApiResponse(response, 404, { message: 'Rota não encontrada' });
    }
});

server.listen(PORT, () => {
    console.log(`Servidor em execução na porta: ${PORT}`);
});
