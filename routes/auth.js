const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
const database = require('../Database')

const controller = require('../controllers/auth')
const { promises } = require('responselike')

router.put('/signup',
    body('email').trim().isEmail().withMessage('Enter Valid Email').custom(
        (value,{req}) =>{
            return database.execute('SELECT * FROM user WHERE email=?',[value])
            .then(result=>{
                if (result[0].length !== 0){
                    return Promise.reject('E-Mail already exists')
                }
            })
        }
    ).normalizeEmail(),
    body('password').trim().isLength({min:5}).withMessage('Enter valid password'),
    body('name').trim().notEmpty().withMessage('Enter valid name'),
    controller.signup
) 

router.post('/login',controller.login)

module.exports = router