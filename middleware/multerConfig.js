const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");


const storage = multer.memoryStorage(); // Utilisation de la mémoire pour stocker temporairement le fichier
const upload = multer({ storage });

/* Compresse et enregistre a nouvelle image */
const compressImage = async (req, res, next) => 
{
    // Si aucun fichier n'est présent dans la requête, passe au middleware suivant
    if (!req.file) {
        return next();
    }

    // Chemin du dossier de destination des images
    const uploadPath = './images';

    // Crée le dossier 'images' s'il n'existe pas
    if (!fs.existsSync(uploadPath)) 
    {
        fs.mkdirSync(uploadPath, { recursive: true });
    }

    const {buffer, originalname} = req.file; /* buffer = fichier téléchargé, stocké en attendant d'être traîté */
    const name = originalname.split(' ').join('_').replace(/\.[^/.]+$/, ""); // Retire l'extension du nom du fichier (évite doublon)
    const timestamp = Date.now(); /* Ajoute la date pour garantir un nom de fichier unique */
    const ref = `${name}_${timestamp}.webp`; /* Nom final du fichier */
    const filePath = path.join(uploadPath, ref); /* Chemin complet du fichier */

    try 
    {
        // Compression et conversion de l'image en WebP
        await sharp(buffer)
        .webp({quality: 30}) 
        .toFile(filePath); /* Enregistre le fichier dans les dossier du PC */

        /* MAJ des infos du fichier dans la requête */
        req.file.filename = ref;
        req.file.path = filePath;
        req.file.mimetype = "image/webp";

        next();
    } 
    catch (error) 
    {
        next(error);
    }
};

/* Exporte multer avec le middleware de compression d'image */
module.exports = {
    upload: upload.single('image'), // Middleware multer pour traiter un seul fichier d'image
    compressImage /* Middleware pour compresser l'image */
};