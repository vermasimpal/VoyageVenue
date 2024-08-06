if(process.env.NODE_ENV!="production"){
    require("dotenv").config();
}


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require('./models/listing.js');

const dbUrl = process.env.ATLASDB_URL;

const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js")
const {listingSchema,reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const {isLoggedIn,isOwner,isreviewAuthor}=require("./middleware.js");
const {saveRedirectUrl} = require("./middleware.js");
const listingController = require("./controllers/listings.js");
const reviewController = require("./controllers/review.js");
const userController = require("./controllers/users.js");
const {storage} = require("./cloudConfig.js");
const multer  = require('multer');

const upload = multer({ storage });


 async function main(){
    await mongoose.connect(dbUrl);
 }
main().then(()=>{
    console.log("connected to DB");
}).catch((err)=>{
    console.log(err);
});

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
const store = MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:  process.env.SECRET
    },
    touchAfter:24*3600,
});
store.on("error",()=>{
    console.log("error in the mogostore",err);
})
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    }
};


app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
});

app.get("/demoUser",async(req,res)=>{
    let fakeUser = new User({
        email:"simpalverma@gmail.com",
        username:"simpv4"
        });
       let registeredUser = await User.register(fakeUser,"helloworld");
       res.send( registeredUser);
});
 app.get("/signup",userController.renderSignup);
app.post("/signup",saveRedirectUrl,userController.signup);
app.get("/login",userController.loginForm);
app.post("/login",saveRedirectUrl,passport.authenticate("local",{failureRedirect:"/login",failureFlash:true}),userController.login);
app.get("/logout",userController.logout);
//index route
app.get("/listings",listingController.index);
//create route
app.get("/listings/new",isLoggedIn,listingController.renderNewForm);


//show route
app.get("/listings/:id",listingController.showListing);
 
//new route

app.post("/listings", isLoggedIn, upload.single('listing[image]'), listingController.createListing);
//edit route
app.get("/listings/:id/edit",isLoggedIn,isOwner,listingController.editListing);

//update route
app.put("/listings/:id",isLoggedIn,upload.single('listing[image]'),isOwner,listingController.updateListing);
//delete route
app.delete("/listings/:id",isLoggedIn,isOwner,listingController.destroyListing);
const validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
        }else{
            next();
        }
    };

//reviews
app.post("/listings/:id/reviews", isLoggedIn,validateReview ,reviewController.createReview);
//delete review
app.delete("/listings/:id/reviews/:reviewId",isLoggedIn,isreviewAuthor, reviewController.deleteReview);


//error
app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"page not found!"));
});
app.use((err,req,res,next)=>{
    let {statusCode,message} = err;
    res.render("error.ejs",{message});
})

app.listen(8080,()=>{
  console.log("server is listening to port 8080");
})