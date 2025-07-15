const { validateSignupData } = require("../utils/validator");
const User = require("../models/User");
const bcrypt = require("bcrypt");

const signup = async (req, res) => {
  try {
    const{name,email,phone,password,role,location,city} = req.body;
    validateSignupData(req);
    const hashPassword = await bcrypt.hash(password, 10);


    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email or phone already registered",
      });
    }

    const user = new User({
      name,
      email,
      phone,
      password: hashPassword,
      role: role.toLowerCase(),
      location,
      city: city.toLowerCase(),
    });
    await user.save();

    res.status(201).json({ success: true, message: "User registered successfully"});
  } catch (error) {
    res.status(500).json({success:false, error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { phone,password,email } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: "password is required" });
    }
     
    if (!phone && !email) {
      return res.status(400).json({ success: false, message: "Please provide an email or phone number." });
    }
    let user;
    if (email) {
       user = await User.findOne({ email });
    }
    else if(phone){
       user = await User.findOne({ phone });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
 
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }   

    const token = user.getJWT();

    res.status(200).json({ success: true, message:"user login successfull",token,
        user:{
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            city: user.city,
        }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
  signup,
  login,
};