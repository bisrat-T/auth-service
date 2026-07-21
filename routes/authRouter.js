const express=require('express')
const {signup, signin, updateProfile,changePassword, forgotPassword, resetPassword, sendVerificationCode, verifyVerificationCode} = require('../controllers/authController')
const auth = require('../middlewares/authorization')

const router= express.Router()


//router.route('/').post()
router.post('/signup', signup)
router.post('/signin', signin)
router.patch('/updateProfile', auth, updateProfile)
router.patch('/changePassword',auth, changePassword)
router.post('/forgotPassword', forgotPassword)
router.post('/resetPassword', resetPassword)
router.post('/sendVerificationCode', sendVerificationCode)
router.post('/verifyVerificationCode', verifyVerificationCode)
module.exports=router