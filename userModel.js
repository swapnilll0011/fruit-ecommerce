const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String, required: true }, // ✅ Added address field
    password: { type: String, required: true }, // Store hashed passwords
    registrationDate: { type: Date, default: Date.now }

});

const User = mongoose.model("User", userSchema);
module.exports = User;
