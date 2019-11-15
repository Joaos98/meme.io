// Mesmo dentro da intenção de aplicação independente, nossa API/DAL foi feita pra conectar-se a um BD Mongo. A refatoração
// para um BD diferente exigiria um nível variante de esforço, dependendo da disponibilidade de ferramentas node/express
// similares à mongoose.
// Usando as bibliotecas de conexão com postgreSQL ou mySQL, por exemplo, teríamos pouquíssimo esforço necessário na
// refatoração, pois elas seguem paradigmas e até sintaxes similares à mongoose. Na ausência de tal similaridade, porém,
// teríamos que substituir nossas chamadas ao BD via funções JS (e.g.: object.save()) por queries SQL, sendo assim um
// esforço de refatoração consideravelmente maior.
const express = require('express');

// A databaseURI é utilizada para conectar a API ao BD via biblioteca mongoose.
class API {
  constructor(serverPort, serverHost, databaseURI) {
    this.serverPort = serverPort;
    this.serverHost = serverHost;
    this.serverDependencies = {
      bodyParser: require('body-parser')
    };
    this.serverInstance = express();
  }

  setupServer() {
    const api = this.serverInstance;
    const bodyParser = this.serverDependencies.bodyParser;

    api.use(
      bodyParser.urlencoded({
        extended: true
      })
    );
    api.use(bodyParser.json());

    api.use('/usuarios', require(process.cwd() + '/routes/usuarios.js'));
    api.use('/memes', require(process.cwd() + '/routes/memes.js'));
    api.use('/posts', require(process.cwd() + '/routes/posts.js'));
  }

  static startServer() {
    const api = new API(
      3000,
      'localhost',
    );
    api.setupServer();
    api.serverInstance.listen(api.serverPort, () => {
      console.log('Server iniciado. Porta: ' + api.serverPort);
    });
    module.exports = api;
  }
}

API.startServer();
