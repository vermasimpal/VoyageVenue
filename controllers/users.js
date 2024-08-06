const User = require("../models/user.js");


module.exports.loginForm = (req,res)=>{
    res.render("users/login.ejs");
}
module.exports.login =async(req,res)=>{
    req.flash("success","Welcome to VoyageVenu! You are logged in");
    res.redirect(res.locals.redirectUrl);
  
}
module.exports.logout = (req,res)=>{
    req.logout((err)=>{
        if(err){
           return next(err);
        }
        req.flash("success","you are logged out now!");
        res.redirect("/listings");
    })
}
module.exports.renderSignup = (req,res)=>{
    res.render("users/signup.ejs");
 }


module.exports.signup = async(req,res)=>{
    try{
let {username,email,password}=req.body;
const newUser=new User({email,username});
const registeredUser = await User.register(newUser,password);
console.log(registeredUser);
req.login(registeredUser,(err)=>{
    if(err){
        return next(err);
    }
    req.flash("success","welcome to VoyageVenue!");
res.redirect(res.locals.redirectUrl);

});

    }
    catch(err){
        req.flash("error",err.message);
        res.redirect("/signup");
    }
};
