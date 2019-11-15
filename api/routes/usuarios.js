const express = require('express');
const router = express.Router();
const postgres = require('../db/index');
const mongoose = require('mongoose');
const Usuario = require(process.cwd() + '/models/usuarioModel.js');

//Rota que realiza a busca de usuários no banco de dados
//Recebe uma query através da URL
router.get('/', async (req, res) => {
  let chaves = Object.keys(req.query);
  let query = "";
  if (chaves.length > 0){
    query += "where ";
  }
  for (let i = 0; i < chaves.length; i++){
    query += chaves[i] + " = $" + (i+1)
    if (i == chaves.length - 1){

    }else{
      query += ' AND '
    }
  }
  let parametros = Object.keys(req.query).map(function(key) {
    return req.query[key];
  });
  postgres.query('SELECT * FROM usuarios ' + query, parametros, (err, resultado) => {
    if (err) {
      console.log('Erro ao buscar usuário: ' + err);
      res.status(400).send('Erro ao buscar usuário.');
    } else {
      res.status(200).send(resultado.rows);
    }
  });
});

//Rota para conceder privilégios de administrador a um usuário
//Recebe o e-mail do usuário em questão através do path da chamada
router.put('/concederPrivilegios:emailUsuario', (req, res) => {
  postgres.query('UPDATE usuarios SET adm = TRUE where email = $1', [req.params.emailUsuario], (err, resultado) => {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    }else{
      res.status(200).send(resultado.rows);
    }
  });
});

//Rota para revogar os privilégios de administrador de um usuário
//Recebe o e-mail do usuário em questão através do path da chamada
router.put('/revogarPrivilegios:emailUsuario', (req, res) => {
  postgres.query('UPDATE usuarios SET adm = FALSE where email = $1', [req.params.emailUsuario], (err, resultado) => {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    }else{
      res.status(200).send(resultado.rows);
    }
  });
});

//Rota para banir um usuário do sistema
//Recebe o e-mail do usuário em questão pelo path da chamada
router.put('/banirUsuario:emailUsuario', (req, res) => {
  postgres.query('UPDATE usuarios SET status = 0 where email = $1', [req.params.emailUsuario], (err, resultado) => {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    }else{
      res.status(200).send(resultado.rows);
    }
  });
});

//Rota para criar um novo usuário no banco de dados
//Recebe um objeto com os atributos do novo usuário que será instanciado
router.post('/', (req, res) => {
  console.log('Post recebido.');
  const parametros = [req.body.nome, req.body.email, req.body.senha];
  postgres.query('INSERT INTO usuarios (nome, email, senha) values ($1, $2, $3)', parametros, (err, resultado) => {
    if (err){
      console.log(err);
      res.status(400).send(err);
    }else{
      res.status(200).send(resultado.rows);
    }
  });
});

//Rota para desativar um usuário
//Recebe o ID do usuário através path da chamada
router.put('/desativarUsuario:idUsuario', (req, res) => {
  postgres.query('UPDATE usuarios SET status = 1 where id_usuario = $1', [req.params.idUsuario], (err, resultado) => {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    }else{
      res.status(200).send(resultado.rows);
    }
  });
});

//Rota para atualizar o nome do usuário
//Recebe o ID do usuário através do path da chamada
router.put('/atualizarNome:idUsuario', (req, res) => {
  postgres.query('UPDATE usuarios SET nome = $1 where id_usuario = $2', [req.body.novoNome, req.params.idUsuario], (err, resultado) => {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    }else{
      res.status(200).send(resultado.rows);
    }
  });
});

//Rota para atualizar o e-mail do usuário
//Recebe o ID do usuário através do path da chamada
router.put('/atualizarEmail:idUsuario', (req, res) => {
  postgres.query('UPDATE usuarios SET email = $1 where id_usuario = $2', [req.body.novoEmail, req.params.idUsuario], (err, resultado) => {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    }else{
      res.status(200).send(resultado.rows);
    }
  });
});

//Rota para atualizar a senha do usuário
//Recebe o ID do usuário através do path da chamada
router.put('/atualizarSenha:idUsuario', (req, res) => {
  postgres.query('UPDATE usuarios SET senha = $1 where id_usuario = $2', [req.body.novaSenha, req.params.idUsuario], (err, resultado) => {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    }else{
      res.status(200).send(resultado.rows);
    }
  });
});

//Rota para atualizar a foto do usuário
//Recebe o ID do usuário através do path da chamada
router.put('/alterarFotoUsuario=:idUsuario', (req, res) => {
  postgres.query('UPDATE usuarios SET foto = $1 where id_usuario = $2', [req.body.novaFoto, req.params.idUsuario], (err, resultado) => {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    }else{
      res.status(200).send(resultado.rows);
    }
  });
});

//Rota para reativar a conta de um usuário
//Recebe o ID do usuário através do path da chamada
router.put('/reativarUsuario:idUsuario', (req, res) => {
  postgres.query('UPDATE usuarios SET status = 2 where id_usuario = $1', [req.params.idUsuario], (err, resultado) => {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    }else{
      res.status(200).send(resultado.rows);
    }
  });
});

//Rota para recuperar a senha de um usuário
//Recebe o e-mail do usuário em questão, a chave para recuperar a senha e sua validade
router.put('/recuperarSenha', (req, res) => {
  postgres.query('UPDATE usuarios SET recuperacao_id = $1, recuperacao_validade = $2 where email = $3',
      [req.body.chave, req.body.validade, req.body.emailUsuario], (err, resultado) => {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    }else{
      res.status(200).send(resultado.rows);
    }
  });
});

//Rota que atualiza o número de denúncias de um usuário
//Recebe o ID do usuário através do path da chamada
router.put('/aceitarDenuncia:idDenuncia', async (req, res) => {
  postgres.query('call aceitarDenuncia($1)', [req.params.idDenuncia], (err, resultado) => {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    }else{
      res.status(200).send();
    }
  });
});

//Rota que realiza o unfollow de um meme por um usuário
//Recebe o ID do usuário e o ID do meme através do path da chamada
router.put('/unfollowMeme:usuarioID/:memeID', (req, res) => {
  postgres.query('call unfollowMeme($1, $2)', [req.params.memeID, req.params.usuarioID], (err, resultado) => {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    }else{
      res.status(200).send();
    }
  });
});

//Rota que realiza o follow de um meme por um usuário
//Recebe o ID do usuário e o ID do meme através do path da chamada
router.put('/seguirMeme:usuarioID/:memeID', (req, res) => {
  postgres.query('call followMeme($1, $2)', [req.params.memeID, req.params.usuarioID], (err, resultado) => {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    }else{
      res.status(200).send();
    }
  });
});

//Rota que realiza o unfollow de um usuário por outro usuário
//Recebe os IDs dos dois usuários através do path da chamada
router.put('/unfollowUsuario:usuarioID/:usuarioVisitadoID', (req, res) => {
  postgres.query('call unfollowUsuario($1, $2)', [req.params.usuarioVisitado, req.params.usuarioID], (err, resultado) => {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    }else{
      res.status(200).send();
    }
  });
});

//Rota que realiza o follow de um usuário por outro usuário
//Recebe os IDs dos dois usuários através do path da chamada
router.put('/seguirUsuario:usuarioID/:usuarioVisitadoID', (req, res) => {
  postgres.query('call followUsuario($1, $2)', [req.params.usuarioVisitado, req.params.usuarioID], (err, resultado) => {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    }else{
      res.status(200).send();
    }
  });
});

module.exports = router;
