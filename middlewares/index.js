let middleware = {};

middleware.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    // req.flash("error", "please login first");
    res.redirect("/");
};

middleware.isUser = function(req, res, next) {
    if (req.isAuthenticated()) {
        if (req.url === `https://${req.headers.host}/signup` || `https://${req.headers.host}/login`) {
            // req.flash('error', 'you are already logged in. please logout first and then continue.');
            return res.redirect('/');
        }
    }
    return next();
};

module.exports = middleware;
