const Book = require('../models/Book');
const fs = require('fs'); /* méthodes d'interaction avec le système de fichiers du serveur (ds PC) */


exports.getAllBooks = (req, res, next) => 
{
    // Récup le tableau de tous les livres dans la BDD
    Book.find()
    // + conversion en JSON des books + MAJ du tableau
    .then(books => res.status(200).json(books))
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
}


/* TODO: A REVOIR */
// exports.getBestBooks = async (req, res, next) => 
// {
//     try {
//         // Rechercher tous les livres, les trier par note moyenne décroissante, et en limiter le nombre à 3
//         const topRatedBooks = await Book.find().sort({ averageRating: -1 }).limit(3);
//         console.log(topRatedBooks)

//         // Envoyez le tableau des 3 meilleurs livres en tant que réponse
//         res.status(200).json(topRatedBooks);
//     } catch (error) {
//         // Gérer les erreurs
//         res.status(500).json({ error: error.message });
//     }
// }


exports.createBook = (req, res, next) =>
{
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id; /* on supprime l'id car il va être géré auto par MongoDB */
    delete bookObject._userId; /* supp userId du client car on va prendre le userId qui vient du token d'auth (évite que qlq utilise le userId de qlq d'autre pour faire qlq chose) */
    console.log(bookObject) /* TODO: à virer */
    const book = new Book ({
        ...bookObject,
        userId: req.auth.userId, /* récup l'userId de par l'auth (vérifiée avec le token) */
        /* On génère ci-dessous l'URL de l'image (car multer nous passe que le nom du fichier) */
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` 
    });

    book.save()
    .then(() => {res.status(201).json({message: "Livre enregistré !!"})})
    .catch(error => {res.status(400).json({error})})
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
                Book.deleteOne({_id: req.params.id})
                .then(() => {res.status(200).json({message: "Objet supprimé !"})})
                .catch(error => res.status(401).json({error}));
            });
        }
    })
    .catch(error => {res.status(500).json({error})});
}