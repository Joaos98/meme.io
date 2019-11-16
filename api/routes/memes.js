const express = require('express');
const router = express.Router();
const postgres = require('../db/index');
const Meme = require(process.cwd() + '/models/memeModel.js'); //Importando o modelo utilizado para o documento de Memes no BD
const Sugestao = require(process.cwd() + '/models/sugestaoModel.js'); //Importando o modelo utilizado para o documento de Sugestões no BD

//Rota para criar um novo meme no banco de dados
//Recebe um objeto contendo os atributos do meme
router.post('/', (req, res) => {
  postgres.query('INSERT INTO memes(urlImgur, idImgur, categorias) values ($1, $2, $3)',
      [req.body.urlImgur, req.body.idImgur, req.body.categorias], (err, resultado) => {
    if (err){
      res.status(400).send(err);
    }else{
      res.status(200).send();
    }
      });
});

//Rota para obter todos os memes no banco de dados
//Retorna um array com os memes encontrados
//Pode receber filtros através de uma query string na URL
router.get('/', (req, res) => {
  let query = 'SELECT * FROM memes';
  let categorias = [];

  if(req.query._id){
    query += ' where id_meme = ' + req.query._id;
  }

  if (req.query.categorias) {
    //Recebe uma string com as categorias para a busca no formato "Categoria;Categoria;Categoria..."
    //Transformar a string com múltiplas categorias em um vetor
    categorias = req.query.categorias.split(';');
    query += ' where ';
    let cont = 1;
    categorias.forEach(categoria => {
      query+= `$${cont} = ANY (categorias)`;
      if (cont < categorias.length){
        query+= ' AND '
      }
      cont++;
    })
  }
  postgres.query(query, categorias, (err, resultado) => {
    if (err){
      res.status(400).send(err);
    }else{
      res.status(200).send(resultado.rows);
    }
  });
});

//Rota para deletar um meme específico no banco de dados
//Recebe o ID do meme específio pelo path da chamada
//Retorna o objeto que representa o meme que foi deletado
router.delete('/deletarMeme:idMeme', async (req, res) => {
  postgres.query('DELETE FROM memes WHERE id_meme = $1', [req.params.idMeme], (err, resultado) => {
    if (err){
      res.status(400).send(err);
    }else{
      res.status(200).send();
    }
  })
});

//Rota para criar uma sugestão de alteração de meme no banco de dados
//Recebe o ID do meme a ser alterado pelo path da chamada
router.post('/sugestaoAlteracao:idMeme', (req, res) => {
  postgres.query('INSERT INTO sugestoes (id_meme, categorias) values ($1, $2)',
      [req.params.idMeme, req.body], (err, resultado) => {
    if (err){
      console.log(err);
      res.status(400).send(err);
    }else{
      res.status(200).send();
    }
  });
});

//Rota para obter todas as sugestões existentes no banco de dados
//Retorna um array que contém todas as sugestões encontradas
router.get('/sugestoes', (req, res) => {
  postgres.query('SELECT * FROM sugestoes', [], (err, resultado) => {
    if (err){
      res.status(400).send(err);
    }else{
      res.status(200).send(resultado.rows);
    }
  });
});

//Rota para validar uma sugestão existente no banco de dados
//Recebe o ID da sugestão pelo path da chamada
router.put('/validarSugestao:idSugestao', async (req, res) => {
  postgres.query('call updateMeme($1)', [req.params.idSugestao], (err, resultado) => {
    if (err){
      console.log(err);
      res.status(400).send(err);
    }else{
      res.status(200).send();
    }
  });
});

//Rota para deletar sugestões existente no banco de dados
//Recebe os parâmetros de busca da sugestão através de uma query string na URL
router.delete('/deletarSugestao', (req, res) => {
  postgres.query('DELETE FROM sugestoes WHERE id_sugestao = $1', [req.query._id], (err, resultado) => {
    if (err){
      res.status(400).send(err);
    }else{
      res.status(200).send();
    }
  })
});

//Rota para aprovar um meme pendente
//Recebe o ID do meme pelo path da chamada
router.put('/aprovarMeme:idMeme', (req, res) => {
  postgres.query('UPDATE memes SET status = TRUE WHERE id_meme = $1', [req.params.idMeme], (err, resultado) => {
    if (err){
      res.status(400).send(err);
    }else{
      res.status(200).send();
    }
  });
});

router.get('/seguidores', (req, res) =>{
  let query = 'SELECT ARRAY_AGG(ms.id_usuario) id_usuario FROM meme_seguido ms ' +
      'WHERE ms.id_meme = $1';
  postgres.query(query, [req.query.id], (err, resultado) =>{
    if (err){
      res.status(400).send(err);
    }else{
      res.status(200).send(resultado.rows);
    }
  })
});

module.exports = router;
