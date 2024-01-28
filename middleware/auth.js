const jwt = require('jsonwebtoken');
const User = require('../models/user');
const dotenv = require("dotenv");
dotenv.config();

const authenticate = async (req, res, next) => {
    try {
      const token = req.header('Authorization');
      //console.log('Token:', token);
  
      if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
      }
      //console.log('env ===',process.env.TOKEN_SECRET)
      const user = jwt.verify(token, process.env.TOKEN_SECRET);
      //console.log('User:', user);
  
      const foundUser = await User.findByPk(user.userId);
  
      if (!foundUser) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }
  
      req.user = foundUser;
      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(405).json({ success: false, message: 'Invalid token' });
    }
  };
  

module.exports = {
  authenticate,
};
