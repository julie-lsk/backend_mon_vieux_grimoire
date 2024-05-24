/* Modèle de données pour les livres */

const mongoose = require("mongoose");


/* Schéma de données */
const bookSchema = mongoose.Schema({ /* TODO: quels éléments sonr requis ??? */
    /* id pas nécessaire car généré automatiquement par MongoDB */
    userId: {type: String},
    title: {type: String},
    author: {type: String},
    imageUrl: {type: String},
    year: {type: Number},
    genre: {type: String},
    rating: [{
        userId: {type: String},
        grade: {type: Number},
    }],
    averageRating: {type: Number}
});


/* Transformation de la sructure en modèle utilisable */
module.exports = mongoose.model("Book", bookSchema); /* export pour Express */