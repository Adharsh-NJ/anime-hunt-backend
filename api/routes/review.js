const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const Review=require("../models/review")

router.post('/',(req,res,next)=>{
    const review=new Review({
        _id: mongoose.Types.ObjectId(),
     userId:req.body.userId,
     animeId:req.body.animeId,
     rating:req.body.rating,
     review:req.body.review,
    });
    review
    .save()
    .then(result=>{
        console.log(result);
        res.status(201).json({
            message:"Review Added",
            status:201,

        })
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error:err
        })
    })
})

router.get('/:animeId',(req,res,next)=>{
    
    Review.find({animeId:req.params.animeId})
    .populate('userId',["firstName","lastName"])
    .exec()
    .then(review=>{
        if(review.length < 1){
            return res.status(404).json({
                message:"No reviews found"
            })
        }else{
         return res.status(200).json({
             message:'reviews found',
             status:200,
             review:review
         })
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    })
}) 

module.exports = router