const express = require('express');
const router = express.Router();
const postgres = require('../db/index');
const Denuncia = require(process.cwd() + '/models/denunciaModel.js'); //Importando o modelo utilizado para o documento de Denúncias no BD

//Rota para criar uma denúncia de um post no banco de dados
//Recebe um objeto com os atributos do post específico
router.post('/criarPost', (req, res) => {
  postgres.query('INSERT INTO post (id_usuario, id_meme, CURRENT_DATE, conteudo, urlimgur, idimgur) values ()',
      [], (err, resultado) => {
    if (err){
      res.status(400).send(err);
    }else{
      res.status(200).send();
    }
      });
});
router.post('/denunciarPost', (req, res) => {
  postgres.query('INSERT INTO post (id_post, id_usuario, id_meme, CURRENT_DATE, conteudo, urlimgur, idimgur) values ()')
  postgres.query('INSERT INTO denuncias (id_post, conteudo) values ($1, $2)',
      [req.body.idPost, req.body.conteudo], (err, resultado) => {
    if (err){
      res.status(400).send(err);
    }else{
      res.status(200).send();
    }
  });
});

//Rota para obter todas as denúncias no banco de dados
//Retorna um array com as denúncias encontradas
router.get('/denuncias', (req, res) => {
  postgres.query('SELECT * FROM denuncias', [], (err, resultado) => {
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

module.exports = router;
