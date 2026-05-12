const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const passportLocalMongoose=require("passport-local-mongoose");


// Now I am degining the user schema. I am using the passport-local-mongoose plugin 
// to add the username and password fields to the schema, and to add some methods 
// to the schema for authentication.
const userSchema=new Schema({
    email:{
        type:String,
        required:true,
    }
});

userSchema.plugin(passportLocalMongoose.default); // Add Plugin to UserSchema

module.exports=mongoose.model("User", userSchema);