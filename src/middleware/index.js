module.exports.passport = require('passport');
module.exports.validation = require('./Validation.js');

/**
 * Generic middleware function
 * @param  {Request}  req  The HTTP request object
 * @param  {Response} res  The HTTP response object
 * @param  {Function} next The next middleware function to run
 * @return {Function}      The results of either next() or res.redirect()
 */
// const genericMiddleware = (req, res, next) => {
//     if (failureCondition) {
//       return middlewareAction()
//     }
//     return next();
// };

// module.exports.genericMiddleware = genericMiddleware;