const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

//User model
const User = require('../models/User');

router.get('/login' , (req,res) => res.render('login'));

router.get('/register' , (req,res) => res.render('register'));

//Register Handle 
router.post('/register', (req,res) => {
    const {name,email,password,password2} = req.body;
    let errors = [];

    // check require fields 
    if(!name || !email || !password || !password2){
        errors.push({msg:'Please fill in all fileds'});
    }

    if(password!==password2){
      errors.push({msg:'password do not match'});
    }

    if(password.length < 3){
        errors.push({msg:'password should be at least 6 characters'});
    }

    if(errors.length >0){
        res.render('register', {errors,name,email,password,password2});
    }else{
        //validate passed
        User.findOne({email:email})
        .then(user => {
            if(user){
                //User exists
                errors.push({msg:'Email is already registered'}); 
                res.render('register', {errors,name,email,password,password2});
            }else{
                const newUser = new User({
                    name,email,password
                });
            
                //Hash Password 
                bcrypt.genSalt(10, (err,salt) =>
                bcrypt.hash(newUser.password,salt,(err,hash)=> {
                  if(err) throw err;
                  // set password to hashed 
                  newUser.password = hash;
                  // Save user
                   newUser.save()
                   .then(user => {
                       req.flash('success_msg','you are now registered and can log in');
                       res.redirect('/users/login');
                   })
                   .catch(err=> console.log(err));
                }));

            }
        });
    }

});

//Login handle
router.post('/login', (req,res,next)=>{
    passport.authenticate('local',{
      successRedirect:'/dashboard',
      failureRedirect:'/users/login',
      failureFlash:true
    })(req,res,next);
});

//logout handle
router.get('/logout', (req,res) => {
    req.logout();
    req.flash('success_msg', 'you are logged out');
    res.redirect('/users/login');
});
module.exports = router;
