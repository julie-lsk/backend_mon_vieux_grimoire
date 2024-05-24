// Importation du package http de Node.js pour gérer les requêtes HTTP
const http = require('http'); /* require = importe le package http depuis nos fichiers (on ne précise pas le chemin)*/

// Importation du module app (app.js), notre application Express
const app = require("./app");


// Fonction qui normalise le port, en convertissant une string en int
const normalizePort = val => {
    const port = parseInt(val, 10); /* string to integer ou NaN */

    if (isNaN(port))
    {
        return val; // Si le port n'est pas un nombre, on le retourne tel quel
    }

    if (port >= 0)
    {
        return port; // Si le port est un nombre positif, on le retourne
    }
};


// Détermination du port sur lequel le serveur écoutera
const port = normalizePort(process.env.PORT || '4000'); // Port défini dans les variables d'environnement, ou par défaut le port 4000 (comme front)
// Configuration du port pour l'application Express
app.set('port', port);


// Gestion des erreurs liées au serveur
const errorHandler = error => {
    if (error.syscall !== "listen")
    {
        throw error;
    }

    const address = server.address();
    const bind = typeof address === "string" ? "pipe " + address : "port : " + port;

    switch (error.code)
    {
        case 'EACCES':
            console.error(bind + " requires elevated privileges.");
            process.exit(1); // Arrêt du processus Node.js
            break;
        case "EADDRINUSE":
            console.error(bind + " is already in use.");
            process.exit(1); // Arrêt du processus Node.js
            break;
        default:
            throw error;
    }
};


// Création du serveur HTTP qui utilisera notre application Express (app)
const server = http.createServer(app);


// Gestion des erreurs du serveur
server.on("error", errorHandler);


// Événement déclenché lorsque le serveur commence à écouter les requêtes
server.on('listening', () =>
{
    const address = server.address();
    const bind = typeof address === "string" ? "pipe " + address : 'port ' + port;
    console.log('Listening on ' + bind); // Affichage de l'adresse sur laquelle le serveur écoute
});


// Mise en écoute du serveur sur le port défini
server.listen(port);