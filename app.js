if(process.env.NODE_ENV !== "production") {
    require("dotenv").config(); // here I am checking if the environment variables are loaded or not. If they are loaded, then it will print the object containing all the environment variables, otherwise it will print "undefined".  
}
// console.log(process.env.SECRET); // here I am checking if the environment variable is loaded or not. If it is loaded, then it will print the value of the SECRET variable, otherwise it will print "undefined".

const dns=require("dns");
dns.setServers([
    '1.1.1.1',
    '8.8.8.8'
]);
if(dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder("ipv4first");
}

const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js");
const session=require("express-session");
const MongoStore = require("connect-mongo").default;
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");



const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");


app.set("view engine","ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


//  const MONGO_URL=('mongodb://127.0.0.1:27017/Wanderlust');

const dbUrl=process.env.ATLASDB_URL;

main()
    .then(() => {
        console.log("Connected to DB!");
    })
    .catch((err) => {
        console.log(err);
    });

    async function main(){
        await mongoose.connect(dbUrl);
    }

//  Here we are creating a new MongoStore instance and passing the MongoDB connection URL and the secret key for encrypting the session data. We are also setting the touchAfter option to 24 hours, which means that the session will be updated in the database only once every 24 hours, even if the user makes multiple requests within that time period. This can help reduce the number of database writes and improve performance.
    const store=MongoStore.create({
        mongoUrl:dbUrl,
        crypto:{
            secret:process.env.SECRET,
        },
        touchAfter:24*3600,  // time period in seconds
    });

    store.on("error", function (err) {
        console.log("Error in MONGO SESSION STORE!", err);
    });

    const sessionOptions={
        store, // here we are passing the store instance to the session options, so that the session data will be stored in the MongoDB database instead of the default in-memory store.
        secret:process.env.SECRET, // here we are setting the secret key for encrypting the session data. This should be a long and random string to ensure the security of the session data.
        resave:false,
        saveUninitialized:true,
    //  Here we set the cookie options for the session. We can set 
    // the expiration time, max age, and other properties of the cookie.
        cookie:{
            expires:Date.now() + 1000*60*60*24*7, // 7 days
            maxAge:1000*60*60*24*7, // 7 days
            httpOnly:true
        },
    };

    app.use(session(sessionOptions));
//  Flash is a middleware that allows us to store temporary messages in the session.
//  We can use it to display success or error messages to the user after a redirect.
    app.use(flash());

//  Passport is a middleware that allows us to authenticate users in our application.
    app.use(passport.initialize());
    app.use(passport.session());
//  Use static authenticate method of model in LocalStrategy
    passport.use(new LocalStrategy(User.authenticate()));
//  Use static serialize and deserialize of model for passport session support
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

//  This middleware is used to set the flash messages in the response locals,
//  so that we can access them in the views. We are setting the success and error 
//  messages in the response locals, so that we can display them in the views.
    app.use((req, res, next) => {
        res.locals.success=req.flash("success"); // here success is used in flash.ejs file in Includes folder
    //   console.log(res.locals.success); 
        res.locals.error=req.flash("error"); // here error is used in flash.ejs file in Includes folder
    //   console.log(res.locals.error);
        res.locals.currentUser=req.user; // here currentUser is used in navbar.ejs file in Includes folder to check if the user is logged in or not. If the user is logged in, then we can access the user object in the req.user property, and we can set it to the currentUser variable in the response locals, so that we can access it in the views.
        next();
    });
/*
//  Define Demo user for testing
    app.get("/demouser", async(req, res) => {
        let fakeUser=new User({
            email:"student@gmail.com",
            username:"delta-student"
        }
    );
        let registeredUser=await User.register(fakeUser, "delta123");
        res.send(registeredUser);
    });
    */

    app.get("/", (req,res) => {
        res.redirect("/listings");
    });


   /* app.get("/testlisting", async(req, res) => {
        
        let sampleListing=new listing({
            title:"My New Villa",
            description:"By the Beach",
            price:1200,
            location:"calangute,Goa",
            country:"India"
        });

        await sampleListing.save();

        console.log("Sample was Saved!");
        console.log("Successfull Testing!");
    });
*/

// Using Router for Listings
    app.use("/listings", listingRouter);

// Using Router for Reviews
    app.use("/listings/:id/reviews", reviewRouter);

// Using Router for Users(Signup and Login)
    app.use("/", userRouter);
    



    
//Error Handling Middleware
    //  404 handler (pehle)
    app.use((req, res, next) => {
        next(new ExpressError(404, "Page Not Found"));
    });

//  Error handler (last me)
    app.use((err, req, res, next) => {
        let { statusCode = 500, message = "Something went wrong" } = err;
    //  res.status(statusCode).send(message);
    //  res.render("error.ejs", { err });
        res.status(statusCode).render("error.ejs", { message });
    //  res.status(statusCode).send(message);
    });


    app.listen(8080, () => {
        console.log("server is listening to port 8080");
    });
