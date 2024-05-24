const bcrypt = require("bcrypt"); /* hash le MDP */
const jwt = require('jsonwebtoken'); /* création token d'auth */

const User = require("../models/User");


/* Enregistrement new utilisateur */
exports.signup = (req, res, next) => {
    /* Création du hash (asynchrone donc .then + .catch */
    bcrypt.hash(req.body.password, 10) /* data, salt (cmb de fois on exécute l'algo de hashage) */
    .then(hash =>
        {
            /* Enregistre le new MDP hashé ds un new user */
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save() /* New ut. enregistré dans la BDD */
            .then(() => res.status(201).json({message: "Utilisateur créé !"}))
            .catch(error => res.status(400).json({error}))
        }
    )
    .catch(error => res.status(500).json({error}));
};


/* Connexion des utilisateurs */
exports.login = (req, res, next) => {
    User.findOne({email: req.body.email})
    .then(user => {
        if (!user)
        {
            /* L'utilisateur n'a pas été trouvé dans la BDD */
            return res.status(401).json({message: 'Paire identifiant/mot de passe incorrecte'}); 
        }
        bcrypt.compare(req.body.password, user.password) /* compare le mdp client + mdp stocké (+ crypté/hashé) */
        .then(valid =>
        {
            if (!valid)
            {
                /* Si ça revient à false = mdp transmis n'est pas correct */
                return res.status(401).json({error: 'Paire identifiant/mot de passe incorrecte'});
            }
            /* Si mdp revient à true = on envoie les infos à la BDD */
            res.status(200).json({
                userId: user._id,
                token: jwt.sign ( /* comprend les données qu'on veut encoder */
                    /* On encode le userId aussi pour création news objets = l'utilisateur pourra uniquement modifier l'objet qu'il a créé (pas les autres) */
                    {userId: user._id}, /* pour bien identifier la req. du bon utilisateur/le bon userId */
                    "RANDOM_TOKEN_SECRET", /* clé secrète pour l'encodage (en production = doit être bcp plus longue et aléatoire pour sécurisé l'encodage) */
                    {expiresIn: '24h'}
                )
            });

        })
        .catch(error => res.status(500).json({error})); /* erreur système */
    })
    .catch(error => res.status(500).json({error})); /* erreur affichée si erreur d'exécution de req. dans la BDD --> UNIQUEMENT */
};