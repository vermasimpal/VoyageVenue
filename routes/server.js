const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const app = express();
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
// Add express-session middleware
const sessionOptions = {
    secret: "mysupersecretstring",
    resave: false,
    saveUninitialized: true
};
app.use(session(sessionOptions));
app.use(flash());
app.get("/register",(req,res)=>{
    let {name="anonymous"} = req.query;
   req.session.name = name;
   req.flash("success","user registered successfully!");
    res.send(name);
});
app.get("/hello",(req,res)=>{
    res.render("page.ejs",{name:express.session.name});
})
app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});