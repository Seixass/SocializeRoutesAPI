import fs from 'node:fs'

const lerDadosUsuarios = (callback) => {
    fs.readFile("usuarios.json", "utf8", (err, data)=>{
        if(err){
            callback(err)
        }
        try {
            const usuarios = JSON.parse(data)
            callback(null, usuarios)
        } catch(error) {
            callback(error)
        }
    });
};

export default lerDadosUsuarios;