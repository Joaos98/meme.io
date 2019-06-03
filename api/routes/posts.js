const express = require('express');
const router = express.Router();
const mongoose = require("mongoose"); //Utilizamos o Mongoose para fazer a integração com o MongoDB
const Post = require(process.cwd() + "/models/postModel.js"); //Importando o modelo utilizado para o documento de Posts no BD

//Rota posts:
router.post('/novoPost', (req, res) => {
    const novoPost = new Post({
        urlImgur: req.body.urlImgur,
        idImgur: req.body.idImgur,
        data: req.body.data,
        idUsuario: req.body.idUsuario,
        idMemeAssociado: req.body.idMemeAssociado,
        conteudo: req.body.conteudo
    });
    novoPost.save()
        .then(() => {
            res.status(200).send("Post salvo com sucesso");
        })
        .catch((err) => {
            res.status(400).send("Problema salvando Post");
            console.log(err);
        });
});

router.delete('/deletePost:idPost', async (req, res) => {
    let post = {};
    await Post.findById(req.params.idPost, (err, res) =>{
        post = res;
    }).catch(err => {
        console.log("Erro ao buscar post com o ID requerido.");
    });
    Post.deleteOne({
        "_id": req.params.idPost
    }, err => {
        if (err){
            console.log("Erro ao realizar o delete do post (API): "+ err);
            res.status(400).send("Problema ao deletar post");
        }else{
            res.status(200).send(post);
        }
    });
});

module.exports = router;