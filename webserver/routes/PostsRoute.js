const axios = require('axios'); // Usamos Axios para fazer as requests à API
const Route = require('./Route.js');
const multer = require('multer'); //Usamos o Multer para parsear formuláros do tipo multipart/form-data
const fs = require('fs'); // FileSystem padrão do Node
const apiKeys = require('../configs/apiKeys'); //Arquivo com as chaves das APIs utilizadas
const SessionController = require('../controllers/SessionController.js');
const date = require('date-and-time'); //Utilizado para criar objetos do tipo Data com formatos específicos
const rota = require('../configs/rota');
const stream = require('getstream');
const enviarImgur = require('../static/js/backendFunctions.js'); //Função para enviar imagem para a API do Imgur
const client = stream.connect(
  '55j5n3pfjx3u',
  '29kr9qdxat6gx4uw5d53sg3akbymwf7qcs85252bmhakxt426zjxctaaah3j9hdr',
  '54136'
);

//Configurar aspectos específicos do Multer
const storage = multer.diskStorage({
  //Mudando o destino para salvar as fotos enviadas pro webServer
  destination: function(req, file, cb) {
    cb(null, 'static/media/memes');
  },
  //Configurando para que o nome da foto salva no servidor seja igual ao nome original
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

//TODO: LEMBRAR DE DELETAR AS PUBLICAÇÕES ASSOCIADAS AO MEME QUANDO O MEME FOR DELETADO

class PostsRoute extends Route {
  constructor(basePath) {
    super('/posts');
    //Rota para criar um post no banco de dados
    //Recebe uma imagem, uma string com o conteúdo do post e o ID do meme associado
    this.router.post(
      '/createPost',
      SessionController.authenticationMiddleware(),
      upload.single('arquivoEnviado'),
      async (req, res)=> {
        //Enviando a imagem pra API do Imgur
        const respostaImgur = await enviarImgur(req.file.path, '1BQ66Yj', req.file.filename);
        //Checar se a foto foi armazenada com sucesso no imgur
        if (respostaImgur.data.success == true) {
          //Criando uma data
          let now = new Date();
          now = date.format(now, 'DD/MM/YYYY');
          let post = {
              id_meme : req.body.memeID,
              id_usuario : req.user.id_usuario,
              urlimgur  : respostaImgur.data.data.link,
              conteudo: req.body.conteudoPost,
              idImgur: respostaImgur.data.data.id,
              data: now
          };
            axios
                .post(rota + '/posts/criarPost', post)
                .then(() => {
                    res.status(200).redirect('/');
                })
                .catch(err => {
                    console.log('erro do catch do post pra nossa api: ' + err);
                });
        }else{
            //Caso a foto não tenha sido armazenada no Imgur
            console.log('Erro ao enviar a imagem para o Imgur');
            res.status(400).redirect('/');
        }
          });

    //Rota que deleta um post do banco de dados
    //Recebe o ID do post e o ID do usuário que fez o post
    this.router.post(
      '/deletePost',
      SessionController.authenticationMiddleware(),
      (req, res) => {
        //Deletar o post do banco
          axios
              .delete(rota + '/posts/deletarPost?_id=' + req.body.postID)
              .then(() => {
                  //Excluir a foto do meme armazenada no Imgur
                  axios
                      .delete('https://api.imgur.com/3/image/' + req.body.idImgur, {
                          headers: { Authorization: `Bearer ${apiKeys.imgurAccessToken}` }
                      })
                      .then(() => {
                          res.sendStatus(200);
                      })
                      .catch(err => {
                          console.log('Erro ao excluir a imagem do imgur: ' + err);
                          res.sendStatus(400);
                      });
              })
              .catch(err => {
                  console.log('Erro ao excluir post: ' + err);
                  res.sendStatus(400);
              });
      }
    );

    //Rota que denuncía um post
    //Recebe uma string com o conteúdo da denúncia, o ID do post e o ID do usuário que fez o post
    this.router.post(
      '/denunciarPost',
      SessionController.authenticationMiddleware(),
      async (req, res) => {
        //Instanciar a nova denúncia com as informações recebidas no body
        const denuncia = req.body;
        //Enviar a denúncia criada para o banco de dados
        axios
          .post(rota + '/posts/denunciarPost', denuncia)
          .then(res.redirect('back'))
          .catch(err => {
            console.log('Erro ao criar denúncia.');
            //TODO: RENDER ERROR FLASH MESSAGE
            res.redirect('/');
          });
      }
    );

    //Rota para aceitar uma denúncia
    //Recebe o ID do usuário que fez o post que foi denunciado, o ID do post e o ID da imagem do post no Imgur
    this.router.post('/aceitarDenuncia', async (req, res) => {
        await axios.put(rota+'/usuarios/aceitarDenuncia'+ req.body.idDenuncia)
            .then( apiResponse => {
                    //Deletar a imagem do post do Imgur
                    axios
                        .delete('https://api.imgur.com/3/image/' + req.body.idImgur, {
                            headers: {Authorization: `Bearer ${apiKeys.imgurAccessToken}`}
                        })
                        .then()
                        .catch(err => {
                            console.log('Erro ao excluir a imagem do imgur: ' + err);
                        })
                }
                )
            .catch(err=>{
                    console.log("Erro ao aceitar denuncia");
            }
            );
      res.end();
    });

    //Rota para recusar uma denúncia
    //Recebe o ID da denúncia
    this.router.post('/recusarDenuncia', (req, res) => {
      axios
        .delete(rota + '/posts/deletarDenuncias?_id=' + req.body.idDenuncia)
        .then(apiResponse => {
          if (apiResponse.status == 400) {
            console.log('Erro ao deletar a sugestão na API.');
          }
          res.end();
        })
        .catch(err => {
          console.log('Erro ao tentar deletar a denuncia.');
          res.end();
        });
    });

    //Rota para avaliar um post
    //Recebe o ID do post sendo avaliado
    this.router.post('/avaliarPost', async (req, res) => {
        let idPost = Number(req.body.postID);
        let idUsuario = Number(req.body.usuarioID);
        let curtidas = JSON.parse(req.body.curtidas);
      //Checar se o post já está curtido pelo usuário no momento da chamada
      if (curtidas.includes(idUsuario)) {
          axios.delete(rota+"/posts/descurtirPost?id_usuario="+idUsuario+"&id_post="+idPost)
              .then()
              .catch(err =>{
              })
      } else {
          axios.post(rota+"/posts/curtirPost?id_usuario="+idUsuario+"&id_post="+idPost)
              .then()
              .catch(err =>{
              })
      }
      res.end();
    });
  }
}
module.exports = PostsRoute;
