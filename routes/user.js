const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");

// ---------------------------
// SIGNUP ROUTES
// ---------------------------

// 1. Render Signup Form
router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

// 2. Handle Signup Logic
router.post("/signup", wrapAsync(async (req, res, next) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        
        // This registers the user and saves them to DB with hashed password
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        
        // Auto-login the user after they sign up
        req.login(registeredUser, (err) => {
            if (err) { 
                return next(err); 
            }
            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings");
        });

    } catch (e) {
        // If username exists or other error, flash message and redirect back to signup
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}));


// ---------------------------
// LOGIN ROUTES
// ---------------------------

// 3. Render Login Form
router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

// 4. Handle Login Logic
// passport.authenticate() is a middleware that does all the heavy lifting
router.post("/login", 
    passport.authenticate("local", { 
        failureRedirect: "/login", 
        failureFlash: true 
    }), 
    async (req, res) => {
        req.flash("success", "Welcome back to Wanderlust!");
        res.redirect("/listings");
    }
);


// ---------------------------
// LOGOUT ROUTE
// ---------------------------

router.get("/logout", (req, res, next) => {
    // req.logout requires a callback in newer passport versions
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You are logged out!");
        res.redirect("/listings");
    });
});

module.exports = router;