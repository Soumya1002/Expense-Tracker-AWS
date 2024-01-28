const express = require('express')

const purchaseController = require('../controller/purchase')

const authenticationmiddleware = require('../middleware/auth')

const router = express.Router();

router.get('/premiummembership', authenticationmiddleware.authenticate, purchaseController.purchasePremium)

router.post('/updatetransactionstatus', authenticationmiddleware.authenticate, purchaseController.updateTransactionStatus)


module.exports = router