import User from "../mongooseModel/User"
import UserModel from "../models/UserModel"
import Realm from "realm"
const { google } = require("googleapis")
import verifyGoogleToken from "../social-provider/googleTokenVerification"
import verifyAppleToken from "../social-provider/appleTokenVerification"
const s3Upload = require("../social-provider/googleToS3")
import verifyFacebookToken from "../social-provider/facebookTokenVerification"
const rateLimit = require("express-rate-limit")
const router = Router()
const createAccountLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 create account requests per `window` (here, per hour)
    message: {
        message:
            "Too many accounts created from this IP, please try again after an hour"
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    keyGenerator: function (req, res) {
        return req.headers["x-forwarded-for"] || req.connection.remoteAddress
    }
})
// Signup
router.post("/signup", async (req, res) => {
    try {
        var data = await UserModel.signup(req.body)
        if (data.value) {
            res.status(200).json(data.data)
        } else {
            res.status(401).json({ message: data.data })
        }
    } catch (error) {
        console.log("inside signup errir", error)
        res.status(500).send(error)
    }
})
//updated Signup flow
router.post("/signup/v5", async (req, res) => {
    try {
        var data = await UserModel.signup_v5(req.body)
        if (data.value) {
            res.status(200).json(data.data)
        } else {
            res.status(401).json({ message: data.data })
        }
    } catch (error) {
        console.log("inside signup error", error)
        res.status(500).send(error)
    }
})
//sign up with only email
router.post("/signup/email", async (req, res) => {
    try {
        var data = await UserModel.signup_email(req.body)
        if (data.value) {
            res.status(200).json(data.data)
        } else {
            res.status(401).json({ message: data.data, name: data.name })
        }
    } catch (error) {
        console.log("inside signup error", error)
        res.status(500).send(error)
    }
})

//sign up with only email (with verification link)
router.post("/signup/email/v1", async (req, res) => {
    try {
        var data = await UserModel.signup_email_v1(req.body)
        if (data.value) {
            res.status(200).json(data.data)
        } else {
            res.status(401).json({ message: data.data, name: data.name })
        }
    } catch (error) {
        console.log("inside signup error", error)
        res.status(500).send(error)
    }
})

// ---------------------------sign up with email verification for testing-------------------------------------
router.post("/signup/email/v11", async (req, res) => {
    try {
        var data = await UserModel.signup_email_v11(req.body)
        if (data.value) {
            res.status(200).json(data.data)
        } else {
            res.status(401).json({ message: data.data, name: data.name })
        }
    } catch (error) {
        console.log("inside signup error", error)
        res.status(500).send(error)
    }
})
// ------------------------------------------------------------------------------------------------------------

//sign up with only mobile
router.post("/signup/mobile", async (req, res) => {
    try {
        var data = await UserModel.signup_mobile(req.body)
        if (data.value) {
            res.status(200).json(data.data)
        } else {
            res.status(401).json({ message: data.data, name: data.name })
        }
    } catch (error) {
        console.log("inside signup error", error)
        res.status(500).send(error)
    }
})
//signup version for performance script
router.post("/signup/v4", async (req, res) => {
    try {
        var data = await UserModel.signup_v4(req.body)
        if (data.value) {
            res.status(200).json(data.data)
        } else {
            res.status(401).json({ message: data.data, name: data.name })
        }
    } catch (error) {
        console.log("inside signup error", error)
        res.status(500).send(error)
    }
})
//signup version1
router.post("/signup/v1", async (req, res) => {
    try {
        var data = await UserModel.signup_v2(req.body)
        if (data.value) {
            res.status(200).json(data.data)
        } else {
            res.status(401).json({ message: data.data, name: data.name })
        }
    } catch (error) {
        console.log("inside signup error", error)
        res.status(500).send(error)
    }
})
//real sign up
router.post("/signup/v3", async (req, res) => {
    try {
        var data = await UserModel.signup_v3(req.body)
        if (data.value) {
            res.status(200).json(data.data)
        } else {
            res.status(401).json({ message: data.data })
        }
    } catch (error) {
        console.log("inside signup errir", error)
        res.status(500).send(error)
    }
})

//signup with social provider
router.post("/signup/google", async (req, res) => {
    const token = req.body.token
    //console.log("Token..", token)
    try {
        // Verify the Google access token
        const userInfo = await verifyGoogleToken(token)
        // Handle the signup process using the user information
        var result = await UserModel.signup_google(userInfo)

        //--------------------------------for updating image from google---------------------------------------
        if (userInfo?.imageurl) {
            var imageUrl = await s3Upload(result?.data?._id, userInfo?.imageurl)
            let cdnUrl = imageUrl.replace(
                process.env.AWS_S3_URL,
                process.env.AWS_CDN_S3_URL
            )
            const insertUrl = { "personalDetails.profilepic": cdnUrl }
            if (result?.data?.personalDetails?.profilepic === null) {
                var img_update = await User.findOneAndUpdate(
                    { _id: result?.data?._id },
                    { $set: insertUrl },
                    { useFindAndModify: false }
                )
            }
        }

        //------------------------------------------------------------------------------------------------------

        res.status(200).json(result.data)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

//signup with social provider
router.post("/signup/facebook", async (req, res) => {
    console.log("signup with facebook api called")
    const accessToken = req?.body?.accessToken?.token
        ? req?.body?.accessToken?.token
        : req?.body?.accessToken
    //console.log("accessToken..", accessToken)
    try {
        // Verify the Facebook access token
        if (
            !req?.body?.email ||
            _.isEmpty(req?.body?.email) === true ||
            _.isUndefined(req?.body?.email)
        ) {
            throw new Error(
                "To proceed with Facebook sign up, please contact support@imeuswe.in"
            )
        }
        const userInfo = await verifyFacebookToken(accessToken)
        // Handle the signup process using the user information

        if (_.includes(userInfo.scopes, "email") === false) {
            throw new Error(
                "To proceed with Facebook sign up, please contact support@imeuswe.in"
            )
        }
        var result = await UserModel.signup_facebook(req?.body)
        res.status(200).json(result.data)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

//signup with social provider
router.post("/signup/apple", async (req, res) => {
    const token = req?.body?.identityToken ? req?.body?.identityToken : req?.body?.info?.identityToken
    let givenName = req.body.givenName
    let familyName = req.body.familyName
    //console.log("Token..", token)
    try {
        // Verify the apple access token
        const verifiedToken = await verifyAppleToken(token)
        //console.log('Token is valid:', verifiedToken);
        const userInfo = {
            sub: verifiedToken.sub,
            email: verifiedToken.email,
            givenName: givenName,
            familyName: familyName
        }

        if (
            verifiedToken.is_private_email === "true" ||
            _.isUndefined(verifiedToken.email) ||
            _.isEmpty(verifiedToken.email)
        ) {
            throw new Error(
                "To proceed with Apple sign up, please contact support@imeuswe.in"
            )
        }
        // Handle the signup process using the user information

        var result = await UserModel.signup_apple(userInfo)
        res.status(200).json(result.data)
        //res.status(200).json(verifiedToken)
    } catch (error) {
        console.log(error)
        res.status(400).json({ error: error.message })

    }
})

// login with email updated sign up flow
router.post("/login/v2", async (req, res) => {
    try {
        let outputData = await UserModel.login_v2(req.body)
        if (outputData && outputData.value) {
            res.status(200).json(outputData.data)
        } else {
            res.status(401).json({
                message: outputData.data,
                name: outputData.name,
                user: outputData.user
            })
        }
    } catch (error) {
        res.status(500).send(error)
    }
})

// login with admin email and password for admin access
router.post("/login/admin/v1", async (req, res) => {
    try {
        let outputData = await UserModel.loginAdmin_v1(req.body)
        if (outputData && outputData.value) {
            res.status(200).json(outputData.data)
        } else {
            res.status(401).json({
                message: outputData.data,
                name: outputData.name,
                user: outputData.user
            })
        }
    } catch (error) {
        res.status(500).send(error)
    }
})

// Login
router.post("/login", async (req, res) => {
    try {
        let outputData = await UserModel.login(req.body)
        if (outputData && outputData.value) {
            res.status(200).json(outputData.data)
        } else {
            res.status(401).json({
                message: outputData.data,
                name: outputData.name,
                user: outputData.user
            })
        }
    } catch (error) {
        console.log("inside err", error)
        res.status(500).send(error)
    }
})
//realm login
router.post("/login/v1", async (req, res) => {
    try {
        let outputData = await UserModel.login_v1(req.body)
        if (outputData && outputData.value) {
            res.status(200).json(outputData.data)
        } else {
            res.status(401).json({
                message: outputData.data,
                name: outputData.name
            })
        }
    } catch (error) {
        console.log("inside err", error)
        res.status(500).send(error)
    }
})
//social
router.post("/social", async (req, res) => {
    try {
        let outputData = await UserModel.social(req.body)
        if (outputData && outputData.value) {
            res.status(200).json(outputData.data)
        } else {
            res.status(401).json({
                message: outputData.data,
                name: outputData.name
            })
        }
    } catch (error) {
        console.log("inside err", error)
        res.status(500).send(error)
    }
})

// Log out

router.post("/logout", async (req, res) => {
    try {
        let outputData = await UserModel.logout(req.body)
        if (outputData && outputData.value) {
            res.status(200).json(outputData.data)
        } else {
            res.status(401).json({ message: outputData.data })
        }
    } catch (error) {
        console.log("error")
        res.status(500).send(error)
    }
})
// Forgot Password
router.post("/forgotPassword", async (req, res) => {
    try {
        let outputData = await UserModel.forgotPassword(req.body)
        if (outputData && outputData.value) {
            res.status(200).json(outputData.data)
        } else {
            res.status(401).json({ message: outputData.data })
        }
    } catch (error) {
        res.status(500).send(error)
    }
})

// Reset Password
router.post("/resetPassword", async (req, res) => {
    try {
        let outputData = await UserModel.resetPassword(req.body)
        if (outputData && outputData.value) {
            res.status(200).json(outputData.data)
        } else {
            res.status(401).json({ message: outputData.data })
        }
    } catch (error) {
        console.log("inside error", error.message)
        if (error && error.message && error.message == "invalid signature") {
            res.status(401).json({ message: "Not a Valid Request" })
        } else {
            res.status(500).send(error)
        }
    }
})
//updated sign up flow verify email
router.post("/verifyEmail/v1", async (req, res) => {
    try {
        let outputData = await UserModel.verifyEmail_v1(req.body)
        if (outputData && outputData.value) {
            res.status(200).json(outputData.data)
        } else {
            res.status(401).json({ message: outputData.data })
        }
    } catch (error) {
        res.status(500).send(error)
    }
})
// Verify Email
router.post("/verifyEmail", async (req, res) => {
    try {
        let outputData = await UserModel.verifyEmail(req.body)
        if (outputData && outputData.value) {
            res.status(200).json(outputData.data)
        } else {
            res.status(401).json({ message: outputData.data })
        }
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post("/verifyUpdatedEmail", async (req, res) => {
    try {
        let outputData = await UserModel.verifyUpdatedEmail(req.body)
        if (outputData && outputData.value) {
            res.status(200).json(outputData.data)
        } else {
            res.status(401).json({ message: outputData.data })
        }
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post("/forgotPasswordVerification", async (req, res) => {
    try {
        let outputData = await UserModel.forgotPasswordVerification(req.body)
        if (outputData && outputData.value) {
            res.status(200).json(outputData.data)
        } else {
            res.status(401).json({ message: outputData.data })
        }
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post("/resendOtp", async (req, res) => {
    try {
        let outputData = await UserModel.resendOtp(req.body)
        if (outputData && outputData.value) {
            res.status(200).json({data:outputData.data, token:outputData.token})
        } else {
            res.status(401).json({ message: outputData.data})
        }
    } catch (error) {
        res.status(500).send(error)
        console.log(error)
    }
})

// api will use for resend otp in the verification link
router.post("/resendOtp_v1", async (req, res) => {
    try {
        let outputData = await UserModel.resendOtp_v1(req.body)
        if (outputData && outputData.value) {
            res.status(200).json(outputData.data)
        } else {
            res.status(401).json({ message: outputData.data })
        }
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post("/resendOtpForUpdate", async (req, res) => {
    try {
        let outputData = await UserModel.resendOtpForUpdate(req.body)
        if (outputData && outputData.value) {
            res.status(200).json(outputData.data)
        } else {
            res.status(401).json({ message: outputData.data })
        }
    } catch (error) {
        res.status(500).send(error)
    }
})
// resend OTP for performance script
router.post("/resendOtpV1", async (req, res) => {
    try {
        let outputData = await UserModel.resendOtpV1(req.body)
        if (outputData && outputData.value) {
            res.status(200).json(outputData.data)
        } else {
            res.status(401).json({ message: outputData.data })
        }
    } catch (error) {
        res.status(500).send(error)
    }
})
//Send mobile Otp
router.post("/resendOtpMobile", async (req, res) => {
    try {
        let outputData = await UserModel.resendOtpMobile(req.body)
        if (outputData && outputData.value) {
            res.status(200).json(outputData.data)
        } else {
            res.status(401).json({
                message: outputData.data,
                name: outputData.name,
                user: outputData.user
            })
        }
    } catch (error) {
        res.status(500).send(error)
    }
})

// update passord for verified user
router.post("/updatePasswordForVerifiedUser", async (req, res) => {
    try {
        let outputData = await UserModel.updatePasswordForVerifiedUser(req.body)
        if (outputData && outputData.value) {
            res.status(200).json(outputData.data)
        } else {
            res.status(401).json({
                message: outputData.data,
                name: outputData.name,
                user: outputData.user
            })
        }
    } catch (error) {
        res.status(500).send(error)
    }
})
//Updated sign up resned mobile otp for both sign up and login with mobile
router.post("/resendOtpMobile/v1", async (req, res) => {
    try {
        let outputData = await UserModel.resendOtpMobile_v1(req.body)
        if (outputData && outputData.value) {
            res.status(200).json(outputData.data)
        } else {
            res.status(401).json({
                message: outputData.data,
                name: outputData.name,
                user: outputData.user
            })
        }
    } catch (error) {
        res.status(500).send(error)
    }
})

//sending otp if owner is change his mobile no
router.post("/resendOtpForUpdateMobile", async (req, res) => {
    try {
        let outputData = await UserModel.resendOtpForUpdateMobile(req.body)
        if (outputData && outputData.value) {
            res.status(200).json(outputData.data)
        } else {
            res.status(401).json({
                message: outputData.data,
                name: outputData.name,
                user: outputData.user
            })
        }
    } catch (error) {
        res.status(500).send(error)
    }
})
// Updated signup flow login with mobile Api
router.post("/loginWithMobile/v1", async (req, res) => {
    try {
        let outputData = await UserModel.loginWithMobile_v1(req.body)
        if (outputData && outputData.value) {
            res.status(200).json(outputData.data)
        } else {
            res.status(401).json({
                message: outputData.data,
                name: outputData.name,
                user: outputData.user
            })
        }
    } catch (error) {
        res.status(500).send(error)
    }
})
router.post("/loginWithMobile", async (req, res) => {
    try {
        let outputData = await UserModel.loginWithMobile(req.body)
        if (outputData && outputData.value) {
            res.status(200).json(outputData.data)
        } else {
            res.status(401).json({
                message: outputData.data,
                name: outputData.name,
                user: outputData.user
            })
        }
    } catch (error) {
        res.status(500).send(error)
    }
})
//verify mobile otp
router.post("/verifyMobile", async (req, res) => {
    try {
        let outputData = await UserModel.verifyMobile(req.body)
        if (outputData && outputData.value) {
            res.status(200).json(outputData.data)
        } else {
            res.status(401).json({ message: outputData.data })
        }
    } catch (error) {
        res.status(500).send(error)
    }
})
// updated sign up verify mobile otp
router.post("/verifyMobile/v1", async (req, res) => {
    try {
        let outputData = await UserModel.verifyMobile_v1(req.body)
        if (outputData && outputData.value) {
            res.status(200).json(outputData.data)
        } else {
            res.status(401).json({ message: outputData.data })
        }
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post("/verifyUpdatedMobile", async (req, res) => {
    try {
        let outputData = await UserModel.verifyUpdatedMobile(req.body)
        if (outputData && outputData.value) {
            res.status(200).json(outputData.data)
        } else {
            res.status(401).json({ message: outputData.data })
        }
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get("/testingRateLimiter", async (req, res) => {
    try {
        let ipAddress = req.ip
        console.log("ipAddress", ipAddress)
        res.status(200).json({
            ipAddress: ipAddress
        })
    } catch (error) {
        res.status(500).send(error)
    }
})

export default router
