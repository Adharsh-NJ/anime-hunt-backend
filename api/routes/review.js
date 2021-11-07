const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const Review = require("../models/review")

router.post('/', (req, res, next) => {
    let header = req.get("Authorization");
    if (header) {
        var token = header.split(" ")[1];
        jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
            if (err) {
                console.log("ERROR IN CHECK_TOKEN ", err);
                if (err.name == "TokenExpiredError") {
                    return res.status(401).json({
                        success: false,
                        message: "Session Expired, Please Login again!",
                        isTokenExpired: true,
                    });
                }
                res.status(500).json({
                    success: false,
                    message: err.message,
                });
            } else {
                User.findOne({ _id: decoded.userId })
                    .then(user => {
                        const review = new Review({
                            _id: mongoose.Types.ObjectId(),
                            userId: decoded.userId,
                            animeId: req.body.animeId,
                            rating: req.body.rating,
                            review: req.body.review,
                        });
                        review
                            .save()
                            .then(result => {
                                console.log(result);
                                res.status(201).json({
                                    message: "Review Added",
                                    status: 201,

                                })
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    error: err
                                })
                            })
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(422).json({
                            message: "Invaild token"
                        })
                    })
            }
        });
    } else {
        return res.status(400).json({
            success: false,
            message: "Access denied! Unauthorized user",
        });
    }


})

router.get('/:animeId', (req, res, next) => {

    Review.find({ animeId: req.params.animeId })
        .populate('userId', ["firstName", "lastName"])
        .exec()
        .then(review => {
            if (review.length < 1) {
                return res.status(404).json({
                    message: "No reviews found"
                })
            } else {
                return res.status(200).json({
                    message: 'reviews found',
                    status: 200,
                    review: review
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