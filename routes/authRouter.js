const express=require('express')
const {signup, signin, updateProfile,changePassword, forgotPassword, resetPassword, sendVerificationCode, verifyVerificationCode, updateUser} = require('../controllers/authController')
const auth = require('../middlewares/authorization')
const authorizeRole = require('../middlewares/roleMiddleware')
const authLimiter  = require('../middlewares/rateLimiter')

const router= express.Router()


//router.route('/').post()
router.post('/signup', signup)
router.post('/signin', signin)
router.patch('/updateProfile', auth,authorizeRole("admin"), updateProfile)
router.patch('/changePassword',auth, changePassword)
router.patch("/updateUser/:id", auth, authorizeRole("admin"), updateUser);
router.post('/forgotPassword', authorizeRole("admin"),forgotPassword)
router.post('/resetPassword', authLimiter, authorizeRole("admin"), resetPassword)
router.post('/sendVerificationCode', sendVerificationCode)
router.post('/verifyVerificationCode', verifyVerificationCode)
module.exports=router