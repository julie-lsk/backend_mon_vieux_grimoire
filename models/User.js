/* Modèle de données pour les infos utilisateurs */

const mongoose = require('mongoose');
const uniqueValidator = require("mongoose-unique-validator"); 

const userSchema = mongoose.Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true}
});

/* Plugin pour prévalider les infos avant de les enr. en BDD */
userSchema.plugin(uniqueValidator); /* assure email unique (1 util. = 1 mail) */

module.exports = mongoose.model('User', userSchema);