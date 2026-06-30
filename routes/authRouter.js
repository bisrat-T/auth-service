const express=require('express')
const {signup, signin, updateProfile,changePassword} = require('../controllers/authController')
const auth = require('../middlewares/authorization')

const router= express.Router()


//router.route('/').post()
router.post('/signup', signup)
router.post('/signin', signin)
router.patch('/updateProfile', auth, updateProfile)
router.patch('/changePassword',auth, changePassword)
module.exports=router