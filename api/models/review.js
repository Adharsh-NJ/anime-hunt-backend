const mongoose=require("mongoose")

const reviewSchema=mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
     userId:{type:mongoose.ObjectId,ref:"User",required:true},
     animeId:{type:Number,required:true},
     rating:{type:Number,required:true},
     review:{type:String,required:true},
})

module.exports=mongoose.model("Review",reviewSchema)