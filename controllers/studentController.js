
const Seat = require('../models/Seat');
const getprofile = (req,res)=>{
    try{
            const user = req.user;
            if(!user){
                return res.status(404).json({success:false,message:"User not found"});
            }
            res.status(200).json({
                success:true,user:{
                    id: user._id,
                    name:user.name,
                    email:user.email,
                    phone:user.phone,
                    role:user.role,
                    location:user.location,
                    city:user.city
                }})
    }
    catch(err){
        console.log(err);
        res.status(500).json({success:false,ERROR:err.message})
    }
}

const myReadingRoom = async (req,res)=>{
    try{
        const user = req.user;
        if(!user){
            return res.status(404).json({success:false,message:"User not found"});
        }
        studentId = user._id;
        const seat = await Seat.findOne({studentId}).populate('readingRoomId');
        if(!seat){
            return res.status(400).json({success:false,message:"No reading room found for this student"});
        }
        res.status(200).json({success:true,seat});
    }
    catch(err){
        console.log(err);
        res.status(500).json({success:false,ERROR:err.message})
    }
}

module.exports = {
    getprofile,
    myReadingRoom

};