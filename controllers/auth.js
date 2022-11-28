const {validationResult} = require('express-validator/check')
const Hash = require('bcryptjs');
const Database = require('../Database');
const jwt = require('jsonwebtoken')

exports.signup = (req,res,next)=>{
    const validationErr = validationResult(req);
    if (!validationErr.isEmpty()){
        const err = new Error('Validation Error')
        err.statusCode = 422
        next(err)
        return
    }
    const email = req.body.email
    const password = req.body.password
    const name = req.body.name
    Hash.hash(password,12)
        .then(HashedPassword=>
            {
                Database.execute(
                    'INSERT INTO user (email,password,name,status) VALUES (?,?,?,?)',
                    [email,HashedPassword,name,'Hi I am New'])
                .then(result=>{
                    res.status(201).json({message: 'User Created Successfully!'})
                })
            })
        .catch(err=>
            {
                err.message ='Validation Error'
                err.statusCode = 422
                next(err)
            })
}

exports.login = (req,res,next)=>{
    const email = req.body.email
    const password = req.body.password
    let loggedInUserID,loggedInUserEmail,loggedInUserName
    Database.execute('SELECT * FROM user WHERE email=?',[email])
    .then(
        result =>{
            if (result[0].length === 0){
                const err = new Error('No such email exists')
                err.statusCode = 404
                next(err)
            }
            const DBPW = result[0][0].password
            loggedInUserID = result[0][0].id
            loggedInUserEmail = result[0][0].email
            loggedInUserName = result[0][0].name
            return Hash.compare(password,DBPW)
        }
    ).then( equal =>{
        if (!equal){
            const err = new Error('Password is not correct')
            err.statusCode = 401
            next(err)    
        }
        const token = jwt.sign({
            email:loggedInUserEmail,
            userName:loggedInUserName,
            id:loggedInUserID,
        },'mysecretandprivatekeytosign',{
            expiresIn: '1h'
        })
        res.status(200).json({
            token: token,
            userid: loggedInUserID,
        })
    }).catch(err=>{
        err.message ='Validation Error'
        err.statusCode = 422
        next(err)
    })

}