const express = require('express')
const router = express.Router();
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const keys = require('../../config/keys')
const passport = require('passport')

//Load validate input function
const validateRegisterInput = require('../../validation/register')
const validateLoginInput = require('../../validation/login')

//Load User model
const User = require('../../models/User')

router.get('/test',(req,res) => res.json({msg:'Users works'}))

// POST /api/users/register
//register route
router.post('/register',(req,res)=>{
    //destructure
    const {errors, isValid} = validateRegisterInput(req.body);

    //check validation
    if(!isValid){
        return res.status(400).json(errors);
    }

    User.findOne({email:req.body.email})
        .then(user =>{
            if(user){
                errors.email = 'Email already exists!'
                return res.status(400).json(errors)
            }else{
                //variable avatar
                const avatar = gravatar.url(req.body.email,{
                    s:"200", //size
                    r:"pg", //rating
                    d:"mm", //Default
                });

                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password,
                    avatar,
                });

                bcrypt.genSalt(10,(err,salt) =>{
                    bcrypt.hash(newUser.password,salt,(err,hash)=>{
                        if(err) throw err;

                        newUser.password = hash;
                        newUser.save()
                            .then(user => res.json(user))
                            .catch(err => console.log(err))
                    })
                })
            }
        })
});

// POST /api/users/login
//User Login route
router.post('/login',(req,res)=>{
    //destructure
    const {errors, isValid} = validateLoginInput(req.body);

    //check validation
    if(!isValid){
        return res.status(400).json(errors);
    }

    const email = req.body.email;
    const password = req.body.password;

    //find user by email
    User.findOne({email})
        .then(user =>{
            if(!user){
                errors.email = "User Not Found!";
                return res.status(404).json(errors);
            }
            //check password
            bcrypt.compare(password, user.password)
                .then(isMatch =>{
                    if(isMatch){
                        //User Matched 
                        const payload ={ id:user.id, name:user.name, avatar: user.avatar}  //create jwt payload

                        //sign token
                        jwt.sign(payload, keys.secretOrKey, {expiresIn:3600}, (err, token)=>{
                            res.json({
                                success: true,
                                token: 'Bearer '+token
                            })
                        })
                    }else{
                        errors.password = 'Password Incorrect!'
                        return res.status(400).json(errors)
                    }
                })
        })
});

//GET /api/users/current
//current user
// access private
router.get('/current',passport.authenticate('jwt',{session:false}), (req,res)=>{
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
    })
})

module.exports = router;