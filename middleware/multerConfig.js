const multer = require("multer");


const MIM_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};


/* Storage pour indiquer où enregistrer les fichiers téléchargés (entrants) */
const storage = multer.diskStorage({
    destination: (req, file, callback) => 
    {
        callback(null, 'images') /* enregistrement ds dossier images sur PC */
    },
    filename: (req, file, callback) => /* indique comment nommer le fichier téléchargé */
    {
        const name = file.originalname.split(' ').join('_'); /* split du nom de fichier pour remplacer les espaces par des _ */
        const extension = MIM_TYPES[file.mimetype]; /* Récup le fichier envoyé par le front */
        callback(null, name + Date.now() + '.' + extension); /* date.extension(jpg,png...) pour le rendre le + unique possible */
    }
});

/* Gère les téléchargements d'images uniquement */
module.exports = multer({storage: storage}).single("image"); /* single = fichier unique (pas groupe de fichier) */