const {validationResult} = require('express-validator/check')
const database = require('../Database')
const path = require('path')
const fs = require('fs')

exports.GetPosts = (req,res,next) => {
    database.execute('SELECT * FROM post').then(
        result =>{
            for (const j in result[0])
            {
                result[0][j].creator={}
                result[0][j].creator.name = result[0][j].creatorName
            }
            res.status(200).json({posts:result[0]})
        }
    ).catch(err=>{
        console.log(err)
        err.statusCode = 500
        err.message = 'getting Posts failed'
        next(err)
    })
}

exports.CreatePost = (req,res,next) => {
    const validationErr = validationResult(req);
    if (!validationErr.isEmpty()){
        const err = new Error('Validation Error')
        err.statusCode = 422
        next(err)
    }
    const image = req.file
    if (!image){
        const err = new Error('image not provided Error')
        err.statusCode = 422
        next(err)
    }
    const title = req.body.title
    const content = req.body.content
    const userId = req.userId
    const userName = req.userName
    let imageUrl = image.path
    imageUrl = imageUrl.replace("\\","/");

    database.execute(
        'INSERT INTO post (title,content,creatorID,creatorName,createdAt,imageUrl) VALUES (?,?,?,?,?,?)',
        [title,content,userId,userName,new Date(),imageUrl]
    ).then(
        result => {
        database.execute('SELECT * FROM post WHERE title=? AND content=?',[title,content])
        .then(
            myPost=>{    
            myPost[0][0].creator={}
            myPost[0][0].creator.name=myPost[0][0].creatorName
            res.status(201).json({
                message : 'Post is created',
                post: myPost[0][0],
            })
        })
    }).catch(err => {
        err.statusCode = 500
        err.message = 'Creating Post failed'
        next(err)
    })

    
}

exports.GetPost = (req,res,next) =>{
    const id = req.params.postID
    database.execute(
        'SELECT * FROM post where _id=?',[id]
    ).then(
        result=>{
            if (!result){
                const err = new Error('could not find post')
                err.statusCode = 404
                next(err)
            }
            result[0][0].creator={}
            result[0][0].creator.name=result[0][0].creatorName
            res.status(200).json({
                message:'getting post succeeded',
                post:result[0][0],
            })
        }
    ).catch(err=>{
        err.statusCode = 500
        err.message = 'Getting Post failed'
        next(err)
    })
}

exports.EditPost = (req,res,next) =>{
    const validationErr = validationResult(req);
    if (!validationErr.isEmpty()){
        const err = new Error('Validation Error')
        err.statusCode = 422
        next(err)
    }
    const id = req.params.postID
    const title = req.body.title
    const content = req.body.content
    const userId = req.userId
    let imageUrl = req.body.image
    if (req.file) {
        imageUrl = req.file.path
        imageUrl = imageUrl.replace("\\","/");   
    }
    if (!imageUrl){
        const err = new Error('No Image URL!!')
        err.statusCode = 422
        next(err)
    }
    let OldImageURL
    database.execute('SELECT * FROM post WHERE _id=?',[id])
        .then(result=>
            {
                if (result[0][0].creatorID !==userId ){
                    const err = new Error('UnAuthorized')
                    err.statusCode = 403
                    throw err              
                }
                OldImageURL = result[0][0].imageUrl
                database.execute(
                    'UPDATE post SET title = ? ,content = ?,imageUrl = ? WHERE _id=?',[title,content,imageUrl,id]
                ).then(result =>{
                    if (!result){
                        const err = new Error('No Such Post Found')
                        err.statusCode = 404
                        next(err)   
                    }
                    if (OldImageURL !== imageUrl)
                        ClearImage(OldImageURL)
                    database.execute('SELECT * FROM post WHERE _id=?',[id])
                    .then(Newresult=>
                        { 
                            Newresult[0][0].creator={}
                            Newresult[0][0].creator.name=Newresult[0][0].creatorName
                            res.status(200).json({
                                message:'Post Updated',
                                post: Newresult[0][0],
                            })
                        }
                    )
                    
                })
            })
        .catch(err=>{
            if (!err.statusCode){
                err.statusCode = 500
            }
            next(err)
        })
}

const ClearImage = (Imagepath)=>{
    Imagepath = path.join(__dirname,'..',Imagepath)
    fs.unlink(Imagepath,err=>console.log(err))
}

exports.DeletePost = (req,res,next)=>{
    const id = req.params.postID
    const userId = req.userId
    database.execute('SELECT * FROM post WHERE _id='+id)
        .then(result=>{
            if (result[0][0].creatorID !==userId ){
                const err = new Error('UnAuthorized')
                err.statusCode = 403
                throw err               
            }
            ClearImage(result[0][0].imageUrl)
            database.execute('DELETE FROM post WHERE _id='+id)
            .then(result=>{
            res.status(200).json({message: 'Deleted Successfully!'}) 
        })
        })
        .catch(err=>{
            if (!err.statusCode){
                err.statusCode = 500
            }
            next(err)
        })
}