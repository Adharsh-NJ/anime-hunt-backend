const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const bcrypt = require('bcrypt')
const dotenv = require("dotenv/config")
const jwt = require('jsonwebtoken')
const User = require("../models/user")

router.post('/signup', (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length >= 1) {
                return res.status(409).json({
                    message: "Mail exists"
                })
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        res.status(500).json({
                            error: err
                        })
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            email: req.body.email,
                            password: hash
                        });
                        user
                            .save()
                            .then(result => {
                                console.log(result);
                                res.status(201).json({
                                    message: "user created",
                                    status: 201,
                                    userData: {
                                        firstName: result.firstName,
                                    }
                                })
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    error: err
                                })
                            })
                    }
                })
            }
        })


})

router.post('/signin', (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: "Auth failed"
                })
            }
            else {
                bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                    if (err) {
                        return res.status(401).json({
                            message: 'Auth failed'
                        })
                    }
                    if (result) {
                        const token = jwt.sign({
                            email: user[0].email,
                            userId: user[0]._id
                        }, process.env.JWT_KEY, {
                            expiresIn: "1h"
                        })
                        return res.status(200).json({
                            message: 'Auth successful',
                            token: token,
                            status: 200,
                            userData: {
                                firstName: user[0].firstName,
                                lastName: user[0].lastName,
                                userId: user[0]._id
                            }
                        })
                    }
                    res.status(401).json({
                        message: 'Auth failed'
                    })
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

router.get('/getuser', (req, res, next) => {
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
                        user.password = undefined
                        res.status(200).json({
                          data:user
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

module.exports = router