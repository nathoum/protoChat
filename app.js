var app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    ent = require('ent'), // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
    fs = require('fs');

var express = require('express');
//var appbis = express();

// Chargement de la page index.html
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.use(express.static(__dirname + '/public'));

/**
 * Historique des messages
 */
var messages = [];


var loggedUsers = [];

io.sockets.on('connection', function (socket, pseudo) {

    //historique
   for (i = 0; i < messages.length; i++) {
            console.log(messages[i].pseudo);
          socket.emit('message', {pseudo: messages[i].pseudo, message: messages[i].message});
    }


    // Dès qu'on nous donne un pseudo, on le stocke en variable de session et on informe les autres personnes
    socket.on('nouveau_client', function(pseudo) {
        pseudo = ent.encode(pseudo);
        socket.pseudo = pseudo;
        socket.broadcast.emit('nouveau_client', pseudo);

        //loggedUsers.push(pseudo);
    });


        socket.on('disconnect', function () {
            socket.broadcast.emit('user-logout', socket.pseudo);
        });

        

         

    // Dès qu'on reçoit un message, on récupère le pseudo de son auteur et on le transmet aux autres personnes
    socket.on('message', function (message) {
        message = ent.encode(message);
        socket.broadcast.emit('message', {pseudo: socket.pseudo, message: message});
        socket.broadcast.emit('update-stoptyping', socket.pseudo);
        messages.push({pseudo: socket.pseudo, message: message});
        if (messages.length > 150) {
          messages.splice(0, 1);
        }
    }); 





    /**
     * Réception de l'événement 'start-typing'
     * L'utilisateur commence à saisir son message
    */

    socket.on('start-typing', function (pseudo) {
        pseudo = ent.encode(pseudo);
        console.log("start typing");
        socket.broadcast.emit('update-typing', pseudo);
    }); 


    socket.on('stop-typing', function (pseudo) {
        pseudo = ent.encode(pseudo);
        socket.broadcast.emit('update-stoptyping', pseudo);
    }); 



   

});

server.listen(8080);