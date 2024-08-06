const Listing = require("../models/listing.js");
const {listingSchema} = require("../schema.js");
const ExpressError = require('../utils/ExpressError.js');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
//index
module.exports.index =  async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}

//new
module.exports.renderNewForm = (req,res)=>{
     
    res.render("listings/new.ejs");
  }
  //show
  module.exports.showListing = async(req,res)=>{
    let {id} = req.params;
  const listing =  await Listing.findById(id)
  .populate({
     path: 'reviews',
     populate: {
         path: 'author'
     }
 })
 .populate("owner");
  console.log(listing);
  res.render("listings/show.ejs",{listing});
 }
//create
 module.exports.createListing = async (req, res,next) => {
   
 let response =   await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
      })
        .send();
       
        
    let result =listingSchema.validate(req.body);
    console.log(result);
    if(result.error){
     throw new ExpressError(400,result.error);
    }
         let listing = req.body.listing;


         if (req.file) {
            listing.image = {
                url: req.file.path, // or use req.file.filename if you are storing filename
                filename: req.file.filename,
            };
        }


         const newListing = new Listing({
             title: listing.title,
             description: listing.description,
             
             image: {
                url: listing.image.url,
                filename: listing.image.filename
            },
             price: listing.price,
             location: listing.location,
             country: listing.country,
             owner:req.user._id,
             geometry:response.body.features[0].geometry,
         });
       
         await newListing.save();
         req.flash("success","New Listing created");
         res.redirect("/listings"); 
     
 }
 //edit
 module.exports.editListing = async(req,res)=>{
    let {id} = req.params;
  
 const listing =  await Listing.findById(id);
 if(!listing){
  req.flash("error","listing you created does not exists!");
  res.redirect("/listings");
 }
 let originalImageUrl = listing.image.url;
 originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250")
 res.render("listings/edit.ejs",{listing,originalImageUrl});
}
//update
module.exports.updateListing  =async (req, res) => {
    let { id } = req.params;
  
    try {
     let listing =    await Listing.findByIdAndUpdate(id, req.body.listing);
     if (typeof req.file!=="undefined") {
      
           let url= req.file.path;
          let   filename =req.file.filename;
          listing.image = {url,filename};
       
      
    }
    await listing.save();
        req.flash("success","listing updated!");
        res.redirect("/listings");
    } catch (error) {
        console.error("Error updating listing:", error);
        res.send("Error updating listing");
    }
}
//delete
module.exports.destroyListing = async(req,res)=>{
    let { id } = req.params;
    let deletedListing =await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted");
    res.redirect("/listings");
}