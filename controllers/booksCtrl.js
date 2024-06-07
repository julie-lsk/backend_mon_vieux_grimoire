const Book = require('../models/Book');
const fs = require('fs'); /* méthodes d'interaction avec le système de fichiers du serveur (ds PC) */
const path = require('path');


exports.getAllBooks = (req, res, next) => 
{
    // Récup le tableau de tous les livres dans la BDD
    Book.find()
    // + conversion en JSON des books + MAJ du tableau
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({error}));
};



exports.getBestBooks = (req, res, next) =>
{
    Book.find({}) /* Récup tous les livres de la BDD */
    .sort({ averageRating: -1 }) /* Tri les notes (moyenne décroissante) */
    .limit(3) /* Limite à 3 livres */
    .then(books => res.status(200).json(books)) /* renvoie un tableau des 3 livres */
    .catch(error => res.status(400).json({error}));
};



exports.getOneBook = (req, res, next) =>
{
    Book.findOne({_id: req.params.id}) /* pour trouver l'objet selon son id */
    .then(book => 
    {
        res.status(200).json(book);
    })
    .catch(error => res.status(404).json(error));
};



exports.createBook = (req, res, next) =>
{
    /* Récup du livre créé dans le formulaire côté front */
    const bookObject = JSON.parse(req.body.book); 

    delete bookObject._id; /* Supp l'ID car MongoDB le génère automatiquement */
    delete bookObject._userId; /* Supp userId du client pour utiliser celui vérifié par le token d'auth (évite que qlq utilise le userId de qlq d'autre) */

    /* Création d'une variable avec les infos du new livre */
    const book = new Book ({
        ...bookObject, /* copie les données de bookObject, les décompose et les passe dans le nouveau "book" */
        userId: req.auth.userId, /* Utilise l'userId du token d'authentification */
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`, /* Génère l'URL de l'image en utilisant le protocole, l'hôte et le nom du fichier */
        ratings: [],
        averageRating: 0
    });

    /* Enregistre le livre dans la BDD */
    book.save()
    .then(() => {res.status(201).json({message: "Livre enregistré : ", book})})
    .catch(error => {res.status(400).json({error})})
};



exports.modifyBook = (req, res, next) =>
{
    /* Supprime l'image déjà existante si ajout d'une nouvelle */
    const deleteImage = (imagePath) => {
        fs.unlink(imagePath, (err) => {
            if (err) {
                console.error("Erreur lors de la suppresion de l'ancienne image :", err);
            }
        });
    };

    /* On vérifie si une image est dans notre requête */
    const bookObject = req.file ? 
    {
        ...JSON.parse(req.body.book), /* Si on a un fichier, on parse la string + recréé l'URL de l'image */
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } :
    {
        /* s'il n'y a pas de fichier, on récup juste l'objet dans le corps de la requête */
        ...req.body
    };

    /* Sécurité - supp userId pour éviter que qlq modifie un objet et le réassigne à qlq d'autre */
    delete bookObject._userId;

    /* Cherche notre objet dans la BDD - pour vérif l'utilisateur et ses droits de modif */
    Book.findOne({_id: req.params.id}) /* récup de l'objet dans la BDD */
    .then((book) => { /* on recherche l'objet  */
        /* On vérifie que l'objet appartient bien à l'ut. qui nous envoie la requête de modif */
        if (book.userId != req.auth.userId) /* Si l'id du créateur de l'objet n'est pas le même que l'id de celui qui souhaite le modifier */
        {
            /* L'objet ne lui appartient pas donc renvoi erreur */
            res.status(403).json({message: "Requête non autorisée"});
        }
        else
        {
            /* Si une nouvelle image est téléchargée, supprimer l'ancienne image */
            if (req.file) {
                const oldImagePath = path.join(__dirname, '..', 'images', path.basename(book.imageUrl));
                deleteImage(oldImagePath);
            }

            /* Si c'est le bon utilisateur (2 id correspondent), alors on met à jour l'objet */
            Book.updateOne(
                {_id: req.params.id}, /* précise quel enregistrement mettre à jour */
                {
                    ...bookObject, /* précise quel objet mettre à jour (celui qu'on a récup dans le body de la fonction) */
                    _id: req.params.id /* précise l'id = celui qui vient des paramètres de l'URL */
                }
            )
            .then(() => res.status(200).json({message: "Livre modifié !"}))
            .catch(error => res.status(401).json({error}));
        }
    }) 
    .catch((error) => {
        res.status(400).json({error})
    });
};



exports.deleteBook = (req, res, next) =>
{
    Book.findOne({_id: req.params.id})
    .then(book => 
    {
        /* on vérifie si c'est bien le propriétaire de l'objet qui dmd la suppression */
        if (book.userId != req.auth.userId) 
        {
            /* Si ce n'est pas le même utilisateur, message d'erreur */
            res.status(401).json({message: "Non autorisé."});
        }
        else
        {
            /* si c'est le bon utilisateur, alors on supprime l'objet + l'image dans les fichiers du PC */
            const filename = book.imageUrl.split("/images/")[1]; /* Récup de l'img dans les fichiers (split autour du répertoire images) */
            fs.unlink(`images/${filename}`, () => /* fs.unlick = package fs pour supp un fichier ds dossiers PC */
            {
                Book.deleteOne({_id: req.params.id}) /* Récup id depuis paramètres URL */
                .then(() => {res.status(200).json({message: "Objet supprimé !"})})
                .catch(error => res.status(401).json({error}));
            });
        }
    })
    .catch(error => {res.status(500).json({error})});
};



exports.createRating = (req, res, next) =>
{
    Book.findOne({_id: req.params.id})
    .then(book =>
    {
        const userId = req.auth.userId; /* Recherche le userId de l'utilisateur connecté */
        const rating = req.body.rating; /* Recherche la note de l'utilisateur */

        /* Erreur si livre non trouvé dans la BDD */
        if (!book)
        {
            return res.status(404).json({message: "Livre non trouvé."});
        }

        /* Vérifie si l'utilisateur a déjà noté le livre */
        const existingRating = book.ratings.find(r => r.userId === userId);
        if (existingRating)
        {
            return res.status(400).json({message: "Vous avez déjà noté ce livre."});
        }

        /* Ajoute la nouvelle note */
        book.ratings.push({userId: userId, grade: rating});

        /* Calcule la nouvelle moyenne - averageRating */
        const totalRatings = book.ratings.length;
        const sumRatings = book.ratings.reduce((sum, r) => sum + r.grade, 0);
        book.averageRating = Math.ceil(sumRatings / totalRatings); /* Arrondi au supérieur */

        /* MAJ du livre dans la BDD */
        return book.save()
        /* Renvoie un objet du livre */
        .then(() => res.status(200).json(book))
        .catch(error => res.status(500).json({message: "Erreur lors de la sauvegarde du livre.", error})); 
    })
    .catch(() => res.status(500).json({message: "Erreur serveur."}));
};