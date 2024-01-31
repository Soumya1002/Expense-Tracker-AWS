const User = require("../models/user");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const dotenv = require("dotenv");
dotenv.config();

function isStringInvalid(string) {
  return string === undefined || string.length === 0;
}
const homePage = async (req, res) => {
  //console.log("SignupPage")
  res.sendFile('home.html', { root: 'public/views'});
};
const signupPage = async (req, res) => {
  //console.log("SignupPage")
  res.sendFile('signup.html', { root: 'public/views'});
};
const loginPage = async (req, res) => {
  //console.log("loginPage")
  res.sendFile('login.html', { root: 'public/views' });
};
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (isStringInvalid(name) || isStringInvalid(email) || isStringInvalid(password)) {
      return res.status(400).json({ err: "Enter details properly" });
    }

    // Check if the email already exists
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ err: "Email already exists. Please use a different email." });
    }

    const saltrounds = 10;
    bcrypt.hash(password, saltrounds, async (err, hash) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
      }

      // Create the user
      await User.create({ name, email, password: hash });
      res.status(200).json({ message: "Signup successful" });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const login = async (req,res)=>{
  try{
  const { email,password } = req.body;
  if(isStringInvalid(email) || isStringInvalid(password)){
    return res.status(400).json({success: false, message: `Email and password is missing`})
  }
  const user = await User.findAll( {where : {email}})
    if(user.length>0){
      bcrypt.compare(password,user[0].password, (err,response)=>{
        if(err){
         throw new Error(`Something went wrong`)
        }
        if(response){
          res.status(200).json({success: true, message:`User Logged in succesfully`, token: generateAccessToken(user[0].id, user[0].name,user[0].ispremiumuser)})
        }else{
          return res.status(400).json({success: false, message: `Password is incorrect`})
        }
      }) 
    }else{
      return res.status(400).json({success: false, message: `User not found`})
    }
  }catch(err){
    res.status(400).json({message: err,success: false})
  }
}

function generateAccessToken(id,name,ispremiumuser){ 
  return jwt.sign({userId: id , name:name, ispremiumuser },process.env.TOKEN_SECRET)
}

module.exports = {
  homePage,
  signupPage,
  signup,
  loginPage,
  login,
  generateAccessToken
};
