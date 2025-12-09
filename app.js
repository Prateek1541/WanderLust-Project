const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js")
const ExpressError = require("./utils/ExpressError.js")
const {listingSchema} = require("./schema.js")
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
main().then(() => {
    console.log("connected to DB");
})
.catch((err) => {
    console.log(err);
});
async function main(){
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));
//_method
app.get("/", (req,res) =>{
    res.send("Hi, i m root");
});
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
app.get("/listings", wrapAsync(async(req, res) =>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}));
//new Route
app.get("/listings/new", (req,res) => {
    res.render("listings/new.ejs");
});
//show route
app.get("/listings/:id", wrapAsync(async (req,res) => {
    let{id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
}));
//create Route
app.post("/listings", validateListing, wrapAsync(async(req, res,next) => {
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
        res.redirect("/listings");}
));
//edit route
app.get("/listings/:id/edit", wrapAsync(async(req, res) => {
    let{id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));
//update route 
app.put("/listings/:id", validateListing, wrapAsync(async(req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
}));
//delete route
app.delete("/listings/:id", wrapAsync(async(req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings/");
}));

// app.get("/testListing", async(req, res) => {
//     let sampleListing = new Listing({
//         title: "My  new Villa",
//         description: "By the beach",
//         price: 12000,
//         location: "Mumbai",
//         country: "India",
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("Successful testing");
// });
// NEW (Standard Middleware approach)
// app.use without a path acts as a catch-all for anything not matched above
app.use((req, res, next) => {
    next(new ExpressError(404, "Page not found!"));
});
// app.all("*",(req,res, next) => {
//     next(new ExpressError(404, "Page not found!"));
// });
 
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs",{message});
    // res.status(statusCode).send(message);
});

app.listen(8080, () => {
     console.log("Server is listening to port 8080");
});
