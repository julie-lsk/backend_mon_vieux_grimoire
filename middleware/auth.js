const jwt = require('jsonwebtoken');

module.exports = (req, res, next) =>
{
    try 
    {
        /* Récup du header = split = divisier la string en un tableau */
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
        const userId = decodedToken.userId;

        req.auth = 
        {
            userId: userId
        };

        next();
    }
    catch (error) 
    {
        res.status(401).json({message: "Authentification échouée.", error})
    }
};