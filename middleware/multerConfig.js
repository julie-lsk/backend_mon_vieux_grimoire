const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");


/* Storage pour indiquer où enregistrer les fichiers téléchargés (entrants) */
// const storage = multer.diskStorage({
//     destination: (req, file, callback) => 
//     {
//         callback(null, 'images') /* enregistrement ds dossier images sur PC */
//     },
//     filename: (req, file, callback) => /* indique comment nommer le fichier téléchargé */
//     {
//         const name = file.originalname.split(' ').join('_').replace(/\.[^/.]+$/, ""); /* .replace pour retirer l'extension dans le nom du fichier */
//         const extension = MIM_TYPES[file.mimetype]; /* Récup l'extension */
//         callback(null, name + '_' + Date.now() + '.' + extension); /* nom unique : nom + date + extension */
//     }
// });

// /* Gère les téléchargements d'images uniquement */
// module.exports = multer({storage: storage}).single("image"); /* single = fichier unique (pas groupe de fichier) */


const storage = multer.memoryStorage(); // Utilisation de la mémoire pour stocker temporairement le fichier
const upload = multer({ storage });

/* Middleware pour compresser et enregistrer l'image */
const compressImage = async (req, res, next) => 
{
    if (!req.file) {
        return next();
    }

    // Crée le dossier 'images' s'il n'existe pas
    const uploadPath = './images';
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }

    const { buffer, originalname } = req.file;
    const name = originalname.split(' ').join('_').replace(/\.[^/.]+$/, ""); // Retire l'extension du nom du fichier
    const timestamp = Date.now();
    const ref = `${name}_${timestamp}.webp`;
    const filePath = path.join(uploadPath, ref);

    try 
    {
        await sharp(buffer)
        .webp({ quality: 20 }) // Compression et conversion en WebP
        .toFile(filePath);

        req.file.filename = ref;
        req.file.path = filePath;
        req.file.mimetype = 'image/webp'; // FIXME: utile ????? Mettre à jour le mimetype après conversion

        next();
    } 
    catch (error) 
    {
        next(error);
    }
};

/* Exporter multer avec le middleware de compression d'image */
module.exports = {
    upload: upload.single('image'),
    compressImage
};