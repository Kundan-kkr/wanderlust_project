const User=require("../models/user");

module.exports.renderSignupForm= (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup= async (req, res) => {
        //  Here I am using try-catch block to catch the error.
            try {
            let {username, email, password}= req.body;
            const newUser= new User({email, username});
            const registeredUser= await User.register(newUser, password);
            console.log(registeredUser);
        //  Here I am using req.login() method to log in the user after 
        // successful registration(Signup). This method is provided by Passport.js and 
        // it takes the user object and a callback function as arguments. If there is 
        // an error during login, it will be passed to the callback function. 
        // If there is no error, the user will be logged in and we can redirect them 
        // to the listings page.
            req.login(registeredUser, (err) => {
                if(err) {
                    return next(err);
                }
                req.flash("success", "Welcome to Wanderlust!");
                res.redirect("/listings");
            });
            } catch (e) {
                req.flash("error", e.message);
                res.redirect("/signup");
            }
};

module.exports.renderLoginForm= (req, res) => {
    res.render("users/login.ejs");
};

module.exports.login= async (req, res) => {
                req.flash("success", "Welcome back to Wanderlust!");
                let redirectUrl=res.locals.redirectUrl || "/listings"; // here I am checking if there is a redirectUrl in the session, if there is then I am using that redirectUrl, otherwise I am redirecting to the listings page.
                res.redirect(redirectUrl);
};

module.exports.logout= (req, res, next) => {
    req.logout((err) => {
        if(err) {
            return next(err);
        }
        req.flash("success", "You have been logged out!");
        res.redirect("/listings");
    })
};