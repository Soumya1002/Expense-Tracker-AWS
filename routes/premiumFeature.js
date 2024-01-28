const express = require('express')

const premiumFeatureController = require('../controller/premiumFeature')

const authenticationmiddleware = require('../middleware/auth')

const router = express.Router()

router.get('/showLeaderBoard', authenticationmiddleware.authenticate, premiumFeatureController.getUserLeaderBoard)


module.exports = router