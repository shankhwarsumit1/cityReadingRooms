const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
            maxLength:100,
        },
        email:{
            type:String,
            required:true,
            unique:true,
        },
        phone:{
            type:String,
            required:true,
            unique:true,
        },
        password:{
            type:String,
            required:true,
        },
        role:{
            type:String,
            enum:["owner", "student"],
            required:true,
        },
        location: {
            type: {
                type: String,
                enum: ["Point"],
                required: true
            },
            coordinates: {
                type: [Number],
                required: true
            }
        },
        city: {
            type: String,
            required: true
        },  
    },
    { timestamps: true }
)

userSchema.methods.getJWT = function () {
    return jwt.sign(
        { id: this._id,},
        process.env.JWTSECRET,
        { expiresIn: "30d" }
    )
}

userSchema.methods.validatePassword = async function (userInputPassword) {
    return await bcrypt.compare(userInputPassword, this.password);
}

module.exports = mongoose.model("User",userSchema);