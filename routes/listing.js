const express=require('express');
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const Listing=require("../models/listing.js");
const { isLoggedIn , isOwner , validatelisting} = require("../middleware.js");
const listingController=require("../controllers/listing.js");
const multer=require("multer");
const storage = multer.diskStorage({});
const cloudinary= require("../cloudConfig.js");
const upload=multer({ storage });




// yahan hum ("/listings") ko as a route pass nhi karenge kyunki hum app.js me 
// already ("/listings") ko as a route pass kar chuke hain, aur yahan hum sirf ("/") ko
// as a route pass karenge, aur uske baad hum apne routes ko define karenge, 
// jaise ki index route, new route, show route, create route, edit route, update route, 
// delete route, etc.

router  // I am using router.route() method to define multiple routes for the same path.
    .route("/")
    // Index Route
    .get(wrapAsync( listingController.indexRoute))
    // Create Route
    .post( 
        isLoggedIn,
        validatelisting,
        upload.single("image"),
        wrapAsync(listingController.createListing)
    );  

// New Route
    router.get("/new", isLoggedIn, listingController.renderNewForm);
       
router
    .route("/:id")
    // Show Route
    .get(wrapAsync( listingController.showListing))
    // Upadate Route
    .put( 
        isLoggedIn,
        isOwner,
        upload.single("image"),
        validatelisting,
        wrapAsync (listingController.updateListing)
    )
    // Delete Route
    .delete(
        isLoggedIn,
        isOwner,
        wrapAsync (listingController.destroyListing)
    );


// Edit Route
    router.get("/:id/edit",
        isLoggedIn,
        isOwner,  
        wrapAsync (listingController.renderEditForm)
    );

module.exports=router;