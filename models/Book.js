/* Modèle de données pour les livres */

const mongoose = require("mongoose");


/* Schéma de données */
const bookSchema = mongoose.Schema({
    /* id pas nécessaire car généré automatiquement par MongoDB */
    userId: {type: String},
    title: {type: String, required: true},
    author: {type: String, required: true},
    imageUrl: {type: String, required: true},
    year: {type: Number, required: true},
    genre: {type: String, required: true},
    ratings: [{
        userId: {type: String},
        grade: {type: Number},
    }],
    averageRating: {type: Number}
});


/* Transformation de la sructure en modèle utilisable */
module.exports = mongoose.model("Book", bookSchema); /* export pour Express */