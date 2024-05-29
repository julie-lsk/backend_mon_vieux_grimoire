const jwt = require('jsonwebtoken');

module.exports = (req, res, next) =>
{
    try 
    {
        /* Récup du header = split = divisier la string en un tableau */
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
        const userId = decodedToken.userId;

        /* FIXME:  */
        if (userId !== undefined && userId !== null) 
        {
            req.auth = { userId };
        } 
        else 
        {
            req.auth = { userId: 'guest' };
        }
        next();
    }
    catch (error) 
    {
        /* FIXME: */
        req.auth = {userId: 'guest'};
        next();
        // res.status(401).json({error})
    }
};