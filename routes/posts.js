const express = require('express')
const router = express.Router()
const { body } = require('express-validator')

const isAuth = require('../is-auth')
const controller = require('../controllers/posts')

router.get('/posts',isAuth, controller.GetPosts)

router.post('/post',isAuth,[
    body('title').trim().isLength({min:5}),
    body('content').trim().isLength({min:5})
],controller.CreatePost)

router.get('/post/:postID',controller.GetPost)

router.put(
    '/post/:postID',isAuth,
    body('title').trim().isLength({min:5}),
    body('content').trim().isLength({min:5}),
    controller.EditPost
)

router.delete('/post/:postID',isAuth,controller.DeletePost),

module.exports = router