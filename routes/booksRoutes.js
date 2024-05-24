// Routes avec toutes les requêtes HTTP
const express = require('express');
const router = express.Router();

const auth = require("../middleware/auth");
const multer = require('../middleware/multerConfig');

// Fichier de configuration des routes GET, POST...
const booksCtrl = require("../controllers/booksCtrl");


router.get("/", booksCtrl.getAllBooks);
router.get("/:id", booksCtrl.getOneBook);
// router.get("/bestrating", booksCtrl.getBestBooks);
router.post("/", auth, multer, booksCtrl.createBook); /* 1er auth car récup + vérifie token | 2ème multer pour gérer new image | reste = gestionnaire de req. */
// router.put("/:id", auth, multer, booksCtrl.modifyBook);
// router.delete("/:id", booksCtrl.deleteBook);


module.exports = router;