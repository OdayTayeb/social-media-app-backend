const express = require('express')
const router = express.Router()
const { body } = require('express-validator')

const isAuth = require('../is-auth')
const controller = require('../controllers/status')

router.get('/mystatus',isAuth,controller.getMyStatus)

router.put('/update',isAuth,controller.updateMyStatus)

module.exports = router