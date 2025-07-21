const {
    createRazorpayInstance
} = require('../utils/razorpay');
const ReadingRoomModel = require('../models/ReadingRoom');
const PaymentModel = require('../models/Payment');
const Seat = require('../models/Seat');
const {validateWebhookSignature} = require('razorpay/dist/utils/razorpay-utils'); 
const mongoose = require('mongoose');
const createOrder = async (req, res) => {
    try {
        const user = req.user;
        const {
            readingRoomId,
            plan,
            seatId
        } = req.body;
        console.log(seatId);
        if (!["monthly", "threeMonths"].includes(plan)) {
            return res.status(400).json({
                success: false,
                message: "invalid plan must be 'monthly' or 'threeMonths'"
            })
        }
        const readingRoom = await ReadingRoomModel.findById(readingRoomId);
        if (!readingRoom) {
            return res.status(404).json({
                success: false,
                message: "reading room not found"
            });
        }
        const razorpayInstance = createRazorpayInstance();
        console.log(readingRoom.fees)
        const order = await razorpayInstance.orders.create({
            "amount": readingRoom.fees[plan] * 100,
            "currency": "INR",
            "partial_payment": false,
            "notes": {
                "amount": readingRoom.fees[plan],
                "seatId": seatId,
                "readingRoomId": readingRoomId,
                "plan":plan
            }
        });
       console.log(plan,order.notes);
        const payment = new PaymentModel({
            userId: user._id,
            orderId: order.id,
            status: order.status,
            amount: order.amount,
            currency: order.currency,
            notes: order.notes,
        });

        const savedPayment = await payment.save();
       return res.status(201).json({
            success: true,
            savedPayment,
            keyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({error:err.message});
    }
}

const verifyPayment = async (req, res) => {
    let session;
    try {
      session = await mongoose.startSession();
      session.startTransaction();  
      const webhookSignature = req.get('X-Razorpay-Signature');
      const isWebhookValid =  validateWebhookSignature(
            JSON.stringify(req.body),
            webhookSignature,
            process.env.RAZORPAY_WEBHOOK_SECRET
        );

        if(!isWebhookValid){
            return res.status(400).json({success:false,message:'webhook signature is invalid'})
        }

        const paymentDetails = req.body.payload.payment.entity;
        const payment = await PaymentModel.findOne({orderId:paymentDetails.order_id}).session(session);
        payment.status = paymentDetails.status;
        await payment.save({session});
        if(payment.status==='captured'){
        const userId = payment.userId;
        const feePaymentDate = new Date();
        console.log(paymentDetails);
        const {seatId,readingRoomId,plan}= paymentDetails.notes;
          if (!seatId || !readingRoomId || !plan || !userId) {
         throw new Error('Missing seatId, readingRoomId, plan, or userId');
         }
        const seat = await Seat.findById(seatId).session(session);
        const clonePaymentDate = new Date(feePaymentDate);
        seat.nextDueDate = 
        plan === "monthly" ? 
        new Date(clonePaymentDate.setMonth(clonePaymentDate.getMonth()+1)):
        new Date(clonePaymentDate.setMonth(clonePaymentDate.getMonth()+3));
        
        seat.status = 'reserved';
        seat.studentId = userId;
        seat.feePaymentDate = feePaymentDate;
        seat.feeAmount = paymentDetails.amount/100;
        seat.plan = plan;
        await seat.save({session});

        await ReadingRoomModel.findByIdAndUpdate(
            readingRoomId,{
                $inc:{
                    vacantSeats:-1
                }
            },{
                session
            }
        );
    }
       await session.commitTransaction();
       //return success response to razorpay
       return res.status(200).json({message:"webhook received successfully"});
    } catch (err) {
        await session.abortTransaction();
        console.log(err);
        res.status(500).json({success:false,
            error:err.message
        })
    }finally{
        session.endSession();
    }
}
module.exports = {
    createOrder,verifyPayment
};