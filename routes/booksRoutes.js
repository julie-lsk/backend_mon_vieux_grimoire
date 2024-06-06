// Routes avec toutes les requêtes HTTP
const express = require('express');
const router = express.Router();

const auth = require("../middleware/auth");
const {upload, compressImage} = require('../middleware/multerConfig');

// Fichier de configuration des routes GET, POST...
const booksCtrl = require("../controllers/booksCtrl");


router.get("/", booksCtrl.getAllBooks);
router.get("/bestrating", booksCtrl.getBestBooks);
router.get("/:id", booksCtrl.getOneBook);
router.post("/", auth, upload, compressImage, booksCtrl.createBook); /* 1er auth car récup + vérifie token | 2ème multer pour gérer new image | reste = gestionnaire de req. */
router.put("/:id", auth, upload, compressImage, booksCtrl.modifyBook);
router.delete("/:id", auth, booksCtrl.deleteBook);
router.post("/:id/rating", auth, booksCtrl.createRating);



module.exports = router;