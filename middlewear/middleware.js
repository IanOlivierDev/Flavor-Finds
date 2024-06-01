module.exports.isLoggedIn = (req, res, next) =>{
    if (req.isAuthenticated()){
        res.render('new');
    } else{
        req.flash('error', `Please Login First!`);
        return res.redirect('/login');
    }
    next();
}