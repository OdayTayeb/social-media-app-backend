const jwt = require('jsonwebtoken')

module.exports = (req,res,next)=>{
    const Authorization = req.get('Authorization')
    if (!Authorization){
        const err = new Error('Not Authenticated')
        err.statusCode = 401
        next(err)
        return
    }
    const token = Authorization.split(' ')[1]
    let decodedToken 
    try{
        decodedToken = jwt.verify(token,'mysecretandprivatekeytosign')    
    }
    catch (err){
        err.statusCode = 500
        next(err)
        return
    }
    if (!decodedToken){
        const err = new Error('Not Authenticated')
        err.statusCode = 401
        next(err)
        return
    }
    req.userId = decodedToken.id
    req.userName = decodedToken.userName
    next()
}