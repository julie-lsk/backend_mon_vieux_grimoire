const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require('path'); /* accède au path/chemin du serveur dans répertoire PC */

// Import des infos confidentielles via dotenv
const dotenv = require('dotenv');
dotenv.config();

const booksRoutes = require("./routes/booksRoutes");
const userRoutes = require('./routes/userRoutes');


/* Importation de Mongoose */
mongoose.connect(process.env.DB_URL)
.then(() => console.log("Connexion à MongoDB réussie ! =D"))
.catch(() => console.log("Connexion à MongoDB échouée ! :("));


/* Création de notre app Express */
const app = express();

/* Permet d'avoir accès aux corps des requêtes (app.get, app.post... plus bas) */
app.use(express.json());


/*En-têtes pour résoudre les problèmes CORS (= bloque la communication entre les 2 serveurs localhost:3000 et 4200) */
app.use((req, res, next) => 
{
    /* L'étoile précise que tt le monde peut accéder à notre API */
    res.setHeader('Access-Control-Allow-Origin', '*'); 

    /* Autorisation de certains headers sur l'objet requête HTTP */
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');

    /* Autorisation de certains verbes pour requêtes HTTP */
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');

    /* Garantit que les requêtes cross-origin se déroulent sans problème */
    if (req.method === 'OPTIONS') 
    {
        return res.status(204).end();
    }

    next();
});

/* Permet l'utilisation de req.body pour extraire le corps des requêtes */
app.use(bodyParser.json());

app.use("/api/books", booksRoutes);
app.use("/api/auth", userRoutes);

/* indique à Express comment gérer les fichiers */
app.use("/images", express.static(path.join(__dirname, 'images'))); /* express.static + path.join = renvois fichiers statiques pour 1 route donnée */


module.exports = app;