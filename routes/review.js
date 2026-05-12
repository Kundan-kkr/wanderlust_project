const express=require("express");
const router=express.Router({mergeParams:true});
// mergeParams:true is used to access the params of the parent route in the child route,
// in this case we want to access the id of the listing in the review route, 
// so we need to use mergeParams:true in the router of the review route.
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const { validateReview , isLoggedIn , isReviewAuthor } = require("../middleware.js"); 
const reviewController=require("../controllers/review.js");


// Review(Post Route) 
    router.post("/", 
        isLoggedIn, // I am protecting Backend. I am already protecting the frontend by hiding the review form if the user is not logged in, but here I am also protecting the backend by using isLoggedIn middleware, because if someone tries to send a POST request to create a review without logging in, then they will get an error, so I am using isLoggedIn middleware to check if the user is logged in or not before creating a review.
        validateReview,
        wrapAsync (reviewController.createReview)
    );

// Review(Delete Route)
    router.delete("/:reviewId",
        isLoggedIn, // I am protecting Backend. I am already protecting the frontend by hiding the delete button if the user is not logged in, but here I am also protecting the backend by using isLoggedIn middleware, because if someone tries to send a DELETE request to delete a review without logging in, then they will get an error, so I am using isLoggedIn middleware to check if the user is logged in or not before deleting a review.  
        isReviewAuthor, // I am applying isReviewAuthor middleware to check if the user is the author of the review or not, because only the author of the review can delete the review, so I am using isReviewAuthor middleware to check if the user is the author of the review or not before deleting a review.
        wrapAsync (reviewController.destroyReview)
);  

module.exports=router;