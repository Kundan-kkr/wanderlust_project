const express=require("express");
const wrapAsync = require("../utils/wrapAsync");
const router=express.Router();
const User=require("../models/user.js");
const passport=require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController=require("../controllers/user.js");


router // I am using router.route() method to define multiple routes for the same path.
    .route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signup));

router
    .route("/login")
    .get(userController.renderLoginForm)
    // Here I am using passport.authenticate middleware to authenticate the user. 
    // If the authentication is successful, the user will be redirected to the listings page. 
    // If the authentication fails, the user will be redirected back to the login page 
    // and an error message will be flashed.
    .post(
        saveRedirectUrl,
        passport.authenticate ("local", {
            failureRedirect:"/login", 
            failureFlash:true   
            }), 
        userController.login
    );

router.get("/logout", userController.logout);

module.exports=router;
