const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js")
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema} = require("../schema.js");
const Listing = require("../models/listing.js");
const validateListing = (req, res,next) =>{
    let {error} = listingSchema.validate(req.body);
        if(error){
            let errMsg = error.details.map((el) => el.message).join(",");
            throw new ExpressError(400, errMsg);
        }else{
            next();
        }
};
//indexroute
router.get("/", wrapAsync(async(req, res) =>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}));
//new Route
router.get("/new", (req,res) => {
    res.render("listings/new.ejs");
});
//show route
router.get("/:id", wrapAsync(async (req,res) => {
    let{id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if(!listing){
        req.flash("error","Listing you requested for does not existed");
        res.redirect("/listings");
        return;
    }
    res.render("listings/show.ejs",{listing});
}));
//create Route
router.post("/", validateListing, wrapAsync(async(req, res,next) => {
        // if(!req.body.listing){
        //     throw new ExpressError(400,"Send valid data for listing");
        // }
        
        const newListing = new Listing(req.body.listing);
        // if(!newListing.title){
        //     throw new ExpressError(400,"Send valid title for listing");
        // } 
        // if(!newListing.description){
        //     throw new ExpressError(400,"Send valid description for listing");
        // } 
        // if(!newListing.location){
        //     throw new ExpressError(400,"Send valid location for listing");
        // } one way is this other is schema.js

        await newListing.save();
        req.flash("success","New Listing created!");
        res.redirect("/listings");}
));
//edit route
router.get("/:id/edit", wrapAsync(async(req, res) => {
    let{id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not existed");
        res.redirect("/listings");
        return;
    }
    res.render("listings/edit.ejs", {listing});
}));
//update route 
router.put("/:id", validateListing, wrapAsync(async(req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    req.flash("success","Listing updated");
    res.redirect(`/listings/${id}`);
}));
//delete route
router.delete("/:id", wrapAsync(async(req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted");
    res.redirect("/listings/");
}));
module.exports = router;