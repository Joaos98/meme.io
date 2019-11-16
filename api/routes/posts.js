const express = require('express');
const router = express.Router();
const postgres = require('../db/index');
const Denuncia = require(process.cwd() + '/models/denunciaModel.js'); //Importando o modelo utilizado para o documento de Denúncias no BD

router.get('/timeline', (req, res) =>{
  let query = 'SELECT distinct p.*, u.nome, u.foto, COUNT(r.id_post) reacoesc, ARRAY_AGG(distinct r.id_usuario) reacoes FROM post p ' +
      'LEFT JOIN usuarios u on p.id_usuario = u.id_usuario ' +
      'LEFT JOIN usuario_seguido us on $1 = us.id_usuario_seguidor ' +
      'LEFT JOIN meme_seguido ms on $1 = ms.id_usuario ' +
      'LEFT JOIN reaoes r on p.id_post = r.id_post '+
      'WHERE p.id_usuario = us.id_usuario_seguido OR p.id_usuario = $1 OR p.id_meme = ms.id_meme ' +
      'GROUP BY p.id_post, u.nome, u.foto '+
      'ORDER BY p.id_post DESC';
  postgres.query(query, [req.query.id_usuario], (err, resultado) =>{
    if (err){
      res.status(400).send(err);
    }else{
      res.status(200).send(resultado.rows);
    }
  })
});

router.get('/feedusuario', (req, res) =>{
  let query = 'SELECT p.*, u.nome, u.foto, COUNT(r.id_post) reacoesc, ARRAY_AGG(distinct r.id_usuario) reacoes FROM post p ' +
      'LEFT JOIN usuarios u on p.id_usuario = u.id_usuario ' +
      'LEFT JOIN reaoes r on p.id_post = r.id_post '+
      'WHERE u.email = $1 ' +
      'GROUP BY p.id_post, u.nome, u.foto '+
      'ORDER BY p.id_post DESC';
  postgres.query(query, [req.query.email], (err, resultado) =>{
    if (err){
      res.status(400).send(err);
    }else{
      res.status(200).send(resultado.rows);
    }
  })
});

router.get('/feedmeme', (req, res) =>{
  let query = 'SELECT p.*, u.nome, u.foto, COUNT(r.id_post) reacoesc, ARRAY_AGG(distinct r.id_usuario) reacoes FROM post p ' +
      'LEFT JOIN usuarios u on p.id_usuario = u.id_usuario ' +
      'LEFT JOIN reaoes r on p.id_post = r.id_post '+
      'WHERE p.id_meme = $1 ' +
      'GROUP BY p.id_post, u.nome, u.foto '+
      'ORDER BY p.id_post DESC';
  postgres.query(query, [req.query.id_meme], (err, resultado) =>{
    if (err){
      res.status(400).send(err);
    }else{
      res.status(200).send(resultado.rows);
    }
  })
});

router.get('/feedTrending', (req, res) =>{
  let query = 'SELECT p.*, u.nome, u.foto, COUNT(r.id_post) reacoesc, ARRAY_AGG(distinct r.id_usuario) reacoes FROM post p '+
      'LEFT JOIN usuarios u on p.id_usuario = u.id_usuario '+
      'LEFT JOIN reaoes r on p.id_post = r.id_post '+
      'GROUP BY p.id_post, u.nome, u.foto '+
      'ORDER BY reacoesc DESC';
  postgres.query(query, [], (err, resultado) =>{
    if (err){
      console.log(err);
      res.status(400).send(err);
    }else{
      res.status(200).send(resultado.rows);
    }
  })
});

//Rota para criar uma denúncia de um post no banco de dados
//Recebe um objeto com os atributos do post específico
router.post('/criarPost', (req, res) => {
  let post = [
    req.body.id_usuario,
    Number(req.body.id_meme),
    req.body.conteudo,
    req.body.urlimgur,
    req.body.idImgur
  ];
  postgres.query('INSERT INTO post (id_usuario, id_meme, data, conteudo, urlimgur, idimgur) values ($1, $2, CURRENT_DATE, $3, $4, $5)',
      post, (err, resultado) => {
    if (err){
      console.log(err);
      res.status(400).send(err);
    }else{
      res.status(200).send();
    }
      });
});

//Rota para deletar post
router.delete('/deletarPost', (req, res) => {
  postgres.query('DELETE FROM post WHERE id_post = $1', [req.query._id], (err, resultado) => {
    if (err){
      res.status(400).send(err);
    }else{
      res.status(200).send();
    }
  });
});

router.post('/denunciarPost', (req, res) => {
  console.log(req.body);
  postgres.query('INSERT INTO denuncias (id_post, conteudo) values ($1, $2)',
      [req.body.idPost, req.body.conteudo], (err, resultado) => {
    if (err){
      res.status(400).send(err);
    }else{
      console.log(resultado);
      res.status(200).send();
    }
  });
});

//Rota para obter todas as denúncias no banco de dados
//Retorna um array com as denúncias encontradas
router.get('/denuncias', (req, res) => {
  postgres.query('SELECT d.*, p.urlimgur, p.idimgur, p.conteudo postConteudo, p.id_usuario  FROM denuncias d LEFT JOIN post p ON d.id_post = p.id_post', [], (err, resultado) => {
    if (err){
      res.status(400).send(err);
    }else{
      res.status(200).send(resultado.rows);
    }
  });
});

//Rota para deletar denúncias utilizando uma query recebida através da URL
router.delete('/deletarDenuncias', (req, res) => {
  postgres.query('DELETE FROM denuncias WHERE id_denuncia = $1', [req.query._id], (err, resultado) => {
    if (err){
      res.status(400).send(err);
    }else{
      res.status(200).send();
    }
  });
});

//Rota para curtir um post recebendo seu id e o id do usuário que ira curtir
router.post('/curtirPost', (req, res) => {
  postgres.query('insert into reaoes values ($1, $2)', [req.query.id_post, req.query.id_usuario], (err, resultado) => {
    if (err){
      res.status(400).send(err);
    }else{
      res.status(200).send();
    }
  });
});

//Rota para decurtir um post recebendo seu id e o id do usuário que ira curtir
router.delete('/descurtirPost', (req, res) => {
  postgres.query('delete from reaoes where id_post = $1 and id_usuario = $2', [req.query.id_post, req.query.id_usuario], (err, resultado) => {
    if (err){
      res.status(400).send(err);
    }else{
      res.status(200).send();
    }
  });
});

module.exports = router;
