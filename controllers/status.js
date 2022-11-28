const database = require('../Database')


exports.getMyStatus = (req,res,next) => {
    loggedInUserID = req.userId
    database.execute('SELECT * FROM user WHERE id=?',[loggedInUserID]).then(
        result=>{
            if (!result){
                const err = new Error('could not find user')
                err.statusCode = 404
                next(err)
            }
            res.status(200).json({
                message : 'user status fetched',
                status: result[0][0].status,
            })
        }
    )
}

exports.updateMyStatus = (req,res,next) => {
    loggedInUserID = req.userId
    newStatus = req.body.newStatus
    database.execute('UPDATE user SET status=? WHERE id=?',[newStatus,loggedInUserID]).then(
        result =>{
            res.status(200).json({
                message:'status Updated',
                status: newStatus,
            })
        }
    )
}