const Listing=require("../models/listing");
const cloudinary = require("../cloudConfig");
const geocoder = require("../utils/geocoder");


module.exports.indexRoute= async (req , res) => {
        const allListings=await Listing.find({});
        /*console.log(allListings);*/
        res.render("listings/index.ejs", {allListings});
};

//New route
module.exports.renderNewForm= (req, res) => {
        res.render("listings/new.ejs");
};

// Show Route
module.exports.showListing= async(req, res) => {

        let {id}=req.params;
        const listing= await Listing.findById(id)
        .populate({
            path:"reviews",
            populate: {
                path:"author"
            }
        })
        .populate("owner");
        if(!listing) {
            req.flash("error", "Listing Not Found!");
            return res.redirect("/listings");
        }
        //console.log(listing);
        res.render("listings/show.ejs", {listing});
};

// Create Route     
module.exports.createListing = async (req, res, next) => {
   
  // First of all File check 
     if (!req.file) {
        req.flash("error", "Image required!");
        return res.redirect("/listings/new");
     } 
  // Upload image to Cloudinary
  // here I am new version of multer and cloudinary. In this version we are access all things about this code.if you are showing all about your image than print result.
     const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "wanderlust_DEV",
        allowed_formats: ["jpeg", "png", "jpg"],
     });

  // Create listing
     const newListing = new Listing(req.body.listing);

  // Owner set
     newListing.owner = req.user._id;
  // console.log(req.user); // here I am checking the user object in the request, and I am getting the _id property of the user object and assigning it to the owner property of the new listing, this is used to associate the listing with the user who created it.

  // Image save 
    console.log(result); // here I am checking the result object that is returned by the cloudinary uploader, and I am getting the secure_url and public_id properties of the result object and assigning them to the url and filename properties of the image property of the new listing, this is used to save the image information in the database.
    newListing.image = {
        url: result.secure_url,
        filename: result.public_id,
    };

  // Geocode the address
    let response = await geocoder.geocode(req.body.listing.location);

    if (!response.length) {
         req.flash("error", "Invalid location");
         return res.redirect("/listings/new");
   }

    newListing.geometry = {
    type: "Point",
    coordinates: [
      response[0].longitude,
      response[0].latitude,
    ],
    };
    console.log(newListing.geometry);
    

  // newListing Save
     await newListing.save();
   console.log(newListing);

     req.flash("success", "Successfully New Listing Created!");
     res.redirect("/listings");
};
   
// Edit Route
module.exports.renderEditForm= async(req, res) => {

        let {id}= req.params;
        const listing= await Listing.findById(id);
        let originalImageUrl= listing.image.url;
        originalImageUrl= originalImageUrl.replace("/upload/", "/upload/w_250/");

        res.render("listings/edit.ejs", {listing, originalImageUrl});
};

// Upadate Route
module.exports.updateListing= async(req, res) => {
        
         if(!req.body.listing) {
            throw new ExpressError(400, "Send valid data for Listing!");
        }
        let {id}=req.params;
        let updatedListing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
    //  res.redirect("/listings");
         
        if(typeof req.file !== "undefined") {
         // delete old image
         // await cloudinary.uploader.destroy(updatedListing.image.filename);

         // upload new image
            const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "wanderlust_DEV",
            allowed_formats: ["jpeg", "png", "jpg"],
            });
         // Image save 
            updatedListing.image = {
                  url: result.secure_url,
                  filename: result.public_id,
            };
            await updatedListing.save();
        }
        req.flash("success", "Successfully Listing Updated!");
    
        res.redirect(`/listings/${id}`);
};

// Delete Route
module.exports.destroyListing= async (req, res) => {

        let {id}= req.params;
        let deletedListing= await Listing.findByIdAndDelete(id);
        req.flash("success", "Successfully Listing Deleted!");
        console.log(deletedListing);

        res.redirect("/listings");
};

