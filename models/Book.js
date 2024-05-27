/* Modèle de données pour les livres */

const mongoose = require("mongoose");


/* Schéma de données */
const bookSchema = mongoose.Schema({ /* TODO: quels éléments sonr requis ??? */
    /* id pas nécessaire car généré automatiquement par MongoDB */
    userId: {type: String, required: true},
    title: {type: String, required: true},
    author: {type: String, required: true},
    imageUrl: {type: String, required: true},
    year: {type: Number, required: true},
    genre: {type: String, required: true},
    ratings: [{
        userId: {type: String, required: true},
        grade: {type: Number, required: true},
    }],
    averageRating: {type: Number, required: true}
});


/* Transformation de la sructure en modèle utilisable */
module.exports = mongoose.model("Book", bookSchema); /* export pour Express */