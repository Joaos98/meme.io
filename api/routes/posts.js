const express = require('express');
const router = express.Router();
const mongoose = require("mongoose"); //Utilizamos o Mongoose para fazer a integração com o MongoDB
const Denuncia = require(process.cwd() + "/models/denunciaModel.js"); //Importando o modelo utilizado para o documento de Denúncias no BD

//ROTA PARA DENUNCIAR UM POST
router.post('/denunciarPost', (req, res) => {
    //INSTANCIANDO A DENÚNCIA
    const novaDenuncia = new Denuncia({
        postID: req.body.idPost,
        usuarioID: req.body.idUsuario,
        conteudo: req.body.conteudo,
        postUrlImgur: req.body.urlImgur,
        postConteudo: req.body.conteudoPost,
        idImgur: req.body.idImgur
    });

    //SALVANDO A DENÚNCIA NO BD
    novaDenuncia.save()
        .then(() => {
            res.status(200).send("Denúncia salva com sucesso.");
        })
        .catch(err => {
            console.log(err.message);
            res.status(400).send("Problema salvando denúncia.");
        });
});
//ROTA PARA PEGAR TODAS AS DENÚNCIAS DO BD
router.get('/denuncias', (req, res) => {
    Denuncia.find({}, (err, denuncias) => {
        res.status(200).send(denuncias);
    })
        .catch(err => {
            console.log("Erro ao buscar as denúncias no BD:" + err.message);
            res.status(400).send("Erro ao buscar as denúncias no BD!");
        });
});
//ROTA PARA DELETAR TODAS AS DENÚNCIAS DE UM POST (Utilizada quando uma denúncia é aceita)
router.delete('/deletarTodasDenuncias:idPost', (req, res) => {
    Denuncia.deleteMany({"postID": req.params.idPost})
        .then(() => {
            res.status(200).send("Denuncia deletada com sucesso.");
        })
        .catch(err => {
            res.status(400).send("Erro ao deletar denuncia.");
        });
});
//ROTA PARA DELETAR UMA DENÚNCIA (Utilizada quando uma denúncia é recusada)
router.delete('/deletarDenuncia:idDenuncia', (req, res) => {
    Denuncia.deleteMany({"_id": req.params.idDenuncia})
        .then(() => {
            res.status(200).send("Denuncia deletada com sucesso.");
        })
        .catch(err => {
            res.status(400).send("Erro ao deletar denuncia.");
        });
});


module.exports = router;