const Listing= require("./models/listing");
const ExpressError=require("./utils/ExpressError.js");
const { listingSchema , reviewSchema } = require("./schema.js");
const Review=require("./models/review.js");



module.exports.isLoggedIn = (req, res, next) => {

//  here i am printing the user object to check if the user is authenticated or not. 
//  If the user is not authenticated, the req.user property will be "undefined".
//  If the user is authenticated, the user object will be available in the req.user property.
//  console.log(req.user);
//  console.log(req); // here I am search for the path and originalUrl properties in the req object. 
//  console.log(req.path, "..", req.originalUrl); // here i am using originalUrl property for redirecting the user to the same page after login. For example, if the user is trying to access the "/listings/new" page without logging in, they will be redirected to the login page. After logging in, they will be redirected back to the "/listings/new" page using the originalUrl property.

    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl; // here I am setting the redirectUrl property in the session to the originalUrl property of the request. This is used to redirect the user back to the same page after login.
        req.flash("error", "You must be logged in first for create listing!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl) {
        res.locals.redirectUrl=req.session.redirectUrl; // here I am setting the redirectUrl property in the response locals to the redirectUrl property in the session. This is used to access the redirectUrl property in the routes folder in user.js file.
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    let {id}= req.params;
    let listing= await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currentUser._id)) {
        req.flash("error", "You are not the owner of this listing!");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

//  (Validation for Schema(Middleware)) using Joi, we are validating the data before 
//  creating a new listing, and if there is an error in the data then we are throwing an 
//  ExpressError with status code 400 and the error message, otherwise we are creating a 
//  new listing and saving it to the database, and then redirecting to the listings page.
module.exports.validatelisting=(req, res, next) => {
        let {error}=listingSchema.validate(req.body);

        if(error) {
            let errMsg=error.details.map(el => el.message).join(",");
            throw new ExpressError(400, errMsg);
        } else {
            next();
        }
};


    // I am writing ValidateReview middleware to validate the review data
    //  before creating a new review, and if there is an error in the data then I am 
    // throwing an ExpressError with status code 400 and the error message, otherwise 
    // I am creating a new review and saving it to the database, and then redirecting to 
    // the listing page.
module.exports.validateReview=(req, res, next) => {
            let {error}=reviewSchema.validate(req.body);
            if(error) {
                let errMsg=error.details.map(el => el.message).join(",");
                throw new ExpressError(400, errMsg);
            } else {
                next();
            }   
};


module.exports.isReviewAuthor = async (req, res, next) => {
    let {id, reviewId}= req.params;
    let review= await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currentUser._id)) {
        req.flash("error", "You are not the author of this review!");
        return res.redirect(`/listings/${id}`);
    }
    next();
};
