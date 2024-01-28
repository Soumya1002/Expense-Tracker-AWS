const express = require('express');
const router = express.Router();

const resetpasswordController = require('../controller/resetpassword');

router.get('/forgotpassword', resetpasswordController.forgetPassPage)
router.post('/forgotpassword', resetpasswordController.forgotPassword);
router.get('/resetpassword/:id', resetpasswordController.resetPassword)
router.get('/updatepassword/:id',resetpasswordController.updatePassword)

module.exports = router; 