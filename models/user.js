const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    }
});

// CHANGE THIS LINE: add .default
// If the import is an object with a default property, we use that.
userSchema.plugin(passportLocalMongoose.default || passportLocalMongoose); 

module.exports = mongoose.model("User", userSchema);