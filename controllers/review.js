const Listing=require("../models/listing.js");
const Review=require("../models/review.js");

// Review(Post Route)
module.exports.createReview= async(req, res) => {
     // console.log(req.params.id); yah hum isliye print karkar check kiye kyunki 
     // jab hum apne webpage par review ko add kar rhe the to hume error aa rha tha 
     // aur O/t main hume Undefined aaya isliye is error ko fix karne ke liye 
     // hum {mergeparams:true} use karenge apne router me 
        let listing=await Listing.findById(req.params.id);

        let newReview=new Review(req.body.review);
        newReview.author=req.user._id; // here we are setting the author of the review to the current user,
    //  console.log(newReview);

        listing.reviews.push(newReview);

        await newReview.save();
        await listing.save();
        
        req.flash("success", "Successfully New Review Created!");
    //  console.log("new rerview saved");
    //  res.send("new review saved");

    res.redirect(`/listings/${listing._id}`);
};

// Review(Delete Route)
module.exports.destroyReview= async(req, res) => {
        let {id, reviewId}=req.params;
        await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
        req.flash("success", "Successfully Review Deleted!");
        res.redirect(`/listings/${id}`);
};
