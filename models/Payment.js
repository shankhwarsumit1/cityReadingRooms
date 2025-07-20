const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        required:true
    },
    paymentId:{
        type:String,
    },
    orderId:{
        type:String,
        required:true
    },
    status:{
        type:String,
        requried:true,
    },
    amount:{
        type:Number,
        required:true,
    },
    currency:{
        type:String,
        required :true,
    },
    notes:{
        seatId:{
            type:mongoose.Types.ObjectId,
            ref:"Seat"
        },
        readingRoomId:{
            type:mongoose.Types.ObjectId,
            ref:"ReadingRoom"    
        },
        plan:{
            type:String,
            enum:['monthly','threeMonths']
        }
    }
},{timestamps:true
    }
);


module.exports = mongoose.model("Payment",paymentSchema);