import { sha256 } from "js-sha256"
import moment from "moment"
import User from "../mongooseModel/User"
import subscriptionOrder from "../mongooseModel/subscriptionOrder"
import notificationSettings from "../mongooseModel/notificationSettings"
import AdminUser from "../mongooseModel/adminUserModel"
import group from "../mongooseModel/group"
import Realm from "realm"
const { google } = require("googleapis")
const appId = "ca21a82166fb421b887b607be4f5e1a8"
var CryptoJS = require("crypto-js")

const AWS = require("aws-sdk")
AWS.config.update({ region: "ap-south-1" })
const SES = new AWS.SES()
const { Pinpoint } = require("aws-sdk")
const pinpoint = new Pinpoint()
const _ = require("lodash")

const SES_CONFIG = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
}
const AWS_SES = new AWS.SES(SES_CONFIG)

const encryptData = (data) => {
    CryptoJS.AES.encrypt(data, "ImeusWe104$#%98^").toString()
}

export default {
    /**
     * This function adds one to its input.
     * @param {number} input any number
     * @returns {number} that number, plus one.
     */

    // Check Whether User Email is Unique
    // if Unique
    // Create User
    // this.sendVerificationCodeOnEmail
    // else
    // Send Error
    // Priority
    async signup_v3(data) {
        const myApp = new Realm.App({ id: "imeuswe-dev-smgsy" })
        const userrecord = await myApp.emailPasswordAuth.registerUser({
            email: data.email,
            password: data.password
        })
        console.log("userrecord :", userrecord)

        let saveUser
        let suborder

        //     const ifAlreadyUser = await User.findOne({ email: data.email })
        //    // console.log("inside sifngnup", ifAlreadyUser)
        //     if (ifAlreadyUser && ifAlreadyUser._id && ifAlreadyUser.emailVerified && !_.isEmpty(ifAlreadyUser.cognitousername)) {
        //         return { data: "User Already Exist", value: false }
        //     }
        // if(ifAlreadyUser && ifAlreadyUser._id && !_.isEmpty(ifAlreadyUser.cognitousername) && !ifAlreadyUser.emailVerified){
        //     return { data: "User not verified, Please Verify your Email",name:"userExistException", value: false }
        // }
        let newUserObj = {
            email: data.email,
            mobileNo: data.mobileNo,
            cognitousername: data.cognitousername,
            //       password: sha256(data.password),
            personalDetails: {
                name: data.personalDetails.name,
                middlename: data.personalDetails.middlename,
                lastname: data.personalDetails.lastname,
                livingStatus: "yes"
            },
            deviceInfo: {
                model: data.deviceInfo.model,
                platForm: data.deviceInfo.platForm,
                osVersion: data.deviceInfo.osVersion,
                operatingSystem: data.deviceInfo.operatingSystem
            }
        }

        //  if (_.isEmpty(ifAlreadyUser) || !ifAlreadyUser._id || _.isEmpty(ifAlreadyUser.cognitousername) ) {
        let userObj = new User(newUserObj)
        saveUser = await userObj.save()

        // create group If for each signed up user

        //     let findUserGroup = await group.findOne({ ownerId: saveUser._id })
        //     if(_.isNull(findUserGroup)){
        //         console.log("saveUser :",saveUser)
        //         let groupdata = {
        //             ownerId:saveUser._id,
        //             InvitedMembers:[saveUser._id],
        //             storageUsed: {
        //                 Storage: "100",
        //                 member: "50",
        //               },
        //               groupName: saveUser.personalDetails.lastname + " Family",
        //               name: saveUser.personalDetails.name,
        //               Plan: "Free",
        //               SubsType: "monthly",
        //               payment_mode: "NA",
        //               amount: "999",
        //               startDate: Date.now(),
        //               EndDate: null,
        //               payment_status: "NA",
        //               order_status: "Done",
        //         }

        //       let ownerGroup = await group.create(groupdata)

        //     let updateGroupId = await User.updateOne(
        //       { _id: groupdata.ownerId },

        //       {
        //         $push: {
        //           linkedGroup: [ownerGroup._id]
        //         }
        //       }
        //     )

        //      suborder = await subscriptionOrder.create({
        //       name: groupdata.name,
        //       groupId: ownerGroup._id,
        //       ownerId: groupdata.ownerId,
        //       Plan: groupdata.Plan,
        //       SubsType: groupdata.SubsType,
        //       payment_mode: groupdata.payment_mode,
        //       amount: groupdata.amount,
        //       startDate: groupdata.startDate,
        //       EndDate: groupdata.EndDate,
        //       payment_status: groupdata.payment_status,
        //       order_status: groupdata.order_status
        //     })
        //     let ownerNotificationSetting = await notificationSettings.create({
        //       userId:  groupdata.ownerId,
        //       groupId: ownerGroup._id
        //     })

        //       //  res.status(201).send(suborder)

        //      }
        //      else{

        //     suborder ={"message":'Good news this user id '+  groupdata.ownerId+' already have group'}
        //     console.log(suborder)
        // //     res.status(200).send('Good news this user id '+  groupdata.ownerId+' already have group' )

        //    }
        // Group Id creation complete
        if (saveUser && !saveUser._id) {
            return {
                data: "Something Went Wrong While Saving User",
                value: false
            }
        }
        // } else {
        //     const updateUser = await User.updateOne(
        //         { _id: ifAlreadyUser._id },
        //         newUserObj
        //     )
        //     if (updateUser && !updateUser.nModified) {
        //         return { data: "Failed to Save User", value: false }
        //     }
        //     saveUser = ifAlreadyUser
        // }

        const mailerOutput = await UserModel.sendVerificationCodeOnEmail({
            email: data.email
        })
        console.log("mailerOutput mailerOutput ", mailerOutput)
        if (mailerOutput && !mailerOutput.value) {
            return { data: "Failed to Signup", value: false }
        }

        let ObjToReturn = {
            email: data.email,
            name: data.name,
            mobileNo: data.mobileNo,
            cognitousername: data.cognitousername,
            suborder: suborder
        }
        return { data: ObjToReturn, value: true }
    },

    async signup_v2(data) {
        let saveUser
        let suborder
        let sameEmail
        let sameMobileNo
        data.email = _.trim(_.toLower(data.email))
        const ifAlreadyUser = await User.findOne({
            $or: [{ email: data.email }, { mobileNo: data.mobileNo }]
        })
        if (ifAlreadyUser) {
            if (data.mobileNo === ifAlreadyUser.mobileNo) {
                sameMobileNo = true
            } else {
                sameMobileNo = false
            }
            if (data.email === ifAlreadyUser.email) {
                sameEmail = true
            } else {
                sameEmail = false
            }
        }

        if (
            ifAlreadyUser &&
            ifAlreadyUser._id &&
            ifAlreadyUser.emailVerified &&
            ifAlreadyUser.mobileVerified &&
            !_.isEmpty(ifAlreadyUser.cognitousername)
        ) {
            return {
                data: "User Already Exist",
                name: "userVerified",
                value: false
            }
        }
        if (
            ifAlreadyUser &&
            ifAlreadyUser._id &&
            !_.isEmpty(ifAlreadyUser.cognitousername) &&
            ifAlreadyUser.mobileVerified &&
            !ifAlreadyUser.emailVerified &&
            !sameEmail &&
            sameMobileNo
        ) {
            return {
                data: "Data mismatched",
                name: "DataMismatched",
                value: false
            }
        }
        if (
            ifAlreadyUser &&
            ifAlreadyUser._id &&
            !_.isEmpty(ifAlreadyUser.cognitousername) &&
            ifAlreadyUser.mobileVerified &&
            !ifAlreadyUser.emailVerified &&
            sameEmail &&
            !sameMobileNo
        ) {
            return {
                data: "Data mismatched",
                name: "DataMismatched",
                value: false
            }
        }
        // if(ifAlreadyUser && ifAlreadyUser._id && !_.isEmpty(ifAlreadyUser.cognitousername) && ifAlreadyUser.mobileVerified && !ifAlreadyUser.emailVerified  ){
        //     return { data: "User not verified, Please Verify your Email",name:"userEmailNotVerified", value: false }
        // }
        if (
            ifAlreadyUser &&
            ifAlreadyUser._id &&
            !_.isEmpty(ifAlreadyUser.cognitousername) &&
            !ifAlreadyUser.mobileVerified &&
            ifAlreadyUser.emailVerified
        ) {
            return {
                data: "User not verified, Please Verify your Mobile",
                name: "userMobileNotVerified",
                value: false
            }
        }
        // if(ifAlreadyUser && ifAlreadyUser._id && !_.isEmpty(ifAlreadyUser.cognitousername) && !ifAlreadyUser.mobileVerified && !ifAlreadyUser.emailVerified){
        //     return { data: "User not verified, Please Verify your Email & Mobile",name:"userEmailMobileNotVerified", value: false }
        // }
        let newUserObj = {
            email: data.email,
            mobileNo: data.mobileNo,
            cognitousername: data.cognitousername,
            password: sha256(data.password),
            personalDetails: {
                name: data.personalDetails.name,
                middlename: data.personalDetails.middlename,
                lastname: data.personalDetails.lastname,
                livingStatus: "yes"
            },
            deviceInfo: {
                model: data.deviceInfo.model,
                platForm: data.deviceInfo.platForm,
                osVersion: data.deviceInfo.osVersion,
                operatingSystem: data.deviceInfo.operatingSystem
            },
            countryCode: data.countryCode
        }

        // if (_.isEmpty(ifAlreadyUser) || !ifAlreadyUser._id || _.isEmpty(ifAlreadyUser.cognitousername) ) {
        if (_.isEmpty(ifAlreadyUser) || !ifAlreadyUser._id) {
            let userObj = new User(newUserObj)
            saveUser = await userObj.save()

            // create group If for each signed up user

            let findUserGroup = await group.findOne({ ownerId: saveUser._id })
            if (_.isNull(findUserGroup)) {
                console.log("saveUser :", saveUser)
                let groupdata = {
                    ownerId: saveUser._id,
                    InvitedMembers: [saveUser._id],
                    storageUsed: {
                        Storage: "100",
                        member: "50"
                    },
                    groupName: saveUser.personalDetails.lastname + " Family",
                    name: saveUser.personalDetails.name,
                    Plan: "Free",
                    SubsType: "monthly",
                    payment_mode: "NA",
                    amount: "999",
                    startDate: Date.now(),
                    EndDate: null,
                    payment_status: "NA",
                    order_status: "Done"
                }

                let ownerGroup = await group.create(groupdata)

                let updateGroupId = await User.updateOne(
                    { _id: groupdata.ownerId },

                    {
                        $push: {
                            linkedGroup: [ownerGroup._id]
                        }
                    }
                )

                suborder = await subscriptionOrder.create({
                    name: groupdata.name,
                    groupId: ownerGroup._id,
                    ownerId: groupdata.ownerId,
                    Plan: groupdata.Plan,
                    SubsType: groupdata.SubsType,
                    payment_mode: groupdata.payment_mode,
                    amount: groupdata.amount,
                    startDate: groupdata.startDate,
                    EndDate: groupdata.EndDate,
                    payment_status: groupdata.payment_status,
                    order_status: groupdata.order_status
                })
                let ownerNotificationSetting =
                    await notificationSettings.create({
                        userId: groupdata.ownerId,
                        groupId: ownerGroup._id
                    })

                //  res.status(201).send(suborder)
            } else {
                suborder = {
                    message:
                        "Good news this user id " +
                        groupdata.ownerId +
                        " already have group"
                }
                //     res.status(200).send('Good news this user id '+  groupdata.ownerId+' already have group' )
            }
            // Group Id creation complete
            if (saveUser && !saveUser._id) {
                return {
                    data: "Something Went Wrong While Saving User",
                    value: false
                }
            }
        }
        // else if ((!_.isEmpty(ifAlreadyUser) || ifAlreadyUser._id)||(sameEmail && sameMobileNo )||(sameEmail && sameMobileNo && ifAlreadyUser && ifAlreadyUser._id && !_.isEmpty(ifAlreadyUser.cognitousername) && !ifAlreadyUser.mobileVerified && !ifAlreadyUser.emailVerified) ){
        else if (
            !_.isEmpty(ifAlreadyUser) ||
            ifAlreadyUser._id ||
            (sameEmail && sameMobileNo) ||
            (sameEmail &&
                sameMobileNo &&
                ifAlreadyUser &&
                ifAlreadyUser._id &&
                !ifAlreadyUser.mobileVerified &&
                !ifAlreadyUser.emailVerified)
        ) {
            const updateUser = await User.updateOne(
                { _id: ifAlreadyUser._id },
                newUserObj
            )
            if (updateUser && !updateUser.nModified) {
                return { data: "Failed to Save User", value: false }
            }
            saveUser = ifAlreadyUser
        }

        const mailerOutput = await UserModel.sendMobileOtp({
            mobileNo: data.mobileNo
        })
        if (mailerOutput && !mailerOutput.value) {
            return { data: "Failed to Signup", value: false }
        }

        let ObjToReturn = {
            email: data.email,
            name: data.name,
            mobileNo: data.mobileNo,
            cognitousername: data.cognitousername,
            suborder: suborder
        }
        return { data: ObjToReturn, value: true }
    },
    //updated signup
    async signup_v5(data) {
        let saveUser
        let suborder
        let sameEmail
        let sameMobileNo
        data.email = _.trim(_.toLower(data.email))
        const ifAlreadyUser = await User.findOne({
            $or: [{ email: data.email }, { mobileNo: data.mobileNo }]
        })
        console.log("ifAlreadyUser :", ifAlreadyUser)
        if (ifAlreadyUser) {
            if (data.mobileNo === ifAlreadyUser.mobileNo) {
                sameMobileNo = true
            } else {
                sameMobileNo = false
            }
            if (data.email === ifAlreadyUser.email) {
                sameEmail = true
            } else {
                sameEmail = false
            }
        }
        if (
            data.email &&
            ifAlreadyUser &&
            ifAlreadyUser._id &&
            ifAlreadyUser.emailVerified &&
            !_.isEmpty(ifAlreadyUser.cognitousername)
        ) {
            return {
                data: "User Already Exist",
                name: "userVerified",
                value: false
            }
        }
        if (
            data.mobileNo &&
            ifAlreadyUser &&
            ifAlreadyUser._id &&
            ifAlreadyUser.mobileVerified &&
            !_.isEmpty(ifAlreadyUser.cognitousername)
        ) {
            return {
                data: "User Already Exist",
                name: "userVerified",
                value: false
            }
        }
        //data mismatched is not required here
        // if(ifAlreadyUser && ifAlreadyUser._id && !_.isEmpty(ifAlreadyUser.cognitousername) && ifAlreadyUser.mobileVerified && !ifAlreadyUser.emailVerified && !sameEmail && sameMobileNo ){
        //     return { data: "Data mismatched",name:"DataMismatched", value: false }
        // }

        //data mismatched is not required here
        // if(ifAlreadyUser && ifAlreadyUser._id && !_.isEmpty(ifAlreadyUser.cognitousername) && ifAlreadyUser.mobileVerified && !ifAlreadyUser.emailVerified && sameEmail && !sameMobileNo ){
        //     return { data: "Data mismatched",name:"DataMismatched", value: false }
        // }

        // // if(ifAlreadyUser && ifAlreadyUser._id && !_.isEmpty(ifAlreadyUser.cognitousername) && ifAlreadyUser.mobileVerified && !ifAlreadyUser.emailVerified  ){
        // //     return { data: "User not verified, Please Verify your Email",name:"userEmailNotVerified", value: false }
        // // }
        if (
            data.mobileNo &&
            _.isNull(data.email) &&
            ifAlreadyUser &&
            ifAlreadyUser._id &&
            !_.isEmpty(ifAlreadyUser.cognitousername) &&
            !ifAlreadyUser.mobileVerified
        ) {
            return {
                data: "User not verified, Please Verify your Mobile",
                name: "userMobileNotVerified",
                value: false
            }
        }

        if (
            data.email &&
            _.isNull(data.mobileNo) &&
            ifAlreadyUser &&
            ifAlreadyUser._id &&
            !_.isEmpty(ifAlreadyUser.cognitousername) &&
            !ifAlreadyUser.emailVerified
        ) {
            return {
                data: "User not verified, Please Verify your Email",
                name: "userEmailNotVerified",
                value: false
            }
        }
        // if(ifAlreadyUser && ifAlreadyUser._id && !_.isEmpty(ifAlreadyUser.cognitousername) && !ifAlreadyUser.mobileVerified && !ifAlreadyUser.emailVerified){
        //     return { data: "User not verified, Please Verify your Email & Mobile",name:"userEmailMobileNotVerified", value: false }
        // }
        let newUserObj = {
            email: data.email,
            mobileNo: data.mobileNo,
            cognitousername: data.cognitousername,
            password: sha256(data.password),
            personalDetails: {
                name: data.personalDetails.name,
                middlename: data.personalDetails.middlename,
                lastname: data.personalDetails.lastname,
                livingStatus: "yes"
            },
            deviceInfo: {
                model: data.deviceInfo.model,
                platForm: data.deviceInfo.platForm,
                osVersion: data.deviceInfo.osVersion,
                operatingSystem: data.deviceInfo.operatingSystem
            },
            countryCode: data.countryCode
        }

        // if (_.isEmpty(ifAlreadyUser) || !ifAlreadyUser._id || _.isEmpty(ifAlreadyUser.cognitousername) ) {
        if (_.isEmpty(ifAlreadyUser) || !ifAlreadyUser._id) {
            let userObj = new User(newUserObj)
            saveUser = await userObj.save()

            // create group If for each signed up user

            let findUserGroup = await group.findOne({ ownerId: saveUser._id })
            if (_.isNull(findUserGroup)) {
                console.log("saveUser :", saveUser)
                let groupdata = {
                    ownerId: saveUser._id,
                    InvitedMembers: [saveUser._id],
                    storageUsed: {
                        Storage: "100",
                        member: "50"
                    },
                    groupName: saveUser.personalDetails.lastname + " Family",
                    name: saveUser.personalDetails.name,
                    Plan: "Free",
                    SubsType: "monthly",
                    payment_mode: "NA",
                    amount: "999",
                    startDate: Date.now(),
                    EndDate: null,
                    payment_status: "NA",
                    order_status: "Done"
                }

                let ownerGroup = await group.create(groupdata)

                let updateGroupId = await User.updateOne(
                    { _id: groupdata.ownerId },

                    {
                        $push: {
                            linkedGroup: [ownerGroup._id]
                        }
                    }
                )

                suborder = await subscriptionOrder.create({
                    name: groupdata.name,
                    groupId: ownerGroup._id,
                    ownerId: groupdata.ownerId,
                    Plan: groupdata.Plan,
                    SubsType: groupdata.SubsType,
                    payment_mode: groupdata.payment_mode,
                    amount: groupdata.amount,
                    startDate: groupdata.startDate,
                    EndDate: groupdata.EndDate,
                    payment_status: groupdata.payment_status,
                    order_status: groupdata.order_status
                })
                let ownerNotificationSetting =
                    await notificationSettings.create({
                        userId: groupdata.ownerId,
                        groupId: ownerGroup._id
                    })

                //  res.status(201).send(suborder)
            } else {
                suborder = {
                    message:
                        "Good news this user id " +
                        groupdata.ownerId +
                        " already have group"
                }
                //     res.status(200).send('Good news this user id '+  groupdata.ownerId+' already have group' )
            }
            // Group Id creation complete
            if (saveUser && !saveUser._id) {
                return {
                    data: "Something Went Wrong While Saving User",
                    value: false
                }
            }
        }
        // else if ((!_.isEmpty(ifAlreadyUser) || ifAlreadyUser._id)||(sameEmail && sameMobileNo )||(sameEmail && sameMobileNo && ifAlreadyUser && ifAlreadyUser._id && !_.isEmpty(ifAlreadyUser.cognitousername) && !ifAlreadyUser.mobileVerified && !ifAlreadyUser.emailVerified) ){
        else if (
            !_.isEmpty(ifAlreadyUser) ||
            ifAlreadyUser._id ||
            (sameEmail && sameMobileNo) ||
            (sameEmail &&
                sameMobileNo &&
                ifAlreadyUser &&
                ifAlreadyUser._id &&
                !ifAlreadyUser.mobileVerified &&
                !ifAlreadyUser.emailVerified)
        ) {
            const updateUser = await User.updateOne(
                { _id: ifAlreadyUser._id },
                newUserObj
            )
            if (updateUser && !updateUser.nModified) {
                return { data: "Failed to Save User", value: false }
            }
            saveUser = ifAlreadyUser
        }
        let mailerOutput
        if (data.mobileNo) {
            mailerOutput = await UserModel.sendMobileOtp({
                mobileNo: data.mobileNo
            })
        }
        if (data.email) {
            mailerOutput = await UserModel.resendOtp({
                email: data.email
            })
        }

        if (mailerOutput && !mailerOutput.value) {
            return { data: "Failed to Signup", value: false }
        }

        let ObjToReturn = {
            email: data.email,
            name: data.name,
            mobileNo: data.mobileNo,
            cognitousername: data.cognitousername,
            suborder: suborder
        }
        return { data: ObjToReturn, value: true }
    },

    //sign up with email
    async signup_email(data) {
        let saveUser
        let suborder

        data.email = _.trim(_.toLower(data.email))
        const ifAlreadyUser = await User.findOne({ email: data.email })
        const uniqueID = await UserModel.generateUniqueID()

        if (
            ifAlreadyUser &&
            ifAlreadyUser._id &&
            ifAlreadyUser.emailVerified &&
            !_.isEmpty(ifAlreadyUser.cognitousername)
        ) {
            return {
                data: "User Already Exist",
                name: "userVerified",
                value: false
            }
        }

        // add this validation while verifying email.
        // if( ifAlreadyUser && ifAlreadyUser._id && !_.isEmpty(ifAlreadyUser.cognitousername) && !ifAlreadyUser.emailVerified){
        //     return { data: "User not verified, Please Verify your Email",name:"userEmailNotVerified", value: false }
        // }
        let newUserObj = {
            email: data.email,
            //  mobileNo: data.mobileNo,
            cognitousername: uniqueID,
            password: sha256(data.password),
            //  personalDetails:{name: data.personalDetails.name,middlename:data.personalDetails.middlename,lastname:data.personalDetails.lastname, livingStatus: "yes"},
            personalDetails: { livingStatus: "yes" },
            deviceInfo: {
                model: data.deviceInfo.model,
                platForm: data.deviceInfo.platForm,
                osVersion: data.deviceInfo.osVersion,
                operatingSystem: data.deviceInfo.operatingSystem
            }
            //  countryCode: data.countryCode
        }

        if (_.isEmpty(ifAlreadyUser) || !ifAlreadyUser._id) {
            let userObj = new User(newUserObj)
            saveUser = await userObj.save()

            // create group If for each signed up user

            let findUserGroup = await group.findOne({ ownerId: saveUser._id })
            if (_.isNull(findUserGroup)) {
                console.log("saveUser :", saveUser)
                let groupdata = {
                    ownerId: saveUser._id,
                    InvitedMembers: [saveUser._id],
                    storageUsed: {
                        Storage: "100",
                        member: "50"
                    },
                    //     groupName: saveUser.personalDetails.lastname + " Family",
                    //     name: saveUser.personalDetails.name,
                    Plan: "Free",
                    SubsType: "monthly",
                    payment_mode: "NA",
                    amount: "999",
                    startDate: Date.now(),
                    EndDate: null,
                    payment_status: "NA",
                    order_status: "Done"
                }

                let ownerGroup = await group.create(groupdata)

                let updateGroupId = await User.updateOne(
                    { _id: groupdata.ownerId },

                    {
                        $push: {
                            linkedGroup: [ownerGroup._id]
                        }
                    }
                )

                suborder = await subscriptionOrder.create({
                    //  name: groupdata.name,
                    groupId: ownerGroup._id,
                    ownerId: groupdata.ownerId,
                    Plan: groupdata.Plan,
                    SubsType: groupdata.SubsType,
                    payment_mode: groupdata.payment_mode,
                    amount: groupdata.amount,
                    startDate: groupdata.startDate,
                    EndDate: groupdata.EndDate,
                    payment_status: groupdata.payment_status,
                    order_status: groupdata.order_status
                })
                let ownerNotificationSetting =
                    await notificationSettings.create({
                        userId: groupdata.ownerId,
                        groupId: ownerGroup._id
                    })

                //  res.status(201).send(suborder)
            } else {
                suborder = {
                    message:
                        "Good news this user id " +
                        groupdata.ownerId +
                        " already have group"
                }
                //     res.status(200).send('Good news this user id '+  groupdata.ownerId+' already have group' )
            }
            // Group Id creation complete
            if (saveUser && !saveUser._id) {
                return {
                    data: "Something Went Wrong While Saving User",
                    value: false
                }
            }
        }
        // else if ((!_.isEmpty(ifAlreadyUser) || ifAlreadyUser._id)||(sameEmail && sameMobileNo )||(sameEmail && sameMobileNo && ifAlreadyUser && ifAlreadyUser._id && !_.isEmpty(ifAlreadyUser.cognitousername) && !ifAlreadyUser.mobileVerified && !ifAlreadyUser.emailVerified) ){
        else if (
            !_.isEmpty(ifAlreadyUser) &&
            ifAlreadyUser._id &&
            !ifAlreadyUser.emailVerified
        ) {
            if (_.isEmpty(ifAlreadyUser.cognitousername)) {
                saveUser = await User.updateOne(
                    { _id: ifAlreadyUser._id },
                    {
                        password: sha256(data.password),
                        cognitousername: uniqueID,
                        deviceInfo: {
                            model: data.deviceInfo.model,
                            platForm: data.deviceInfo.platForm,
                            osVersion: data.deviceInfo.osVersion,
                            operatingSystem: data.deviceInfo.operatingSystem
                        }
                    }
                )

                // create group If for each signed up user

                let findUserGroup = await group.findOne({
                    ownerId: ifAlreadyUser._id
                })
                if (_.isNull(findUserGroup)) {
                    let groupdata = {
                        ownerId: ifAlreadyUser._id,
                        InvitedMembers: [ifAlreadyUser._id],
                        storageUsed: {
                            Storage: "100",
                            member: "50"
                        },
                        //     groupName: saveUser.personalDetails.lastname + " Family",
                        //     name: saveUser.personalDetails.name,
                        Plan: "Free",
                        SubsType: "monthly",
                        payment_mode: "NA",
                        amount: "999",
                        startDate: Date.now(),
                        EndDate: null,
                        payment_status: "NA",
                        order_status: "Done"
                    }

                    let ownerGroup = await group.create(groupdata)

                    let updateGroupId = await User.updateOne(
                        { _id: groupdata.ownerId },

                        {
                            $push: {
                                linkedGroup: [ownerGroup._id]
                            }
                        }
                    )

                    suborder = await subscriptionOrder.create({
                        //  name: groupdata.name,
                        groupId: ownerGroup._id,
                        ownerId: groupdata.ownerId,
                        Plan: groupdata.Plan,
                        SubsType: groupdata.SubsType,
                        payment_mode: groupdata.payment_mode,
                        amount: groupdata.amount,
                        startDate: groupdata.startDate,
                        EndDate: groupdata.EndDate,
                        payment_status: groupdata.payment_status,
                        order_status: groupdata.order_status
                    })
                    let ownerNotificationSetting =
                        await notificationSettings.create({
                            userId: groupdata.ownerId,
                            groupId: ownerGroup._id
                        })

                    //  res.status(201).send(suborder)
                } else {
                    suborder = {
                        message:
                            "Good news this user id " +
                            groupdata.ownerId +
                            " already have group"
                    }
                    //     res.status(200).send('Good news this user id '+  groupdata.ownerId+' already have group' )
                }
                // Group Id creation complete

                if (saveUser && !saveUser.nModified) {
                    return { data: "Failed to Save User", value: false }
                }
            } else if (!_.isEmpty(ifAlreadyUser.cognitousername)) {
                return {
                    data: "User not verified, Please Verify your Email",
                    name: "userEmailNotVerified",
                    value: false
                }
            }
        }

        const mailerOutput = await UserModel.resendOtp({
            email: data.email
        })

        if (mailerOutput && !mailerOutput.value) {
            return { data: "Failed to Signup", value: false }
        }

        let ObjToReturn = {
            email: data.email,
            //  name: data.name,
            //  mobileNo: data.mobileNo,
            cognitousername: uniqueID,
            suborder: suborder,
            _id: saveUser._id
        }
        return { data: ObjToReturn, value: true }
    },

    //sign up with email( email with verification link)
    async signup_email_v1(data) {
        let saveUser
        let suborder

        data.email = _.trim(_.toLower(data.email))
        const ifAlreadyUser = await User.findOne({ email: data.email })
        const uniqueID = await UserModel.generateUniqueID()

        if (
            ifAlreadyUser &&
            ifAlreadyUser._id &&
            ifAlreadyUser.emailVerified &&
            !_.isEmpty(ifAlreadyUser.cognitousername)
        ) {
            return {
                data: "User Already Exist",
                name: "userVerified",
                value: false
            }
        }

        // add this validation while verifying email.
        // if( ifAlreadyUser && ifAlreadyUser._id && !_.isEmpty(ifAlreadyUser.cognitousername) && !ifAlreadyUser.emailVerified){
        //     return { data: "User not verified, Please Verify your Email",name:"userEmailNotVerified", value: false }
        // }
        let newUserObj = {
            email: data.email,
            //  mobileNo: data.mobileNo,
            cognitousername: uniqueID,
            password: sha256(data.password),
            //  personalDetails:{name: data.personalDetails.name,middlename:data.personalDetails.middlename,lastname:data.personalDetails.lastname, livingStatus: "yes"},
            personalDetails: { livingStatus: "yes" },
            deviceInfo: {
                model: data.deviceInfo.model,
                platForm: data.deviceInfo.platForm,
                osVersion: data.deviceInfo.osVersion,
                operatingSystem: data.deviceInfo.operatingSystem
            }
            //  countryCode: data.countryCode
        }

        if (_.isEmpty(ifAlreadyUser) || !ifAlreadyUser._id) {
            let userObj = new User(newUserObj)
            saveUser = await userObj.save()

            // create group If for each signed up user

            let findUserGroup = await group.findOne({ ownerId: saveUser._id })
            if (_.isNull(findUserGroup)) {
                console.log("saveUser :", saveUser)
                let groupdata = {
                    ownerId: saveUser._id,
                    InvitedMembers: [saveUser._id],
                    storageUsed: {
                        Storage: "100",
                        member: "50"
                    },
                    //     groupName: saveUser.personalDetails.lastname + " Family",
                    //     name: saveUser.personalDetails.name,
                    Plan: "Free",
                    SubsType: "monthly",
                    payment_mode: "NA",
                    amount: "999",
                    startDate: Date.now(),
                    EndDate: null,
                    payment_status: "NA",
                    order_status: "Done"
                }

                let ownerGroup = await group.create(groupdata)

                let updateGroupId = await User.updateOne(
                    { _id: groupdata.ownerId },

                    {
                        $push: {
                            linkedGroup: [ownerGroup._id]
                        }
                    }
                )

                suborder = await subscriptionOrder.create({
                    //  name: groupdata.name,
                    groupId: ownerGroup._id,
                    ownerId: groupdata.ownerId,
                    Plan: groupdata.Plan,
                    SubsType: groupdata.SubsType,
                    payment_mode: groupdata.payment_mode,
                    amount: groupdata.amount,
                    startDate: groupdata.startDate,
                    EndDate: groupdata.EndDate,
                    payment_status: groupdata.payment_status,
                    order_status: groupdata.order_status
                })
                let ownerNotificationSetting =
                    await notificationSettings.create({
                        userId: groupdata.ownerId,
                        groupId: ownerGroup._id
                    })

                //  res.status(201).send(suborder)
            } else {
                suborder = {
                    message:
                        "Good news this user id " +
                        groupdata.ownerId +
                        " already have group"
                }
                //     res.status(200).send('Good news this user id '+  groupdata.ownerId+' already have group' )
            }
            // Group Id creation complete
            if (saveUser && !saveUser._id) {
                return {
                    data: "Something Went Wrong While Saving User",
                    value: false
                }
            }
        }
        // else if ((!_.isEmpty(ifAlreadyUser) || ifAlreadyUser._id)||(sameEmail && sameMobileNo )||(sameEmail && sameMobileNo && ifAlreadyUser && ifAlreadyUser._id && !_.isEmpty(ifAlreadyUser.cognitousername) && !ifAlreadyUser.mobileVerified && !ifAlreadyUser.emailVerified) ){
        else if (
            !_.isEmpty(ifAlreadyUser) &&
            ifAlreadyUser._id &&
            !ifAlreadyUser.emailVerified
        ) {
            if (_.isEmpty(ifAlreadyUser.cognitousername)) {
                saveUser = await User.updateOne(
                    { _id: ifAlreadyUser._id },
                    {
                        password: sha256(data.password),
                        cognitousername: uniqueID,
                        deviceInfo: {
                            model: data.deviceInfo.model,
                            platForm: data.deviceInfo.platForm,
                            osVersion: data.deviceInfo.osVersion,
                            operatingSystem: data.deviceInfo.operatingSystem
                        }
                    }
                )

                // create group If for each signed up user

                let findUserGroup = await group.findOne({
                    ownerId: ifAlreadyUser._id
                })
                if (_.isNull(findUserGroup)) {
                    let groupdata = {
                        ownerId: ifAlreadyUser._id,
                        InvitedMembers: [ifAlreadyUser._id],
                        storageUsed: {
                            Storage: "100",
                            member: "50"
                        },
                        //     groupName: saveUser.personalDetails.lastname + " Family",
                        //     name: saveUser.personalDetails.name,
                        Plan: "Free",
                        SubsType: "monthly",
                        payment_mode: "NA",
                        amount: "999",
                        startDate: Date.now(),
                        EndDate: null,
                        payment_status: "NA",
                        order_status: "Done"
                    }

                    let ownerGroup = await group.create(groupdata)

                    let updateGroupId = await User.updateOne(
                        { _id: groupdata.ownerId },

                        {
                            $push: {
                                linkedGroup: [ownerGroup._id]
                            }
                        }
                    )

                    suborder = await subscriptionOrder.create({
                        //  name: groupdata.name,
                        groupId: ownerGroup._id,
                        ownerId: groupdata.ownerId,
                        Plan: groupdata.Plan,
                        SubsType: groupdata.SubsType,
                        payment_mode: groupdata.payment_mode,
                        amount: groupdata.amount,
                        startDate: groupdata.startDate,
                        EndDate: groupdata.EndDate,
                        payment_status: groupdata.payment_status,
                        order_status: groupdata.order_status
                    })
                    let ownerNotificationSetting =
                        await notificationSettings.create({
                            userId: groupdata.ownerId,
                            groupId: ownerGroup._id
                        })

                    //  res.status(201).send(suborder)
                } else {
                    suborder = {
                        message:
                            "Good news this user id " +
                            groupdata.ownerId +
                            " already have group"
                    }
                    //     res.status(200).send('Good news this user id '+  groupdata.ownerId+' already have group' )
                }
                // Group Id creation complete

                if (saveUser && !saveUser.nModified) {
                    return { data: "Failed to Save User", value: false }
                }
            } else if (!_.isEmpty(ifAlreadyUser.cognitousername)) {
                return {
                    data: "User not verified, Please Verify your Email",
                    name: "userEmailNotVerified",
                    value: false
                }
            }
        }
        // send an email with  verification link
        const mailerOutput = await UserModel.resendOtp_v1({
            email: data.email
        })

        if (mailerOutput && !mailerOutput.value) {
            return { data: "Failed to Signup", value: false }
        }

        let ObjToReturn = {
            email: data.email,
            //  name: data.name,
            //  mobileNo: data.mobileNo,
            cognitousername: uniqueID,
            suborder: suborder,
            _id: saveUser._id
        }
        return { data: ObjToReturn, value: true }
    },

    // --------------------------------------test function v11----------------------------------------------
    async signup_email_v11(data) {
        let saveUser
        let suborder

        data.email = _.trim(_.toLower(data.email))
        const ifAlreadyUser = await User.findOne({ email: data.email })
        const uniqueID = await UserModel.generateUniqueID()

        if (
            ifAlreadyUser &&
            ifAlreadyUser._id &&
            ifAlreadyUser.emailVerified &&
            !_.isEmpty(ifAlreadyUser.cognitousername)
        ) {
            return {
                data: "User Already Exist",
                name: "userVerified",
                value: false
            }
        }

        // add this validation while verifying email.
        // if( ifAlreadyUser && ifAlreadyUser._id && !_.isEmpty(ifAlreadyUser.cognitousername) && !ifAlreadyUser.emailVerified){
        //     return { data: "User not verified, Please Verify your Email",name:"userEmailNotVerified", value: false }
        // }
        let newUserObj = {
            email: data.email,
            //  mobileNo: data.mobileNo,
            cognitousername: uniqueID,
            password: sha256(data.password),
            signup: { hasEmail: true },
            emailVerification: 666777,
            emailVerified: true,
            //  personalDetails:{name: data.personalDetails.name,middlename:data.personalDetails.middlename,lastname:data.personalDetails.lastname, livingStatus: "yes"},
            personalDetails: { livingStatus: "yes" },
            deviceInfo: {
                model: data.deviceInfo.model,
                platForm: data.deviceInfo.platForm,
                osVersion: data.deviceInfo.osVersion,
                operatingSystem: data.deviceInfo.operatingSystem
            }
            //  countryCode: data.countryCode
        }

        if (_.isEmpty(ifAlreadyUser) || !ifAlreadyUser._id) {
            let userObj = new User(newUserObj)
            saveUser = await userObj.save()

            // create group If for each signed up user

            let findUserGroup = await group.findOne({ ownerId: saveUser._id })
            if (_.isNull(findUserGroup)) {
                console.log("saveUser :", saveUser)
                let groupdata = {
                    ownerId: saveUser._id,
                    InvitedMembers: [saveUser._id],
                    storageUsed: {
                        Storage: "100",
                        member: "50"
                    },
                    //     groupName: saveUser.personalDetails.lastname + " Family",
                    //     name: saveUser.personalDetails.name,
                    Plan: "Free",
                    SubsType: "monthly",
                    payment_mode: "NA",
                    amount: "999",
                    startDate: Date.now(),
                    EndDate: null,
                    payment_status: "NA",
                    order_status: "Done"
                }

                let ownerGroup = await group.create(groupdata)

                let updateGroupId = await User.updateOne(
                    { _id: groupdata.ownerId },

                    {
                        $push: {
                            linkedGroup: [ownerGroup._id]
                        }
                    }
                )

                suborder = await subscriptionOrder.create({
                    //  name: groupdata.name,
                    groupId: ownerGroup._id,
                    ownerId: groupdata.ownerId,
                    Plan: groupdata.Plan,
                    SubsType: groupdata.SubsType,
                    payment_mode: groupdata.payment_mode,
                    amount: groupdata.amount,
                    startDate: groupdata.startDate,
                    EndDate: groupdata.EndDate,
                    payment_status: groupdata.payment_status,
                    order_status: groupdata.order_status
                })
                let ownerNotificationSetting =
                    await notificationSettings.create({
                        userId: groupdata.ownerId,
                        groupId: ownerGroup._id
                    })

                //  res.status(201).send(suborder)
            } else {
                suborder = {
                    message:
                        "Good news this user id " +
                        groupdata.ownerId +
                        " already have group"
                }
                //     res.status(200).send('Good news this user id '+  groupdata.ownerId+' already have group' )
            }
            // Group Id creation complete
            if (saveUser && !saveUser._id) {
                return {
                    data: "Something Went Wrong While Saving User",
                    value: false
                }
            }
        }
        // else if ((!_.isEmpty(ifAlreadyUser) || ifAlreadyUser._id)||(sameEmail && sameMobileNo )||(sameEmail && sameMobileNo && ifAlreadyUser && ifAlreadyUser._id && !_.isEmpty(ifAlreadyUser.cognitousername) && !ifAlreadyUser.mobileVerified && !ifAlreadyUser.emailVerified) ){
        else if (
            !_.isEmpty(ifAlreadyUser) &&
            ifAlreadyUser._id &&
            !ifAlreadyUser.emailVerified
        ) {
            if (_.isEmpty(ifAlreadyUser.cognitousername)) {
                saveUser = await User.updateOne(
                    { _id: ifAlreadyUser._id },
                    {
                        password: sha256(data.password),
                        cognitousername: uniqueID,
                        deviceInfo: {
                            model: data.deviceInfo.model,
                            platForm: data.deviceInfo.platForm,
                            osVersion: data.deviceInfo.osVersion,
                            operatingSystem: data.deviceInfo.operatingSystem
                        }
                    }
                )

                // create group If for each signed up user

                let findUserGroup = await group.findOne({
                    ownerId: ifAlreadyUser._id
                })
                if (_.isNull(findUserGroup)) {
                    let groupdata = {
                        ownerId: ifAlreadyUser._id,
                        InvitedMembers: [ifAlreadyUser._id],
                        storageUsed: {
                            Storage: "100",
                            member: "50"
                        },
                        //     groupName: saveUser.personalDetails.lastname + " Family",
                        //     name: saveUser.personalDetails.name,
                        Plan: "Free",
                        SubsType: "monthly",
                        payment_mode: "NA",
                        amount: "999",
                        startDate: Date.now(),
                        EndDate: null,
                        payment_status: "NA",
                        order_status: "Done"
                    }

                    let ownerGroup = await group.create(groupdata)

                    let updateGroupId = await User.updateOne(
                        { _id: groupdata.ownerId },

                        {
                            $push: {
                                linkedGroup: [ownerGroup._id]
                            }
                        }
                    )

                    suborder = await subscriptionOrder.create({
                        //  name: groupdata.name,
                        groupId: ownerGroup._id,
                        ownerId: groupdata.ownerId,
                        Plan: groupdata.Plan,
                        SubsType: groupdata.SubsType,
                        payment_mode: groupdata.payment_mode,
                        amount: groupdata.amount,
                        startDate: groupdata.startDate,
                        EndDate: groupdata.EndDate,
                        payment_status: groupdata.payment_status,
                        order_status: groupdata.order_status
                    })
                    let ownerNotificationSetting =
                        await notificationSettings.create({
                            userId: groupdata.ownerId,
                            groupId: ownerGroup._id
                        })

                    //  res.status(201).send(suborder)
                } else {
                    suborder = {
                        message:
                            "Good news this user id " +
                            groupdata.ownerId +
                            " already have group"
                    }
                    //     res.status(200).send('Good news this user id '+  groupdata.ownerId+' already have group' )
                }
                // Group Id creation complete

                if (saveUser && !saveUser.nModified) {
                    return { data: "Failed to Save User", value: false }
                }
            } else if (!_.isEmpty(ifAlreadyUser.cognitousername)) {
                return {
                    data: "User not verified, Please Verify your Email",
                    name: "userEmailNotVerified",
                    value: false
                }
            }
        }
        // send an email with  verification link
        // const mailerOutput = await UserModel.resendOtp_v1({
        //     email: data.email
        // })

        let ObjToReturn = {
            email: data.email,
            //  name: data.name,
            //  mobileNo: data.mobileNo,
            cognitousername: uniqueID,
            suborder: suborder,
            _id: saveUser._id
        }
        return { data: ObjToReturn, value: true }
    },
    // ----------------------------------------------------------------------------------------------------

    //sign up with google
    async signup_google(data) {
        let saveUser
        let email = _.trim(_.toLower(data.email))
        const uniqueID = await UserModel.generateUniqueID()
        const ifAlreadyUser = await User.findOne({ email: email })
        if (ifAlreadyUser) {
            console.log("User already Exist")
            if (
                _.isNull(ifAlreadyUser.cognitousername) ||
                _.isEmpty(ifAlreadyUser.cognitousername) ||
                _.isUndefined(ifAlreadyUser.cognitousername)
            ) {
                let updateCardtoRegisterUser = await User.updateOne(
                    { _id: ifAlreadyUser._id },
                    {
                        password: null,
                        emailVerified: true,
                        cognitousername: uniqueID,
                        deviceInfo: {
                            model: null,
                            platForm: null,
                            osVersion: null,
                            operatingSystem: null
                        },
                        signup: {
                            hasEmail: false,
                            hasMobile: false,
                            hasGoogle: true,
                            hasApple: false,
                            hasFacebook: false
                        }
                    }
                )
                let updated_user = await User.findOne({ email: email })

                let findUserGroup = await group.findOne({
                    ownerId: ifAlreadyUser._id
                })
                if (_.isNull(findUserGroup)) {
                    let groupdata = {
                        ownerId: ifAlreadyUser._id,
                        InvitedMembers: [ifAlreadyUser._id],
                        storageUsed: {
                            Storage: "100",
                            member: "50"
                        },
                        //     groupName: saveUser.personalDetails.lastname + " Family",
                        //     name: saveUser.personalDetails.name,
                        Plan: "Free",
                        SubsType: "monthly",
                        payment_mode: "NA",
                        amount: "999",
                        startDate: Date.now(),
                        EndDate: null,
                        payment_status: "NA",
                        order_status: "Done"
                    }

                    let ownerGroup = await group.create(groupdata)

                    let updateGroupId = await User.updateOne(
                        { _id: groupdata.ownerId },

                        {
                            $push: {
                                linkedGroup: [ownerGroup._id]
                            }
                        }
                    )

                    let suborder = await subscriptionOrder.create({
                        //  name: groupdata.name,
                        groupId: ownerGroup._id,
                        ownerId: groupdata.ownerId,
                        Plan: groupdata.Plan,
                        SubsType: groupdata.SubsType,
                        payment_mode: groupdata.payment_mode,
                        amount: groupdata.amount,
                        startDate: groupdata.startDate,
                        EndDate: groupdata.EndDate,
                        payment_status: groupdata.payment_status,
                        order_status: groupdata.order_status
                    })

                    let ownerNotificationSetting =
                        await notificationSettings.create({
                            userId: groupdata.ownerId,
                            groupId: ownerGroup._id
                        })

                    return await UserModel.generateAccessTokenUpdatedSignup(
                        updated_user
                    )
                } else {
                    return await UserModel.generateAccessTokenUpdatedSignup(
                        updated_user
                    )
                }
            } else {
                let updateSignupMethod = await User.updateOne(
                    { _id: ifAlreadyUser._id },
                    { $set: { emailVerified: true, "signup.hasGoogle": true } }
                )
                return await UserModel.generateAccessTokenUpdatedSignup(
                    ifAlreadyUser
                )
            }
        } else {
            console.log("User does not Exist")
            let name_arr
            if (data?.name) {
                name_arr = _.split(data?.name, " ", 2)
            }
            let newUserObj = {
                email: _.trim(_.toLower(data.email)),
                //  mobileNo: data.mobileNo,
                cognitousername: uniqueID,
                password: null,
                emailVerified: true,
                //  personalDetails:{name: data.personalDetails.name,middlename:data.personalDetails.middlename,lastname:data.personalDetails.lastname, livingStatus: "yes"},
                personalDetails: {
                    name: name_arr[0],
                    lastname: name_arr[1],
                    livingStatus: "yes"
                },
                deviceInfo: {
                    model: null,
                    platForm: null,
                    osVersion: null,
                    operatingSystem: null
                },
                signup: {
                    hasEmail: false,
                    hasMobile: false,
                    hasGoogle: true,
                    hasApple: false,
                    hasFacebook: false
                }
                //  countryCode: data.countryCode
            }
            //console.log("newUserObj",newUserObj)
            let userObj = new User(newUserObj)
            saveUser = await userObj.save()
            let groupdata = {
                ownerId: saveUser._id,
                InvitedMembers: [saveUser._id],
                storageUsed: {
                    Storage: "100",
                    member: "50"
                },
                //     groupName: saveUser.personalDetails.lastname + " Family",
                //     name: saveUser.personalDetails.name,
                Plan: "Free",
                SubsType: "monthly",
                payment_mode: "NA",
                amount: "999",
                startDate: Date.now(),
                EndDate: null,
                payment_status: "NA",
                order_status: "Done"
            }

            let ownerGroup = await group.create(groupdata)

            let updateGroupId = await User.updateOne(
                { _id: groupdata.ownerId },

                {
                    $push: {
                        linkedGroup: [ownerGroup._id]
                    }
                }
            )

            let suborder = await subscriptionOrder.create({
                //  name: groupdata.name,
                groupId: ownerGroup._id,
                ownerId: groupdata.ownerId,
                Plan: groupdata.Plan,
                SubsType: groupdata.SubsType,
                payment_mode: groupdata.payment_mode,
                amount: groupdata.amount,
                startDate: groupdata.startDate,
                EndDate: groupdata.EndDate,
                payment_status: groupdata.payment_status,
                order_status: groupdata.order_status
            })

            let ownerNotificationSetting = await notificationSettings.create({
                userId: groupdata.ownerId,
                groupId: ownerGroup._id
            })

            return await UserModel.generateAccessTokenUpdatedSignup(saveUser)
        }

        // return
    },

    //sign up with facebook
    async signup_facebook(data) {
        let saveUser
        let email = _.trim(_.toLower(data.email))
        const uniqueID = await UserModel.generateUniqueID()
        const ifAlreadyUser = await User.findOne({ email: email })
        if (ifAlreadyUser) {
            console.log("User already Exist")
            if (
                _.isNull(ifAlreadyUser.cognitousername) ||
                _.isEmpty(ifAlreadyUser.cognitousername) ||
                _.isUndefined(ifAlreadyUser.cognitousername)
            ) {
                let updateCardtoRegisterUser = await User.updateOne(
                    { _id: ifAlreadyUser._id },
                    {
                        password: null,
                        emailVerified: true,
                        cognitousername: uniqueID,
                        deviceInfo: {
                            model: null,
                            platForm: null,
                            osVersion: null,
                            operatingSystem: null
                        },
                        signup: {
                            hasEmail: false,
                            hasMobile: false,
                            hasGoogle: false,
                            hasApple: false,
                            hasFacebook: true
                        }
                    }
                )
                let updated_user = await User.findOne({ email: email })

                let findUserGroup = await group.findOne({
                    ownerId: ifAlreadyUser._id
                })
                if (_.isNull(findUserGroup)) {
                    let groupdata = {
                        ownerId: ifAlreadyUser._id,
                        InvitedMembers: [ifAlreadyUser._id],
                        storageUsed: {
                            Storage: "100",
                            member: "50"
                        },
                        //     groupName: saveUser.personalDetails.lastname + " Family",
                        //     name: saveUser.personalDetails.name,
                        Plan: "Free",
                        SubsType: "monthly",
                        payment_mode: "NA",
                        amount: "999",
                        startDate: Date.now(),
                        EndDate: null,
                        payment_status: "NA",
                        order_status: "Done"
                    }

                    let ownerGroup = await group.create(groupdata)

                    let updateGroupId = await User.updateOne(
                        { _id: groupdata.ownerId },

                        {
                            $push: {
                                linkedGroup: [ownerGroup._id]
                            }
                        }
                    )

                    let suborder = await subscriptionOrder.create({
                        //  name: groupdata.name,
                        groupId: ownerGroup._id,
                        ownerId: groupdata.ownerId,
                        Plan: groupdata.Plan,
                        SubsType: groupdata.SubsType,
                        payment_mode: groupdata.payment_mode,
                        amount: groupdata.amount,
                        startDate: groupdata.startDate,
                        EndDate: groupdata.EndDate,
                        payment_status: groupdata.payment_status,
                        order_status: groupdata.order_status
                    })

                    let ownerNotificationSetting =
                        await notificationSettings.create({
                            userId: groupdata.ownerId,
                            groupId: ownerGroup._id
                        })

                    return await UserModel.generateAccessTokenUpdatedSignup(
                        updated_user
                    )
                } else {
                    return await UserModel.generateAccessTokenUpdatedSignup(
                        updated_user
                    )
                }
            } else {
                let updateSignupMethod = await User.updateOne(
                    { _id: ifAlreadyUser._id },
                    {
                        $set: {
                            emailVerified: true,
                            "signup.hasFacebook": true
                        }
                    }
                )
                return await UserModel.generateAccessTokenUpdatedSignup(
                    ifAlreadyUser
                )
            }
        } else {
            console.log("User does not Exist")
            let name_arr
            /*if (data?.first_name) {
                name_arr = _.split(data?.name, " ", 2)
            }*/

            let newUserObj = {
                email: _.trim(_.toLower(data.email)),
                //  mobileNo: data.mobileNo,
                cognitousername: uniqueID,
                password: null,
                emailVerified: true,
                personalDetails: {
                    name: data.first_name,
                    lastname: data.last_name,
                    livingStatus: "yes"
                },
                deviceInfo: {
                    model: null,
                    platForm: null,
                    osVersion: null,
                    operatingSystem: null
                },
                signup: {
                    hasEmail: false,
                    hasMobile: false,
                    hasGoogle: false,
                    hasApple: false,
                    hasFacebook: true
                }
                //  countryCode: data.countryCode
            }
            //console.log("newUserObj",newUserObj)
            let userObj = new User(newUserObj)
            saveUser = await userObj.save()
            let groupdata = {
                ownerId: saveUser._id,
                InvitedMembers: [saveUser._id],
                storageUsed: {
                    Storage: "100",
                    member: "50"
                },
                //     groupName: saveUser.personalDetails.lastname + " Family",
                //     name: saveUser.personalDetails.name,
                Plan: "Free",
                SubsType: "monthly",
                payment_mode: "NA",
                amount: "999",
                startDate: Date.now(),
                EndDate: null,
                payment_status: "NA",
                order_status: "Done"
            }

            let ownerGroup = await group.create(groupdata)

            let updateGroupId = await User.updateOne(
                { _id: groupdata.ownerId },

                {
                    $push: {
                        linkedGroup: [ownerGroup._id]
                    }
                }
            )

            let suborder = await subscriptionOrder.create({
                //  name: groupdata.name,
                groupId: ownerGroup._id,
                ownerId: groupdata.ownerId,
                Plan: groupdata.Plan,
                SubsType: groupdata.SubsType,
                payment_mode: groupdata.payment_mode,
                amount: groupdata.amount,
                startDate: groupdata.startDate,
                EndDate: groupdata.EndDate,
                payment_status: groupdata.payment_status,
                order_status: groupdata.order_status
            })

            let ownerNotificationSetting = await notificationSettings.create({
                userId: groupdata.ownerId,
                groupId: ownerGroup._id
            })

            return await UserModel.generateAccessTokenUpdatedSignup(saveUser)
        }

        // return
    },

    //sign up with apple
    async signup_apple(data) {
        let saveUser
        let email = _.trim(_.toLower(data.email))
        const uniqueID = await UserModel.generateUniqueID()
        const ifAlreadyUser = await User.findOne({ email: email })
        if (ifAlreadyUser) {
            console.log("User already Exist")
            if (
                _.isNull(ifAlreadyUser.cognitousername) ||
                _.isEmpty(ifAlreadyUser.cognitousername) ||
                _.isUndefined(ifAlreadyUser.cognitousername)
            ) {
                let updateCardtoRegisterUser = await User.updateOne(
                    { _id: ifAlreadyUser._id },
                    {
                        password: null,
                        emailVerified: true,
                        cognitousername: uniqueID,
                        deviceInfo: {
                            model: null,
                            platForm: null,
                            osVersion: null,
                            operatingSystem: null
                        },
                        signup: {
                            hasEmail: false,
                            hasMobile: false,
                            hasGoogle: false,
                            hasApple: true,
                            hasFacebook: false
                        }
                    }
                )
                let updated_user = await User.findOne({ email: email })

                let findUserGroup = await group.findOne({
                    ownerId: ifAlreadyUser._id
                })
                if (_.isNull(findUserGroup)) {
                    let groupdata = {
                        ownerId: ifAlreadyUser._id,
                        InvitedMembers: [ifAlreadyUser._id],
                        storageUsed: {
                            Storage: "100",
                            member: "50"
                        },
                        //     groupName: saveUser.personalDetails.lastname + " Family",
                        //     name: saveUser.personalDetails.name,
                        Plan: "Free",
                        SubsType: "monthly",
                        payment_mode: "NA",
                        amount: "999",
                        startDate: Date.now(),
                        EndDate: null,
                        payment_status: "NA",
                        order_status: "Done"
                    }

                    let ownerGroup = await group.create(groupdata)

                    let updateGroupId = await User.updateOne(
                        { _id: groupdata.ownerId },

                        {
                            $push: {
                                linkedGroup: [ownerGroup._id]
                            }
                        }
                    )

                    let suborder = await subscriptionOrder.create({
                        //  name: groupdata.name,
                        groupId: ownerGroup._id,
                        ownerId: groupdata.ownerId,
                        Plan: groupdata.Plan,
                        SubsType: groupdata.SubsType,
                        payment_mode: groupdata.payment_mode,
                        amount: groupdata.amount,
                        startDate: groupdata.startDate,
                        EndDate: groupdata.EndDate,
                        payment_status: groupdata.payment_status,
                        order_status: groupdata.order_status
                    })

                    let ownerNotificationSetting =
                        await notificationSettings.create({
                            userId: groupdata.ownerId,
                            groupId: ownerGroup._id
                        })

                    return await UserModel.generateAccessTokenUpdatedSignup(
                        updated_user
                    )
                } else {
                    return await UserModel.generateAccessTokenUpdatedSignup(
                        updated_user
                    )
                }
            } else {
                let updateSignupMethod = await User.updateOne(
                    { _id: ifAlreadyUser._id },
                    { $set: { emailVerified: true, "signup.hasApple": true } }
                )
                return await UserModel.generateAccessTokenUpdatedSignup(
                    ifAlreadyUser
                )
            }
        } else {
            console.log("User does not Exist")
            let givenName, familyName
            if (data?.givenName) {
                givenName = data.givenName
            }
            if (data?.familyName) {
                familyName = data.familyName
            }

            let newUserObj = {
                email: _.trim(_.toLower(data.email)),
                //  mobileNo: data.mobileNo,
                cognitousername: uniqueID,
                password: null,
                emailVerified: true,
                //  personalDetails:{name: data.personalDetails.name,middlename:data.personalDetails.middlename,lastname:data.personalDetails.lastname, livingStatus: "yes"},
                personalDetails: {
                    name: givenName,
                    lastname: familyName,
                    livingStatus: "yes"
                },
                deviceInfo: {
                    model: null,
                    platForm: null,
                    osVersion: null,
                    operatingSystem: null
                },
                signup: {
                    hasEmail: false,
                    hasMobile: false,
                    hasGoogle: false,
                    hasApple: true,
                    hasFacebook: false
                }
                //  countryCode: data.countryCode
            }
            //console.log("newUserObj",newUserObj)
            let userObj = new User(newUserObj)
            saveUser = await userObj.save()
            let groupdata = {
                ownerId: saveUser._id,
                InvitedMembers: [saveUser._id],
                storageUsed: {
                    Storage: "100",
                    member: "50"
                },
                //     groupName: saveUser.personalDetails.lastname + " Family",
                //     name: saveUser.personalDetails.name,
                Plan: "Free",
                SubsType: "monthly",
                payment_mode: "NA",
                amount: "999",
                startDate: Date.now(),
                EndDate: null,
                payment_status: "NA",
                order_status: "Done"
            }

            let ownerGroup = await group.create(groupdata)

            let updateGroupId = await User.updateOne(
                { _id: groupdata.ownerId },

                {
                    $push: {
                        linkedGroup: [ownerGroup._id]
                    }
                }
            )

            let suborder = await subscriptionOrder.create({
                //  name: groupdata.name,
                groupId: ownerGroup._id,
                ownerId: groupdata.ownerId,
                Plan: groupdata.Plan,
                SubsType: groupdata.SubsType,
                payment_mode: groupdata.payment_mode,
                amount: groupdata.amount,
                startDate: groupdata.startDate,
                EndDate: groupdata.EndDate,
                payment_status: groupdata.payment_status,
                order_status: groupdata.order_status
            })

            let ownerNotificationSetting = await notificationSettings.create({
                userId: groupdata.ownerId,
                groupId: ownerGroup._id
            })

            return await UserModel.generateAccessTokenUpdatedSignup(saveUser)
        }

        // return
    },

    async generateUniqueID() {
        const timestamp = Date.now()
        const randomPart = randomize("0", 6)
        const uniqueID = `${timestamp}${randomPart}`
        return uniqueID
    },
    //sign up with mobile
    async signup_mobile(data) {
        let saveUser
        let suborder

        const ifAlreadyUser = await User.findOne({ mobileNo: data.mobileNo })
        const uniqueID = await UserModel.generateUniqueID()

        if (
            ifAlreadyUser &&
            ifAlreadyUser._id &&
            ifAlreadyUser.mobileVerified &&
            !_.isEmpty(ifAlreadyUser.cognitousername)
        ) {
            return {
                data: "User Already Exist",
                name: "userVerified",
                value: false
            }
        }

        // add this validation while verifying email.
        // if( ifAlreadyUser && ifAlreadyUser._id && !_.isEmpty(ifAlreadyUser.cognitousername) && !ifAlreadyUser.emailVerified){
        //     return { data: "User not verified, Please Verify your Email",name:"userEmailNotVerified", value: false }
        // }
        let newUserObj = {
            //  email: data.email,
            mobileNo: data.mobileNo,
            cognitousername: uniqueID,
            // password: sha256(data.password),
            //  personalDetails:{name: data.personalDetails.name,middlename:data.personalDetails.middlename,lastname:data.personalDetails.lastname, livingStatus: "yes"},
            personalDetails: { livingStatus: "yes" },
            deviceInfo: {
                model: data.deviceInfo.model,
                platForm: data.deviceInfo.platForm,
                osVersion: data.deviceInfo.osVersion,
                operatingSystem: data.deviceInfo.operatingSystem
            },
            countryCode: data.countryCode
        }

        if (_.isEmpty(ifAlreadyUser) || !ifAlreadyUser._id) {
            let userObj = new User(newUserObj)
            saveUser = await userObj.save()

            // create group If for each signed up user

            let findUserGroup = await group.findOne({ ownerId: saveUser._id })
            if (_.isNull(findUserGroup)) {
                console.log("saveUser :", saveUser)
                let groupdata = {
                    ownerId: saveUser._id,
                    InvitedMembers: [saveUser._id],
                    storageUsed: {
                        Storage: "100",
                        member: "50"
                    },
                    //    groupName: saveUser.personalDetails.lastname + " Family",
                    //    name: saveUser.personalDetails.name,
                    Plan: "Free",
                    SubsType: "monthly",
                    payment_mode: "NA",
                    amount: "999",
                    startDate: Date.now(),
                    EndDate: null,
                    payment_status: "NA",
                    order_status: "Done"
                }

                let ownerGroup = await group.create(groupdata)

                let updateGroupId = await User.updateOne(
                    { _id: groupdata.ownerId },

                    {
                        $push: {
                            linkedGroup: [ownerGroup._id]
                        }
                    }
                )

                suborder = await subscriptionOrder.create({
                    //  name: groupdata.name,
                    groupId: ownerGroup._id,
                    ownerId: groupdata.ownerId,
                    Plan: groupdata.Plan,
                    SubsType: groupdata.SubsType,
                    payment_mode: groupdata.payment_mode,
                    amount: groupdata.amount,
                    startDate: groupdata.startDate,
                    EndDate: groupdata.EndDate,
                    payment_status: groupdata.payment_status,
                    order_status: groupdata.order_status
                })
                let ownerNotificationSetting =
                    await notificationSettings.create({
                        userId: groupdata.ownerId,
                        groupId: ownerGroup._id
                    })

                //  res.status(201).send(suborder)
            } else {
                suborder = {
                    message:
                        "Good news this user id " +
                        groupdata.ownerId +
                        " already have group"
                }
                //     res.status(200).send('Good news this user id '+  groupdata.ownerId+' already have group' )
            }
            // Group Id creation complete
            if (saveUser && !saveUser._id) {
                return {
                    data: "Something Went Wrong While Saving User",
                    value: false
                }
            }
        }
        // else if ((!_.isEmpty(ifAlreadyUser) || ifAlreadyUser._id)||(sameEmail && sameMobileNo )||(sameEmail && sameMobileNo && ifAlreadyUser && ifAlreadyUser._id && !_.isEmpty(ifAlreadyUser.cognitousername) && !ifAlreadyUser.mobileVerified && !ifAlreadyUser.emailVerified) ){
        else if (
            !_.isEmpty(ifAlreadyUser) &&
            ifAlreadyUser._id &&
            !ifAlreadyUser.mobileVerified
        ) {
            // const updateUser = await User.updateOne(
            //     { _id: ifAlreadyUser._id },
            //     {
            //         mobileNo: data.mobileNo,
            //         deviceInfo: {
            //             model: data.deviceInfo.model,
            //             platForm: data.deviceInfo.platForm,
            //             osVersion: data.deviceInfo.osVersion,
            //             operatingSystem: data.deviceInfo.operatingSystem
            //           }

            //     }
            // )
            // if (updateUser && !updateUser.nModified) {
            //     return { data: "Failed to Save User", value: false }
            // }
            // saveUser = ifAlreadyUser
            return {
                data: "User not verified, Please Verify your Mobile",
                name: "userMobileNotVerified",
                value: false
            }
        }

        const mailerOutput = await UserModel.sendMobileOtp({
            mobileNo: data.mobileNo
        })

        if (mailerOutput && !mailerOutput.value) {
            return { data: "Failed to Signup", value: false }
        }

        let ObjToReturn = {
            //  email: data.email,
            //   name: data.name,
            mobileNo: data.mobileNo,
            cognitousername: uniqueID,
            suborder: suborder,
            _id: saveUser._id
        }
        return { data: ObjToReturn, value: true }
    },

    async signup_v4(data) {
        let saveUser
        let suborder
        let sameEmail
        let sameMobileNo
        data.email = _.trim(_.toLower(data.email))
        const ifAlreadyUser = await User.findOne({
            $or: [{ email: data.email }, { mobileNo: data.mobileNo }]
        })
        if (ifAlreadyUser) {
            if (data.mobileNo === ifAlreadyUser.mobileNo) {
                sameMobileNo = true
            } else {
                sameMobileNo = false
            }
            if (data.email === ifAlreadyUser.email) {
                sameEmail = true
            } else {
                sameEmail = false
            }
        }

        if (
            ifAlreadyUser &&
            ifAlreadyUser._id &&
            ifAlreadyUser.emailVerified &&
            ifAlreadyUser.mobileVerified &&
            !_.isEmpty(ifAlreadyUser.cognitousername)
        ) {
            return {
                data: "User Already Exist",
                name: "userVerified",
                value: false
            }
        }
        if (
            ifAlreadyUser &&
            ifAlreadyUser._id &&
            !_.isEmpty(ifAlreadyUser.cognitousername) &&
            ifAlreadyUser.mobileVerified &&
            !ifAlreadyUser.emailVerified &&
            !sameEmail &&
            sameMobileNo
        ) {
            return {
                data: "Data mismatched",
                name: "DataMismatched",
                value: false
            }
        }
        if (
            ifAlreadyUser &&
            ifAlreadyUser._id &&
            !_.isEmpty(ifAlreadyUser.cognitousername) &&
            ifAlreadyUser.mobileVerified &&
            !ifAlreadyUser.emailVerified &&
            sameEmail &&
            !sameMobileNo
        ) {
            return {
                data: "Data mismatched",
                name: "DataMismatched",
                value: false
            }
        }
        // if(ifAlreadyUser && ifAlreadyUser._id && !_.isEmpty(ifAlreadyUser.cognitousername) && ifAlreadyUser.mobileVerified && !ifAlreadyUser.emailVerified  ){
        //     return { data: "User not verified, Please Verify your Email",name:"userEmailNotVerified", value: false }
        // }
        if (
            ifAlreadyUser &&
            ifAlreadyUser._id &&
            !_.isEmpty(ifAlreadyUser.cognitousername) &&
            !ifAlreadyUser.mobileVerified &&
            ifAlreadyUser.emailVerified
        ) {
            return {
                data: "User not verified, Please Verify your Mobile",
                name: "userMobileNotVerified",
                value: false
            }
        }
        // if(ifAlreadyUser && ifAlreadyUser._id && !_.isEmpty(ifAlreadyUser.cognitousername) && !ifAlreadyUser.mobileVerified && !ifAlreadyUser.emailVerified){
        //     return { data: "User not verified, Please Verify your Email & Mobile",name:"userEmailMobileNotVerified", value: false }
        // }
        let newUserObj = {
            email: data.email,
            mobileNo: data.mobileNo,
            cognitousername: data.cognitousername,
            password: sha256(data.password),
            personalDetails: {
                name: data.personalDetails.name,
                middlename: data.personalDetails.middlename,
                lastname: data.personalDetails.lastname,
                livingStatus: "yes"
            },
            deviceInfo: {
                model: data.deviceInfo.model,
                platForm: data.deviceInfo.platForm,
                osVersion: data.deviceInfo.osVersion,
                operatingSystem: data.deviceInfo.operatingSystem
            },
            countryCode: data.countryCode
        }

        // if (_.isEmpty(ifAlreadyUser) || !ifAlreadyUser._id || _.isEmpty(ifAlreadyUser.cognitousername) ) {
        if (_.isEmpty(ifAlreadyUser) || !ifAlreadyUser._id) {
            let userObj = new User(newUserObj)
            saveUser = await userObj.save()

            // create group If for each signed up user

            let findUserGroup = await group.findOne({ ownerId: saveUser._id })
            if (_.isNull(findUserGroup)) {
                console.log("saveUser :", saveUser)
                let groupdata = {
                    ownerId: saveUser._id,
                    InvitedMembers: [saveUser._id],
                    storageUsed: {
                        Storage: "100",
                        member: "50"
                    },
                    groupName: saveUser.personalDetails.lastname + " Family",
                    name: saveUser.personalDetails.name,
                    Plan: "Free",
                    SubsType: "monthly",
                    payment_mode: "NA",
                    amount: "999",
                    startDate: Date.now(),
                    EndDate: null,
                    payment_status: "NA",
                    order_status: "Done"
                }

                let ownerGroup = await group.create(groupdata)

                let updateGroupId = await User.updateOne(
                    { _id: groupdata.ownerId },

                    {
                        $push: {
                            linkedGroup: [ownerGroup._id]
                        }
                    }
                )

                suborder = await subscriptionOrder.create({
                    name: groupdata.name,
                    groupId: ownerGroup._id,
                    ownerId: groupdata.ownerId,
                    Plan: groupdata.Plan,
                    SubsType: groupdata.SubsType,
                    payment_mode: groupdata.payment_mode,
                    amount: groupdata.amount,
                    startDate: groupdata.startDate,
                    EndDate: groupdata.EndDate,
                    payment_status: groupdata.payment_status,
                    order_status: groupdata.order_status
                })
                let ownerNotificationSetting =
                    await notificationSettings.create({
                        userId: groupdata.ownerId,
                        groupId: ownerGroup._id
                    })

                //  res.status(201).send(suborder)
            } else {
                suborder = {
                    message:
                        "Good news this user id " +
                        groupdata.ownerId +
                        " already have group"
                }
                //     res.status(200).send('Good news this user id '+  groupdata.ownerId+' already have group' )
            }
            // Group Id creation complete
            if (saveUser && !saveUser._id) {
                return {
                    data: "Something Went Wrong While Saving User",
                    value: false
                }
            }
        }
        // else if ((!_.isEmpty(ifAlreadyUser) || ifAlreadyUser._id)||(sameEmail && sameMobileNo )||(sameEmail && sameMobileNo && ifAlreadyUser && ifAlreadyUser._id && !_.isEmpty(ifAlreadyUser.cognitousername) && !ifAlreadyUser.mobileVerified && !ifAlreadyUser.emailVerified) ){
        else if (
            !_.isEmpty(ifAlreadyUser) ||
            ifAlreadyUser._id ||
            (sameEmail && sameMobileNo) ||
            (sameEmail &&
                sameMobileNo &&
                ifAlreadyUser &&
                ifAlreadyUser._id &&
                !ifAlreadyUser.mobileVerified &&
                !ifAlreadyUser.emailVerified)
        ) {
            const updateUser = await User.updateOne(
                { _id: ifAlreadyUser._id },
                newUserObj
            )
            if (updateUser && !updateUser.nModified) {
                return { data: "Failed to Save User", value: false }
            }
            saveUser = ifAlreadyUser
        }

        const mailerOutput = await UserModel.sendMobileOtpv1({
            mobileNo: data.mobileNo
        })
        if (mailerOutput && !mailerOutput.value) {
            return { data: "Failed to Signup", value: false }
        }

        let ObjToReturn = {
            email: data.email,
            name: data.name,
            mobileNo: data.mobileNo,
            cognitousername: data.cognitousername,
            suborder: suborder
        }
        return { data: ObjToReturn, value: true }
    },

    async signup(data) {
        let saveUser
        const ifAlreadyUser = await User.findOne({ email: data.email })

        //if user is already verified
        if (ifAlreadyUser && ifAlreadyUser._id && ifAlreadyUser.emailVerified) {
            return { data: "User Already Exist", value: false }
        } 


        //checking is otp is expired or not
        let updateOtp = null
        let isOtpExpired = true // Default should be true
        if(ifAlreadyUser?.otpExpiry){
            if(moment(ifAlreadyUser?.otpExpiry).isAfter(moment())){
                updateOtp = ifAlreadyUser?.otpExpiry
                isOtpExpired = false
            }
            else{
                isOtpExpired = true
                updateOtp = moment().add(3, "minutes")
            }
        }


        let newUserObj = {
            email: data.email,
            mobileNo: data.mobileNo,
            cognitousername: data.cognitousername,
            password: sha256(data.password),
            otpExpiry: updateOtp ? updateOtp : moment().add(3, "minutes"), 
            // personalDetails: {
            //     name: data.personalDetails.name,
            //     middlename: data.personalDetails.middlename,
            //     lastname: data.personalDetails.lastname,
            //     livingStatus: "yes"
            // },
            deviceInfo: {
                model: data.deviceInfo.model,
                platForm: data.deviceInfo.platForm,
                osVersion: data.deviceInfo.osVersion,
                operatingSystem: data.deviceInfo.operatingSystem
            }
        }

        //if user is not present
        if (_.isEmpty(ifAlreadyUser) || !ifAlreadyUser._id) {
            let userObj = new User(newUserObj)
            saveUser = await userObj.save()
            if (saveUser && !saveUser._id) {
                return {
                    data: "Something Went Wrong While Saving User",
                    value: false
                }
            }

            let findUserGroup = await group.findOne({ ownerId: saveUser._id })
            if (_.isNull(findUserGroup)) {
                console.log("saveUser :", saveUser)
                let groupdata = {
                    ownerId: saveUser._id,
                    InvitedMembers: [saveUser._id],
                    storageUsed: {
                        Storage: "100",
                        member: "50"
                    },
                    groupName: saveUser.personalDetails.lastname + " Family",
                    name: saveUser.personalDetails.name,
                    Plan: "Free",
                    SubsType: "monthly",
                    payment_mode: "NA",
                    amount: "999",
                    startDate: Date.now(),
                    EndDate: null,
                    payment_status: "NA",
                    order_status: "Done"
                }

                let ownerGroup = await group.create(groupdata)

                let updateGroupId = await User.updateOne(
                    { _id: groupdata.ownerId },

                    {
                        $push: {
                            linkedGroup: [ownerGroup._id]
                        }
                    }
                )

                let suborder = await subscriptionOrder.create({
                    name: groupdata.name,
                    groupId: ownerGroup._id,
                    ownerId: groupdata.ownerId,
                    Plan: groupdata.Plan,
                    SubsType: groupdata.SubsType,
                    payment_mode: groupdata.payment_mode,
                    amount: groupdata.amount,
                    startDate: groupdata.startDate,
                    EndDate: groupdata.EndDate,
                    payment_status: groupdata.payment_status,
                    order_status: groupdata.order_status
                })
                let ownerNotificationSetting =
                    await notificationSettings.create({
                        userId: groupdata.ownerId,
                        groupId: ownerGroup._id
                    })

                //  res.status(201).send(suborder)
            } else {
                suborder = {
                    message:
                        "Good news this user id " +
                        groupdata.ownerId +
                        " already have group"
                }
                //     res.status(200).send('Good news this user id '+  groupdata.ownerId+' already have group' )
            }
            // Group Id creation complete
            if (saveUser && !saveUser._id) {
                return {
                    data: "Something Went Wrong While Saving User",
                    value: false
                }
            }
        } 
        
        //is user is there and has id
        else {
            const updateUser = await User.updateOne(
                { _id: ifAlreadyUser._id },
                newUserObj
            )
            if (updateUser && !updateUser.nModified) {
                return { data: "Failed to Save User", value: false }
            }
            saveUser = ifAlreadyUser
        }

        let mailerOutput = null
        //if otp is expired then only send mail to user
        if(isOtpExpired){
             mailerOutput = await UserModel.sendVerificationCodeOnEmail({
                email: data.email
            })
        }


        if (mailerOutput && !mailerOutput?.value) {
            return { data: "Failed to Signup", value: false }
        }

        
        let ObjToReturn = {
            email: data.email,
            name: data.name,
            mobileNo: data.mobileNo,
            cognitousername: data.cognitousername,
            token: updateOtp
                ? CryptoJS.AES.encrypt(
                    updateOtp.toString(),
                      "ImeusWe104$#%98^"
                  ).toString()
                : CryptoJS.AES.encrypt(
                    newUserObj?.otpExpiry?.toString(),
                      "ImeusWe104$#%98^"
                  ).toString()
        }
        return { data: ObjToReturn, value: true }
    },

    // Find One User with Appropriate Username & Password -> only get Name, Email, Access Level .lean() -> userObj
    // userObj.accessToken = Generate Access Token
    // Add user.accesstoken with AccessToken
    // return userdetails with access token
    // Priority

    async login(data) {
        data.email = _.trim(_.toLower(data.email))

        const checkUser = await User.findOne(
            { email: data.email },
            {
                name: 1,
                email: 1,
                accessLevel: 1,
                password: 1,
                emailVerified: 1,
                mobileVerified: 1,
                personalDetails: 1,
                cognitousername: 1,
                mobileNo: 1,
                countryCode: 1
            }
        )
        console.log("inside checkUser", checkUser)
        let user
        if (checkUser) {
            user = {
                name: checkUser.personalDetails.name,
                lastname: checkUser.personalDetails.lastname,
                countryCode: checkUser.countryCode,
                mobileNo: checkUser.mobileNo,
                cognitousername: checkUser.cognitousername,
                email: checkUser.email
            }
        }

        if (_.isEmpty(checkUser)) {
            return {
                data: "Incorrect Username or Password.",
                name: "incorrectCredentials",
                value: false
            }
        }
        if (
            _.isEmpty(checkUser.password) &&
            !checkUser.emailVerified &&
            !checkUser.mobileVerified
        ) {
            return {
                data: "User is not Registered",
                name: "userNotRegistered",
                value: false
            }
        }
        if (
            _.isEmpty(checkUser.password) &&
            checkUser.emailVerified &&
            checkUser.mobileVerified
        ) {
            return { data: "pass not defined", value: false }
        }
        if (
            !_.isEmpty(checkUser.password) &&
            !checkUser.emailVerified &&
            !checkUser.mobileVerified
        ) {
            return {
                data: "User not verified, Please Verify your Email & Mobile",
                name: "userEmailMobileNotVerified",
                user: user,
                value: false
            }
        }
        let encryptedPassword = sha256(data.password)
        if (
            checkUser &&
            checkUser.password &&
            checkUser.password != encryptedPassword &&
            !checkUser.emailVerified &&
            !checkUser.mobileVerified
        ) {
            return {
                data: "Incorrect Username or Password",
                name: "incorrectCredentials",
                value: false
            }
        }
        if (
            checkUser &&
            checkUser.password &&
            checkUser.password != encryptedPassword &&
            checkUser.emailVerified &&
            checkUser.mobileVerified
        ) {
            return {
                data: "Incorrect Username or Password",
                name: "incorrectCredentials",
                value: false
            }
        }
        if (
            !_.isEmpty(checkUser.password) &&
            checkUser &&
            !checkUser.emailVerified &&
            checkUser.mobileVerified
        ) {
            return {
                data: "User not verified, Please Verify your Email",
                name: "userEmailNotVerified",
                user: user,
                value: false
            }
        }
        if (
            !_.isEmpty(checkUser.password) &&
            checkUser &&
            !checkUser.mobileVerified &&
            checkUser.emailVerified
        ) {
            return {
                data: "User not verified, Please Verify your Mobile",
                name: "userMobileNotVerified",
                user: user,
                value: false
            }
        }
        if (
            checkUser &&
            checkUser.password &&
            checkUser.password === encryptedPassword &&
            checkUser.emailVerified &&
            checkUser.mobileVerified
        ) {
            return UserModel.generateAccessToken(data)
        }

        //  return UserModel.generateAccessToken(data)
    },

    async login_v1(data) {
        const myApp = new Realm.App({ id: "imeuswe-dev-smgsy" })
        const creds = Realm.Credentials.emailPassword(data.email, data.password)
        const user = await myApp.logIn(creds)
        console.log("user :", user.accessToken)
        console.log("success")

        return { data: { accessToken: user.accessToken } }
    },
    //social relm api

    //updated sign up login with email

    async login_v2(data) {
        data.email = _.trim(_.toLower(data.email))

        const checkUser = await User.findOne(
            { email: data.email },
            {
                name: 1,
                email: 1,
                accessLevel: 1,
                password: 1,
                emailVerified: 1,
                mobileVerified: 1,
                personalDetails: 1,
                cognitousername: 1,
                mobileNo: 1,
                countryCode: 1
            }
        )
        let user
        if (checkUser) {
            user = {
                name: checkUser.personalDetails.name,
                lastname: checkUser.personalDetails.lastname,
                gender: checkUser.personalDetails.gender,
                countryCode: checkUser.countryCode,
                mobileNo: checkUser.mobileNo,
                cognitousername: checkUser.cognitousername,
                email: checkUser.email
            }
        }

        if (_.isEmpty(checkUser)) {
            return {
                data: "User is not Registered",
                name: "userNotRegistered",
                value: false
            }
        }
        if (_.isEmpty(checkUser.password) && !checkUser.emailVerified) {
            return {
                data: "User is not Registered",
                name: "userNotRegistered",
                value: false
            }
        }
        // if (
        //     _.isEmpty(checkUser.password) &&
        //     !checkUser.emailVerified &&
        //     !checkUser.mobileVerified
        // ) {
        //     return {
        //         data: "User is not Registered",
        //         name: "userNotRegistered",
        //         value: false
        //     }
        // }
        // if (
        //     _.isEmpty(checkUser.password) &&
        //     checkUser.emailVerified &&
        //     checkUser.mobileVerified
        // ) {
        //     return { data: "pass not defined", value: false }
        // }
        // if (
        //     !_.isEmpty(checkUser.password) &&
        //     !checkUser.emailVerified &&
        //     !checkUser.mobileVerified
        // ) {
        //     return {
        //         data: "User not verified, Please Verify your Email & Mobile",
        //         name: "userEmailMobileNotVerified",
        //         user: user,
        //         value: false
        //     }
        // }
        if (!_.isEmpty(checkUser.password) && !checkUser.emailVerified) {
            return {
                data: "User not verified, Please Verify your Email",
                name: "userEmailNotVerified",
                user: user,
                value: false
            }
        }
        let encryptedPassword = sha256(data.password)
        // if (
        //     checkUser &&
        //     checkUser.password &&
        //     checkUser.password != encryptedPassword &&
        //     !checkUser.emailVerified &&
        //     !checkUser.mobileVerified
        // ) {
        //     return {
        //         data: "Incorrect Username or Password",
        //         name: "incorrectCredentials",
        //         value: false
        //     }
        // }
        if (_.isEmpty(checkUser.password) && checkUser.emailVerified) {
            return { data: "pass not defined", value: false }
        }
        if (
            checkUser &&
            checkUser.password &&
            checkUser.password != encryptedPassword &&
            checkUser.emailVerified
            // &&
            //checkUser.mobileVerified
        ) {
            return {
                data: "Incorrect Username or Password",
                name: "incorrectCredentials",
                value: false
            }
        }
        // if (
        //     !_.isEmpty(checkUser.password) &&
        //     checkUser &&
        //     !checkUser.emailVerified &&
        //     checkUser.mobileVerified
        // ) {
        //     return {
        //         data: "User not verified, Please Verify your Email",
        //         name: "userEmailNotVerified",
        //         user: user,
        //         value: false
        //     }
        // }
        // if (
        //     !_.isEmpty(checkUser.password) &&
        //     checkUser &&
        //     !checkUser.mobileVerified &&
        //     checkUser.emailVerified
        // ) {
        //     return {
        //         data: "User not verified, Please Verify your Mobile",
        //         name: "userMobileNotVerified",
        //         user: user,
        //         value: false
        //     }
        // }
        if (
            checkUser &&
            checkUser.password &&
            checkUser.password === encryptedPassword &&
            checkUser.emailVerified
        ) {
            let updateLoginMethod = User.updateOne(
                { _id: checkUser._id },
                { $set: { "signup.hasEmail": true } }
            )
            const [methodUpdate, chkuser] = await Promise.all([
                updateLoginMethod,
                checkUser
            ])
            return UserModel.generateAccessTokenUpdatedSignup(chkuser)
        }

        //  return UserModel.generateAccessToken(data)
    },

    async loginAdmin_v1(data) {
        data.email = _.trim(_.toLower(data.email))
        let encryptedPassword = sha256(data.password)
        let cust_email = data.cust_email
        const uniqueID = await UserModel.generateUniqueID()
        // // Create a new admin user
        // console.log("dataAdmin", data)
        // const newAdminUser = new AdminUser({
        //     username: uniqueID,
        //     password: sha256(data.password),
        //     email: data.email,
        //     role: 'admin', // You can set this to 'superadmin' if needed
        // });

        // // Save the new admin user to the database
        // newAdminUser.save()
        //     .then(savedUser => {
        //     console.log('New admin user created:', savedUser);
        //     })
        //     .catch(error => {
        //     console.error('Error creating admin user:', error);
        //     });
        const checkAdminUser = await AdminUser.findOne({ email: data.email })
        if (checkAdminUser) {
            if (checkAdminUser.password === encryptedPassword) {
                const checkCustomerUser = await User.findOne({
                    email: data.cust_email
                })
                if (checkCustomerUser) {
                    //console.log("checkCustomerUser",checkCustomerUser)
                    return await UserModel.generateAccessTokenUpdatedSignup(
                        checkCustomerUser
                    )
                } else {
                    throw "Customer email Id not found"
                }
            } else {
                throw "Email-Id and password not matched"
            }
        } else {
            throw "Admin email Id not found"
        }
    },

    async social(data) {
        const myApp = new Realm.App({ id: "imeuswe-dev-smgsy" })
        let saveUser

        // Configure and instantiate Google OAuth2.0 client
        const oauthConfig = {
            client_id:
                "582372175818-gffvqsehtqnlihs6r8m8m63kucvb0g0a.apps.googleusercontent.com",
            project_id: "SocialSignIn-Realm",
            auth_uri: "https://accounts.google.com/o/oauth2/auth",
            token_uri: "https://oauth2.googleapis.com/token",
            auth_provider_x509_cert_url:
                "https://www.googleapis.com/oauth2/v1/certs",
            client_secret: "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", // may not get for android/ios
            redirect_uris: [`imeuswe://home`],
            JWTsecret: "secret",
            scopes: [
                "https://www.googleapis.com/auth/userinfo.email",
                "https://www.googleapis.com/auth/userinfo.profile",
                "openid"
                // any other scopes you might require. View all here - https://developers.google.com/identity/protocols/oauth2/scopes
            ]
        }
        const OAuth2 = google.auth.OAuth2
        const oauth2Client = new OAuth2(
            oauthConfig.client_id,
            oauthConfig.client_secret,
            oauthConfig.redirect_uris[0]
        )
        console.log("oauth2Client :", oauth2Client)

        // generate OAuth 2.0 log in link
        const loginLink = oauth2Client.generateAuthUrl({
            access_type: "offline", // Indicates that we need to be able to access data continuously without the user constantly giving us consent
            scope: oauthConfig.scopes
        })
        console.log("loginLink :", loginLink)
        // Get Google token and use it to sign into Realm
        //separte api call  authCodeFromQueryString= auth code from frontend. willl get realm token here
        // oauth2Client.getToken(authCodeFromQueryString, async function (
        //     error,
        //     token
        // ) {
        //     if (error) return errorHandler(error);
        //     try {
        //     const credential = Realm.Credentials.google({
        //         idToken: token.id_token,
        //     });
        //     const user = await realmApp.logIn(credential);
        //     console.log("signed in as Realm user", user.id);
        //     } catch (error) {
        //     errorHandler(error);
        //     }
        // });

        //    console.log("oauth2Client :",oauth2Client)

        return { data: { loginLink: loginLink }, value: true }
    },

    // Generate 6 digit code
    // Send 6 Digit Code via Email
    // Save in User.emailVerification in Database
    async sendVerificationCodeOnEmail(data) {
        data.email = _.trim(_.toLower(data.email))
        const emailOutput = await UserModel.sendSesEmail({ email: data.email })
        if (emailOutput && emailOutput.value === true) {
            data.updateObj = {
                emailVerification: emailOutput.data.otp
            }
            return await UserModel.updateUser(data)
        } else {
            return { data: "Failed to Send Email", value: false }
        }
    },

    // Email  to be received from user
    // We will send Emailer to User with the 6 digit Code and store it in forgotPasswordVerification of the same user
    async forgotPassword(data) {
        data.email = _.trim(_.toLower(data.email))
        console.log(" data.email", data.email)
        const userIfAvailable = await User.findOne({ email: data.email })
        if (_.isEmpty(userIfAvailable)) {
            return { data: "No Such User Exists", value: false }
        }
        const emailOutput = await UserModel.sendSesEmail({ email: data.email })
        if (emailOutput && emailOutput.value === true) {
            data.updateObj = {
                forgotPasswordVerification: emailOutput.data.otp
            }
            return await UserModel.updateUser(data)
        } else {
            return { data: "Failed to Send Email", value: false }
        }
    },

    // we will get forgotPasswordVerification and email
    // find in database of particular email and forgotPasswordVerification
    // if user found will provide its access token
    // if user not found will give error "Verification Code Incorrect"
    async forgotPasswordVerification(data) {
        data.email = _.trim(_.toLower(data.email))
        const userAvailable = await User.findOne({
            email: data.email,
            forgotPasswordVerification: data.verificationCode
        })
        if (!userAvailable || !userAvailable._id) {
            return { data: "Verification Code Incorrect", value: false }
        }
        const accessTokenData = await UserModel.generateAccessToken(data)
        if (accessTokenData && accessTokenData.value) {
            return { data: accessTokenData.data.accessToken, value: true }
            //  return { data: "Password verified", value: true }
        }
        return { data: "Failed to Generate AccessToken", value: false }
        // return { data: "Failed to verify password", value: false }
    },

    // get user access token
    // decode access token
    // Check whether users with same id, and email is there in the database .
    // change the password of the user if user found
    // if user not found -> give error
    async resetPassword(data) {
        const sub = jwt.verify(data.accessToken, jwtKey)
        console.log("inside sub:::::::::::::::", sub)
        //  if (_.isEmpty(sub) || !sub._id || !sub.email || !sub.cognitousername) {
        if (_.isEmpty(sub) || !sub._id || !sub.cognitousername) {
            return { data: "Incorrect AccessToken", value: false }
        }
        const userAvailable = await User.findOne({
            _id: sub._id
            //    email: data.email
        })
        if (_.isEmpty(userAvailable) || !userAvailable._id) {
            return { data: "No Such User Exists", value: false }
        }

        if (userAvailable.password === sha256(data.password)) {
            return { data: "Password Changed Successfully", value: true }
        }
        const updateUser = await User.updateOne(
            { _id: userAvailable._id },
            {
                password: sha256(data.password)
            }
        )
        if (updateUser && updateUser.nModified) {
            return { data: "Password Changed Successfully", value: true }
        }
        return { data: "Failed to Change Password", value: false }
    },

    // updated sign up flow vrify  email
    async verifyEmail_v1(data) {
        data.email = _.trim(_.toLower(data.email))
        const checkIfUserAvailable = await User.findOne({
            email: data.email
        })
        console.log(checkIfUserAvailable)
        if (_.isEmpty(checkIfUserAvailable)) {
            return { data: "No Such User Exists", value: false }
        }
        if (checkIfUserAvailable.emailVerification !== data.verificationCode) {
            return { data: "Verification link has expired", value: false }
        }

        const accessTokenOutput =
            await UserModel.generateAccessTokenUpdatedSignup(
                checkIfUserAvailable
            )
        if (accessTokenOutput && !accessTokenOutput.value) {
            return { data: "Failed to Generate AccessToken", value: false }
        }

        const userOutput = await User.updateOne(
            { email: data.email },
            { $set: { "signup.hasEmail": true, emailVerified: true } }
        )

        if (userOutput && !userOutput.nModified) {
            return { data: "Failed to Update User", value: false }
        }
        return { data: accessTokenOutput.data, value: true }
    },
    // Priority
    // you will get email verification code and email
    // user.findone with email verification code and email -> if user found
    // update the user emailverification status to true
    // send success
    // if no user is foudn
    // send error // incorrect verification code
    async verifyEmail(data) {
        data.email = _.trim(_.toLower(data.email))
        const checkIfUserAvailable = await User.findOne({
            email: data.email
        })
        if (_.isEmpty(checkIfUserAvailable)) {
            return { data: "No Such User Exists", value: false }
        }
        if (checkIfUserAvailable.emailVerification !== data.verificationCode) {
            return { data: "Incorrect OTP", value: false }
        }

        const accessTokenOutput = await UserModel.generateAccessToken(data)
        if (accessTokenOutput && !accessTokenOutput.value) {
            return { data: "Failed to Generate AccessToken", value: false }
        }
        let objToUpdate = {
            emailVerified: true
        }
        const userOutput = await User.updateOne(
            { email: data.email },
            objToUpdate
        )
        if (userOutput && !userOutput.nModified) {
            return { data: "Failed to Update User", value: false }
        }
        return { data: accessTokenOutput.data, value: true }
    },

    async verifyUpdatedEmail(data) {
        //new email,id
        data.email = _.trim(_.toLower(data.email))
        const checkIfUserAvailable = await User.findOne({
            _id: data._id
        })
        if (_.isEmpty(checkIfUserAvailable)) {
            return { data: "No Such User Exists", value: false }
        }
        if (checkIfUserAvailable.emailVerification !== data.verificationCode) {
            return { data: "Verification link has expired", value: false }
        }

        const accessTokenOutput =
            await UserModel.generateAccessTokenVerifyUpdatedEmail(data)
        console.log("*****", accessTokenOutput)
        if (accessTokenOutput && !accessTokenOutput.value) {
            return { data: "Failed to Generate AccessToken", value: false }
        }
        let objToUpdate = {
            emailVerified: true,
            email: data.email,
            password: data.password
        }
        const userOutput = await User.updateOne({ _id: data._id }, objToUpdate)
        if (userOutput && !userOutput.nModified) {
            return { data: "Failed to Update User", value: false }
        }
        return { data: accessTokenOutput.data, value: true }
    },

    async updatePasswordForVerifiedUser(data) {
        const checkIfUserAvailable = await User.findOne({
            _id: data._id
        })
        if (_.isEmpty(checkIfUserAvailable)) {
            return { data: "No Such User Exists", value: false }
        }
        if (checkIfUserAvailable.emailVerified === false) {
            return { data: "Email is not verified", value: false }
        }

        let objToUpdate = {
            password: sha256(data.password)
        }
        const userOutput = await User.updateOne({ _id: data._id }, objToUpdate)
        if (userOutput && !userOutput.nModified) {
            return { data: "Failed to Update Password", value: false }
        }
        return { data: "Password Updated Successfully", value: true }
    },

    async verifyMobile(data) {
        const checkIfUserAvailable = await User.findOne({
            mobileNo: data.mobileNo
        })
        if (_.isEmpty(checkIfUserAvailable)) {
            return {
                data: "No Such User Exists",
                error: checkIfUserAvailable,
                value: false
            }
        }
        if (checkIfUserAvailable.mobileVerification !== data.otp) {
            return {
                data: "Incorrect OTP",
                error: checkIfUserAvailable,
                value: false
            }
        }

        const accessTokenOutput =
            await UserModel.generateAccessTokenVerifyMobileNo(data)

        if (accessTokenOutput && !accessTokenOutput.value) {
            return {
                data: "Failed to Generate AccessToken",
                value: false
            }
        }
        let objToUpdate = {
            mobileVerified: true
        }
        const userOutput = await User.updateOne(
            {
                mobileNo: data.mobileNo
            },
            objToUpdate
        )
        if (userOutput && !userOutput.nModified) {
            return {
                data: "Failed to Update User",
                error: userOutput,
                value: false
            }
        }
        return {
            data: accessTokenOutput.data,
            value: true
        }
    },
    // updated sign up verify mobile otp
    async verifyMobile_v1(data) {
        const checkIfUserAvailable = await User.findOne({
            mobileNo: data.mobileNo
        })
        if (_.isEmpty(checkIfUserAvailable)) {
            return {
                data: "No Such User Exists",
                error: checkIfUserAvailable,
                value: false
            }
        }
        if (checkIfUserAvailable.mobileVerification !== data.otp) {
            return {
                data: "Incorrect OTP",
                error: checkIfUserAvailable,
                value: false
            }
        }

        const accessTokenOutput =
            await UserModel.generateAccessTokenUpdatedSignup(
                checkIfUserAvailable
            )

        if (accessTokenOutput && !accessTokenOutput.value) {
            return {
                data: "Failed to Generate AccessToken",
                value: false
            }
        }
        let objToUpdate = {
            mobileVerified: true
        }
        const userOutput = await User.updateOne(
            {
                mobileNo: data.mobileNo
            },
            objToUpdate
        )
        if (userOutput && !userOutput.nModified) {
            return {
                data: "Failed to Update User",
                error: userOutput,
                value: false
            }
        }
        return {
            data: accessTokenOutput.data,
            value: true
        }
    },

    async verifyUpdatedMobile(data) {
        //in payload will send user sended otp, new mobile no.
        //find user with old mobile no
        const checkIfUserAvailable = await User.findOne({
            _id: data._id
        })
        if (_.isEmpty(checkIfUserAvailable)) {
            return {
                data: "No Such User Exists",
                error: checkIfUserAvailable,
                value: false
            }
        }
        if (checkIfUserAvailable.mobileVerification !== data.otp) {
            return {
                data: "Incorrect OTP",
                error: checkIfUserAvailable,
                value: false
            }
        }

        const accessTokenOutput =
            await UserModel.generateAccessTokenVerifyUpdatedMobileNo(data)

        if (accessTokenOutput && !accessTokenOutput.value) {
            return {
                data: "Failed to Generate AccessToken",
                value: false
            }
        }
        let objToUpdate = {
            mobileVerified: true,
            mobileNo: data.countryCode + data.mobileNo,
            countryCode: data.countryCode
        }
        const userOutput = await User.updateOne(
            {
                _id: data._id
            },
            objToUpdate
        )
        if (userOutput && !userOutput.nModified) {
            return {
                data: "Failed to Update User",
                error: userOutput,
                value: false
            }
        }
        return {
            data: accessTokenOutput.data,
            value: true
        }
    },
    //updted sign up flow token generation for both email and mobile
    async generateAccessTokenUpdatedSignup(data) {
        const userAvailable = await User.findOne({
            cognitousername: data.cognitousername
        })
        if (_.isEmpty(userAvailable)) {
            return {
                data: "No Such User Exists",
                value: false
            }
        }
        let objToGenerateAccessToken = {
            _id: userAvailable._id,
            // name: userAvailable.name,
            // email: userAvailable.email,
            //  treeIdin: userAvailable.treeIdin,
            // linkedGroup: userAvailable.linkedGroup,
            // personalDetails: userAvailable.personalDetails,
            cognitousername: userAvailable.cognitousername
            // mobileNo: userAvailable.mobileNo
        }
        var token = jwt.sign(objToGenerateAccessToken, jwtKey)
        objToGenerateAccessToken.accessToken = token
        //to send personal details in response
        objToGenerateAccessToken.personalDetails = userAvailable.personalDetails

        //  delete objToGenerateAccessToken._id
        return {
            data: objToGenerateAccessToken,
            value: true
        }
    },
    async generateAccessTokenVerifyMobileNo(data) {
        const userAvailable = await User.findOne({
            mobileNo: data.mobileNo
        })
        if (_.isEmpty(userAvailable)) {
            return {
                data: "No Such User Exists",
                value: false
            }
        }
        let objToGenerateAccessToken = {
            _id: userAvailable._id,
            name: userAvailable.name,
            email: userAvailable.email,
            treeIdin: userAvailable.treeIdin,
            linkedGroup: userAvailable.linkedGroup,
            personalDetails: userAvailable.personalDetails,
            cognitousername: userAvailable.cognitousername,
            mobileNo: userAvailable.mobileNo
        }
        var token = jwt.sign(objToGenerateAccessToken, jwtKey)
        objToGenerateAccessToken.accessToken = token
        //  delete objToGenerateAccessToken._id
        return {
            data: objToGenerateAccessToken,
            value: true
        }
    },

    async generateAccessTokenVerifyUpdatedMobileNo(data) {
        const userAvailable = await User.findOne({
            _id: data._id
        })
        if (_.isEmpty(userAvailable)) {
            return {
                data: "No Such User Exists",
                value: false
            }
        }
        let objToGenerateAccessToken = {
            _id: userAvailable._id,
            name: userAvailable.name,
            email: userAvailable.email,
            treeIdin: userAvailable.treeIdin,
            linkedGroup: userAvailable.linkedGroup,
            personalDetails: userAvailable.personalDetails,
            cognitousername: userAvailable.cognitousername,
            mobileNo: data.countryCode + data.mobileNo
        }
        var token = jwt.sign(objToGenerateAccessToken, jwtKey)
        objToGenerateAccessToken.accessToken = token
        //  delete objToGenerateAccessToken._id
        return {
            data: objToGenerateAccessToken,
            value: true
        }
    },

    //check token with either email or mobile
    async generateAccessToken(data) {
        const userAvailable = await User.findOne({ email: data.email })
        if (_.isEmpty(userAvailable)) {
            return { data: "No Such User Exists", value: false }
        }
        let objToGenerateAccessToken = {
            _id: userAvailable._id,
            name: userAvailable.name,
            email: userAvailable.email,
            treeIdin: userAvailable.treeIdin,
            linkedGroup: userAvailable.linkedGroup,
            personalDetails: userAvailable.personalDetails,
            cognitousername: userAvailable.cognitousername,
            mobileNo: userAvailable.mobileNo
        }
        var token = jwt.sign(objToGenerateAccessToken, jwtKey)
        objToGenerateAccessToken.accessToken = token
        return { data: objToGenerateAccessToken, value: true }
    },

    async generateAccessTokenVerifyUpdatedEmail(data) {
        try {
            const userAvailable = await User.findOne({ _id: data._id })
            if (_.isEmpty(userAvailable)) {
                return { data: "No Such User Exists", value: false }
            }
            let objToGenerateAccessToken = {
                _id: userAvailable._id,
                name: userAvailable.name,
                //email: userAvailable.email,
                treeIdin: userAvailable.treeIdin,
                linkedGroup: userAvailable.linkedGroup,
                personalDetails: userAvailable.personalDetails,
                cognitousername: userAvailable.cognitousername,
                mobileNo: userAvailable.mobileNo
            }
            var token = jwt.sign(objToGenerateAccessToken, jwtKey)
            console.log("&&&&&", token)
            objToGenerateAccessToken.accessToken = token
            return { data: objToGenerateAccessToken, value: true }
        } catch (error) {
            console.log("error is", error)
            res.status(500).send(error)
        }
    },
    ///
    async logout(data) {
        const userAvailable = await User.findOne({ email: data.email })
        if (_.isEmpty(userAvailable)) {
            return { data: "No such User Exixts", value: false }
        }
        let objToGenerateAccessToken = {
            _id: userAvailable._id,
            name: userAvailable.name,
            email: userAvailable.email
        }
        var token = jwt.sign(objToGenerateAccessToken, jwtKey, {
            expiresIn: "10"
        })
        console.log("token :", token)
        objToGenerateAccessToken.accessToken = token
        return { data: objToGenerateAccessToken, value: true }
    },
    async sendEmail(data) {
        try {
            const randomCode = randomize("0", 6)
            //   console.log("transporter", transporter)
            const emailOutput = await transporter.sendMail({
                from: '"iMeUsWe" <Time.cathub@gmail.com>', // sender address
                to: data.email, // list of receivers
                subject: "One Time Password for Verification of iMeUsWe", // Subject line
                text: `Your One time Password for Verification of iMeUsWe Account is: ${randomCode}`, // plain text body
                html: `Your One time Password for Verification of iMeUsWe Account is: <b>${randomCode}</b>` // html body
            })
            //  console.log("emailOutput :",emailOutput)
            // console.log("emailOutput.accepted :",emailOutput.accepted)
            if (
                emailOutput &&
                emailOutput.accepted &&
                emailOutput.accepted.length > 0
            ) {
                return { data: { otp: randomCode }, value: true }
            } else {
                return { data: "Error Sending Email", value: false }
            }
        } catch (error) {
            return { data: error, value: false }
        }
    },

    async sendSesEmail(data) {
        try {
            console.log('email',data.email)
            const randomCode = randomize("0", 4)
            console.log('otp',randomCode)
            let templateData = {
                otp: randomCode,
                email:data.email
            }
            let params = {
                Source: "iMeUsWe <noreply@imeuswe.in>",
                Template: "OtpInvite",

                Destination: {
                    ToAddresses: [data.email]
                },
                TemplateData: JSON.stringify(templateData)
            }
            console.log(params)
            let result = await AWS_SES.sendTemplatedEmail(
                params,
                function (err, data) {
                    if (err) {
                        console.log(err, err.stack)

                        return false
                    }
                    // an error occurred
                    else {
                        console.log("Email sent:", data)
                        return true
                    }
                    // successful response
                }
            )

            //  console.log("emailOutput :",emailOutput)
            // console.log("emailOutput.accepted :",emailOutput.accepted)
            if ((result = true)) {
                return { data: { otp: randomCode }, value: true }
            } else {
                return { data: "Error Sending Email", value: false }
            }
        } catch (error) {
            console.log(error)
            return { data: error, value: false }
        }
    },
    async sendSesVerifyEmail(data) {
        try {
            const randomCode = randomize("0", 6)
            let encryptedOtp = CryptoJS.AES.encrypt(
                randomCode,
                "ImeusWe104$#%98^"
            ).toString()

            let link =
                process.env.FRONT_END_VERIFICATION_URL +
                "/?ref=" +
                encryptedOtp +
                "OTT"
            let templateData = {
                verificationlink: link
            }
            let params = {
                Source: "iMeUsWe <noreply@imeuswe.in>",
                Template: "EmailVerification",

                Destination: {
                    ToAddresses: [data.email]
                },
                TemplateData: JSON.stringify(templateData)
            }
            // console.log(params)
            let result = AWS_SES.sendTemplatedEmail(
                params,
                function (err, data) {
                    if (err) {
                        console.log(err, err.stack)

                        return false
                    }
                    // an error occurred
                    else {
                        return true
                    }

                    // successful response
                }
            )
            if ((result = true)) {
                return { data: { otp: randomCode }, value: true }
            } else {
                return { data: "Error Sending Email", value: false }
            }
        } catch (error) {
            return { data: error, value: false }
        }
    },

    async sendMobileOtp(data) {
        console.log("resntotpmobile")
        const validUser = await User.findOne({
            mobileNo: data.mobileNo
        })
        if (_.isEmpty(validUser)) {
            return {
                data: "No Such User Exists",
                value: false
            }
        }
        if (data && data.type && !validUser.mobileVerified) {
            return {
                data: "No Such User Exists",
                value: false
            }
        }
        data.countryCode = validUser.countryCode
        const SMSOutput = await UserModel.sendSMS(data)
        console.log("SMSOutput", SMSOutput, SMSOutput.data.otp, data)
        if (SMSOutput.value) {
            let objToUpdate = {}
            objToUpdate = {
                // mobileVerification: parseInt(SMSOutput.data.otp)
                mobileVerification: SMSOutput.data.otp
            }
            const updateUser = await User.updateOne(
                {
                    mobileNo: data.mobileNo
                },
                objToUpdate
            )
            if (updateUser && updateUser.nModified) {
                return {
                    data: "OTP Sent Successfully",
                    value: true
                }
            }
        }
        return {
            data: "Failed to Send OTP",
            value: false
        }
    },
    async sendMobileOtpv1(data) {
        console.log("resntotpmobile")
        const validUser = await User.findOne({
            mobileNo: data.mobileNo
        })
        if (_.isEmpty(validUser)) {
            return {
                data: "No Such User Exists",
                value: false
            }
        }
        if (data && data.type && !validUser.mobileVerified) {
            return {
                data: "No Such User Exists",
                value: false
            }
        }
        data.countryCode = validUser.countryCode
        //const SMSOutput = await UserModel.sendSMS(data)
        const SMSOutput = {
            value: true,
            data: {
                otp: "9999"
            }
        }
        console.log("SMSOutput", SMSOutput, SMSOutput.data.otp, data)
        if (SMSOutput.value) {
            let objToUpdate = {}
            objToUpdate = {
                // mobileVerification: parseInt(SMSOutput.data.otp)
                mobileVerification: SMSOutput.data.otp
            }
            const updateUser = await User.updateOne(
                {
                    mobileNo: data.mobileNo
                },
                objToUpdate
            )
            if (updateUser && updateUser.nModified) {
                return {
                    data: "OTP Sent Successfully",
                    value: true
                }
            }
        }
        return {
            data: "Failed to Send OTP",
            value: false
        }
    },

    async resendOtpMobile(data) {
        console.log("resntotpmobile")

        const validUser = await User.findOne({
            mobileNo: data.mobileNo
        })
        console.log(validUser)
        if (_.isEmpty(validUser)) {
            return {
                data: "No Such User Exists",
                name: "userDoesNotExist",
                value: false
            }
        }
        // if ( !_.isEmpty(validUser.password) && !_.isEmpty(validUser)) {
        //     return {
        //         data: "No Such User Exists, Mobile not verified",
        //         name:"userMobileNotVerified",
        //         value: false
        //     }
        // }
        // if ( !_.isEmpty(validUser.password) &&!_.isEmpty(validUser) && !validUser.mobileVerified && !validUser.emailVerified ) {
        //     return {
        //         data: "User not verified",
        //         name:"userEmailMobileNotVerified",
        //         value: false
        //     }
        // }
        // if (!_.isEmpty(validUser.password) && !_.isEmpty(validUser) ) {
        //     return {
        //         data: "No Such User Exists",
        //         name:"userDoesNotExist",
        //         value: false
        //     }
        // }
        if (_.isEmpty(validUser.password) || _.isNull(validUser.password)) {
            return {
                data: "Please login with email",
                value: false
            }
        }
        data.countryCode = validUser.countryCode
        let SMSOutput
        if (!_.isEmpty(validUser.password) || !_.isNull(validUser.password)) {
            SMSOutput = await UserModel.sendSMS(data)
        }
        console.log("SMSOutput", SMSOutput, SMSOutput.data.otp, data)

        if (SMSOutput.value) {
            let objToUpdate = {}
            objToUpdate = {
                // mobileVerification: parseInt(SMSOutput.data.otp)
                mobileVerification: SMSOutput.data.otp
            }
            const updateUser = await User.updateOne(
                {
                    mobileNo: data.mobileNo
                },
                objToUpdate
            )
            if (updateUser && updateUser.nModified) {
                return {
                    data: "OTP Sent Successfully",
                    value: true
                }
            }
        }
        return {
            data: "Failed to Send OTP",
            value: false
        }
    },
    // Updated sign up flow, resend mobile otp for both sign up and login
    async resendOtpMobile_v1(data) {
        console.log("resntotpmobile")

        const validUser = await User.findOne({
            mobileNo: data.mobileNo
        })
        console.log(validUser)
        if (_.isEmpty(validUser)) {
            return {
                data: "No Such User Exists",
                name: "userDoesNotExist",
                value: false
            }
        }

        // if (_.isEmpty(validUser.password) || _.isNull(validUser.password)) {
        //     return {
        //         data: "Please login with email",
        //         value: false
        //     }
        // }
        data.countryCode = validUser.countryCode
        let SMSOutput
        //   if (!_.isEmpty(validUser.password) || !_.isNull(validUser.password)) {
        SMSOutput = await UserModel.sendSMS(data)
        //  }
        console.log("SMSOutput", SMSOutput, SMSOutput.data.otp, data)

        if (SMSOutput.value) {
            let objToUpdate = {}
            objToUpdate = {
                // mobileVerification: parseInt(SMSOutput.data.otp)
                mobileVerification: SMSOutput.data.otp
            }
            const updateUser = await User.updateOne(
                {
                    mobileNo: data.mobileNo
                },
                objToUpdate
            )
            if (updateUser && updateUser.nModified) {
                return {
                    data: "OTP Sent Successfully",
                    value: true
                }
            }
        }
        return {
            data: "Failed to Send OTP",
            value: false
        }
    },

    async resendOtpForUpdateMobile(data) {
        // in payload will send updated mobile no, old mobile no,countryCode
        console.log("resntotpmobile")

        //finding if user exists with new mobileNo in db
        const validUser = await User.findOne({
            mobileNo: data.mobileNo
        })
        console.log(validUser)
        if (!_.isEmpty(validUser)) {
            return {
                data: "user is alredy exists with the same mobil no",
                name: "userAlreadyExist",
                value: false
            }
        }
        let SMSOutput
        // fetch user by Id
        const user = await User.findOne({
            _id: data._id
        })
        if (!_.isEmpty(user.password) || !_.isNull(user.password)) {
            SMSOutput = await UserModel.sendSMS(data)
        }
        console.log("SMSOutput", SMSOutput, SMSOutput.data.otp, data)

        if (SMSOutput.value) {
            let objToUpdate = {}
            objToUpdate = {
                // mobileVerification: parseInt(SMSOutput.data.otp)
                mobileVerification: SMSOutput.data.otp
            }
            const updateUser = await User.updateOne(
                {
                    _id: data._id
                },
                objToUpdate
            )
            if (updateUser && updateUser.nModified) {
                return {
                    data: "OTP Sent Successfully",
                    value: true
                }
            }
        }
        return {
            data: "Failed to Send OTP",
            value: false
        }
    },
    async loginWithMobile(data) {
        console.log("loginWithMobile")

        const validUser = await User.findOne({
            mobileNo: data.mobileNo
        })
        let user
        if (validUser) {
            user = {
                name: validUser.personalDetails.name,
                lastname: validUser.personalDetails.lastname,
                gender: validUser.personalDetails.gender,
                countryCode: validUser.countryCode,
                mobileNo: validUser.mobileNo,
                cognitousername: validUser.cognitousername,
                email: validUser.email
            }
        }
        //  console.log(validUser)
        if (_.isEmpty(validUser)) {
            return {
                data: "No Such User Exists",
                name: "userDoesNotExist",
                value: false
            }
        }
        // if ( !_.isEmpty(validUser.password) && !_.isEmpty(validUser) && !validUser.mobileVerified) {
        //     return {
        //         data: "No Such User Exists, Mobile not verified",
        //         name:"userMobileNotVerified",
        //         value: false
        //     }
        // }
        if (
            !_.isEmpty(validUser.password) &&
            !_.isEmpty(validUser) &&
            !validUser.mobileVerified &&
            !validUser.emailVerified
        ) {
            return {
                data: "User not verified",
                name: "userEmailMobileNotVerified",
                user: user,
                value: false
            }
        }
        if (
            !_.isEmpty(validUser.password) &&
            !_.isEmpty(validUser) &&
            !validUser.emailVerified
        ) {
            return {
                data: "No Such User Exists, Email not verified",
                name: "userEmailNotVerified",
                user: user,
                value: false
            }
        }
        if (_.isEmpty(validUser.password) || _.isNull(validUser.password)) {
            return {
                data: "Due to a system update, please login via email",
                value: false
            }
        }
        data.countryCode = validUser.countryCode
        let SMSOutput
        if (!_.isEmpty(validUser.password) || !_.isNull(validUser.password)) {
            SMSOutput = await UserModel.sendSMS(data)
        }
        console.log("SMSOutput", SMSOutput, SMSOutput.data.otp, data)

        if (SMSOutput.value) {
            let objToUpdate = {}
            objToUpdate = {
                // mobileVerification: parseInt(SMSOutput.data.otp)
                mobileVerification: SMSOutput.data.otp
            }
            const updateUser = await User.updateOne(
                {
                    mobileNo: data.mobileNo
                },
                objToUpdate
            )
            if (updateUser && updateUser.nModified) {
                return {
                    data: "OTP Sent Successfully",
                    value: true
                }
            }
        }
        return {
            data: "Failed to Send OTP",
            value: false
        }
    },
    //Updated sign up flow login with mobil api
    async loginWithMobile_v1(data) {
        console.log("loginWithMobile")

        const validUser = await User.findOne({
            mobileNo: data.mobileNo
        })
        let user
        if (validUser) {
            user = {
                name: validUser.personalDetails.name,
                lastname: validUser.personalDetails.lastname,
                countryCode: validUser.countryCode,
                mobileNo: validUser.mobileNo,
                cognitousername: validUser.cognitousername,
                email: validUser.email
            }
        }
        //  console.log(validUser)
        if (_.isEmpty(validUser)) {
            return {
                data: "No Such User Exists",
                name: "userDoesNotExist",
                value: false
            }
        }
        // // if ( !_.isEmpty(validUser.password) && !_.isEmpty(validUser) && !validUser.mobileVerified) {
        // //     return {
        // //         data: "No Such User Exists, Mobile not verified",
        // //         name:"userMobileNotVerified",
        // //         value: false
        // //     }
        // // }
        // if (
        //     !_.isEmpty(validUser.password) &&
        //     !_.isEmpty(validUser) &&
        //     !validUser.mobileVerified &&
        //     !validUser.emailVerified
        // ) {
        //     return {
        //         data: "User not verified",
        //         name: "userEmailMobileNotVerified",
        //         user: user,
        //         value: false
        //     }
        // }
        // if (
        //     !_.isEmpty(validUser.password) &&
        //     !_.isEmpty(validUser) &&
        //     !validUser.emailVerified
        // ) {
        //     return {
        //         data: "No Such User Exists, Email not verified",
        //         name: "userEmailNotVerified",
        //         user: user,
        //         value: false
        //     }
        // }
        if (
            //    !_.isEmpty(validUser.password) &&
            !_.isEmpty(validUser) &&
            !validUser.mobileVerified
        ) {
            return {
                data: "No Such User Exists, Mobile not verified",
                name: "userMobileNotVerified",
                user: user,
                value: false
            }
        }
        // if (_.isEmpty(validUser.password) || _.isNull(validUser.password)) {
        //     return {
        //         data: "Due to a system update, please login via email",
        //         value: false
        //     }
        // }
        data.countryCode = validUser.countryCode
        let SMSOutput
        //   if (!_.isEmpty(validUser.password) || !_.isNull(validUser.password)) {
        if (!_.isEmpty(validUser) && validUser.mobileVerified) {
            SMSOutput = await UserModel.sendSMS(data)
        }
        //   }
        console.log("SMSOutput", SMSOutput, SMSOutput.data.otp, data)

        if (SMSOutput.value) {
            let objToUpdate = {}
            objToUpdate = {
                // mobileVerification: parseInt(SMSOutput.data.otp)
                mobileVerification: SMSOutput.data.otp
            }
            const updateUser = await User.updateOne(
                {
                    mobileNo: data.mobileNo
                },
                objToUpdate
            )
            if (updateUser && updateUser.nModified) {
                return {
                    data: "OTP Sent Successfully",
                    value: true
                }
            }
        }
        return {
            data: "Failed to Send OTP",
            value: false
        }
    },
    async sendSMS(data) {
        try {
            let destination = data.mobileNo
            const payloadFn = (appId, destination, message) => {
                const ApplicationId = appId

                const Addresses = {}
                Addresses[destination] = { ChannelType: "SMS" }

                const MessageConfiguration = {
                    SMSMessage: {
                        Body: message,
                        MessageType: "TRANSACTIONAL",
                        SenderId: "SYSPLT",
                        EntityId: "1701166782337697568",
                        TemplateId: "1707166825188556904"
                    }
                }

                return {
                    ApplicationId,
                    MessageRequest: {
                        Addresses,
                        MessageConfiguration
                    }
                }
            }
            const payloadFn1 = (appId, destination, message) => {
                const ApplicationId = appId

                const Addresses = {}
                Addresses[destination] = { ChannelType: "SMS" }

                const MessageConfiguration = {
                    SMSMessage: {
                        Body: message,
                        MessageType: "TRANSACTIONAL",
                        OriginationNumber: "+18668610329",
                        Keyword: "HELP"
                        // EntityId: "1701166782337697568" ,
                        // TemplateId: "1707166825188556904",
                    }
                }

                return {
                    ApplicationId,
                    MessageRequest: {
                        Addresses,
                        MessageConfiguration
                    }
                }
            }
            const randomCode = randomize("0", 4)

            let hashvalue = "sq9fhyC6U8l"
            const message =
                "Your iMeUsWe verification code is : " +
                randomCode +
                " Internal Ref " +
                hashvalue +
                " SPTR"
            let emailOutput = {}
            let anyCountry = false

            if (data.countryCode === 91) {
                console.log("91 code")
                const payload = payloadFn(appId, destination, message)
                const smsOut = await pinpoint.sendMessages(payload).promise()
                emailOutput = smsOut["MessageResponse"]["Result"][destination]
                console.log("SMS DELIVERED 91", emailOutput)
            } else if (data.countryCode === 44 || data.countryCode === 1) {
                const payload = payloadFn1(appId, destination, message)
                const smsOut = await pinpoint.sendMessages(payload).promise()
                emailOutput = smsOut["MessageResponse"]["Result"][destination]
                console.log("SMS DELIVERED 44 or 1", emailOutput)
            }
            // else {
            //     anyCountry = true
            //     var setSMSTypePromise = new AWS.SNS({
            //         apiVersion: "2010-03-31"
            //     })
            //         .setSMSAttributes({
            //             attributes: {
            //                 DefaultSMSType: "Transactional"
            //             }
            //         })
            //         .promise()
            //     let mobileno =
            //         typeof data.mobileNo !== "string"
            //             ? data.mobileNo.toString()
            //             : data.mobileNo
            //     var params = {
            //         Message:
            //             "Your iMeUsWe verification code is : " +
            //             randomCode +
            //             " Internal Ref " +
            //             hashvalue +
            //             " SPTR",
            //         PhoneNumber: mobileno
            //     }
            //     // Create promise and SNS service object
            //     var publishTextPromise = new AWS.SNS({
            //         apiVersion: "2010-03-31"
            //     })
            //         .publish(params)
            //         .promise()
            //     emailOutput = await publishTextPromise

            //     console.log("SMS DELIVERED SNS", emailOutput)
            // }
            // if (emailOutput && emailOutput.sid) {
            if (
                emailOutput["DeliveryStatus"] === "SUCCESSFUL" ||
                anyCountry == true
            ) {
                return {
                    data: {
                        otp: randomCode
                    },
                    value: true
                }
            } else {
                return {
                    data: "Error Sending SMS",
                    value: false
                }
            }
        } catch (error) {
            return {
                data: error,
                value: false
            }
        }
    },
    async resendOtp(data) {
        data.email = _.trim(_.toLower(data.email))
        const validUser = await User.findOne({
            email: data.email
        })
        if (_.isEmpty(validUser)) {
            return {
                data: "No Such User Exists",
                value: false
            }
        }
        if (data && data.type && !validUser.emailVerified) {
            return {
                data: "No Such User Exists",
                value: false
            }
        }

        const emailOutput = await UserModel.sendSesEmail(data)
        console.log("emailOutput", emailOutput, emailOutput.data.otp, data)
        if (emailOutput.value) {
            let objToUpdate = {}
            if (data && data.type == "FORGOT_PASSWORD") {
                objToUpdate = {
                    // forgotPasswordVerification: parseInt(emailOutput.data.otp)
                    forgotPasswordVerification: emailOutput.data.otp
                }
            } else {
                objToUpdate = {
                    //    emailVerification: parseInt(emailOutput.data.otp)
                    emailVerification: emailOutput.data.otp
                }
                if (validUser["otpExpiry"]) {
                    if (moment(validUser["otpExpiry"]).isAfter(moment())) {
                        objToUpdate.otpExpiry = validUser["otpExpiry"]
                    } else {
                        objToUpdate.otpExpiry = moment().add(3, "minutes")
                    }
                } else {
                    objToUpdate.otpExpiry = moment().add(3, "minutes")
                }
            }
            const updateUser = await User.updateOne(
                {
                    email: data.email
                },
                objToUpdate
            )
            console.log("updateUSerrrrrrrrrrrrrrrrrr", updateUser)
            if (updateUser && updateUser.nModified) {
                return {
                    data: "OTP Sent Successfully",
                    token: objToUpdate["otpExpiry"]
                        ? CryptoJS.AES.encrypt(
                              objToUpdate["otpExpiry"].toString(),
                              "ImeusWe104$#%98^"
                          ).toString()
                        : null,
                    value: true
                }
            }
        }
        return {
            data: "Failed to Send OTP",
            value: false
        }
    },

    // sending an email with verification link
    async resendOtp_v1(data) {
        data.email = _.trim(_.toLower(data.email))
        const validUser = await User.findOne({
            email: data.email
        })
        if (_.isEmpty(validUser)) {
            return {
                data: "No Such User Exists",
                value: false
            }
        }
        if (data && data.type && !validUser.emailVerified) {
            return {
                data: "No Such User Exists",
                value: false
            }
        }

        const emailOutput = await UserModel.sendSesVerifyEmail(data)
        console.log("emailOutput", emailOutput, emailOutput.data.otp, data)
        if (emailOutput.value) {
            let objToUpdate = {}
            if (data && data.type == "FORGOT_PASSWORD") {
                objToUpdate = {
                    // forgotPasswordVerification: parseInt(emailOutput.data.otp)
                    forgotPasswordVerification: emailOutput.data.otp
                }
            } else {
                objToUpdate = {
                    //    emailVerification: parseInt(emailOutput.data.otp)
                    emailVerification: emailOutput.data.otp
                }
            }
            const updateUser = await User.updateOne(
                {
                    email: data.email
                },
                objToUpdate
            )
            console.log("updateUSerrrrrrrrrrrrrrrrrr", updateUser)
            if (updateUser && updateUser.nModified) {
                return {
                    data: "OTP Sent Successfully",
                    value: true
                }
            }
        }
        return {
            data: "Failed to Send OTP",
            value: false
        }
    },
    async resendOtpForUpdate(data) {
        // payload updatedEmail,password,oldEmail
        data.email = _.trim(_.toLower(data.email))
        const validUser = await User.findOne({
            email: data.email
        })

        if (!_.isEmpty(validUser)) {
            return {
                data: "User is already Exists",
                value: false
            }
        }
        const emailOutput = await UserModel.sendSesVerifyEmail(data)
        console.log("emailOutput is", emailOutput)
        if (emailOutput.value) {
            let objToUpdate = {}

            objToUpdate = {
                //    emailVerification: parseInt(emailOutput.data.otp)
                emailVerification: emailOutput.data.otp
                //password: sha256(data.password)
            }

            const updateUser = await User.updateOne(
                {
                    _id: data._id //userId
                },
                objToUpdate
            )
            if (updateUser && updateUser.nModified) {
                return {
                    data: "OTP Sent Successfully",
                    value: true
                }
            }
        }
        return {
            data: "Failed to Send OTP",
            value: false
        }
    },

    async resendOtpV1(data) {
        data.email = _.trim(_.toLower(data.email))
        const validUser = await User.findOne({
            email: data.email
        })
        if (_.isEmpty(validUser)) {
            return {
                data: "No Such User Exists",
                value: false
            }
        }
        if (data && data.type && !validUser.emailVerified) {
            return {
                data: "No Such User Exists",
                value: false
            }
        }

        //const emailOutput = await UserModel.sendSesEmail(data)
        const emailOutput = {
            value: "",
            data: {
                otp: "7777"
            }
        }
        console.log("emailOutput", emailOutput, emailOutput.data.otp, data)
        if (emailOutput.value) {
            let objToUpdate = {}
            if (data && data.type == "FORGOT_PASSWORD") {
                objToUpdate = {
                    // forgotPasswordVerification: parseInt(emailOutput.data.otp)
                    forgotPasswordVerification: emailOutput.data.otp
                }
            } else {
                objToUpdate = {
                    //    emailVerification: parseInt(emailOutput.data.otp)
                    emailVerification: emailOutput.data.otp
                }
            }
            const updateUser = await User.updateOne(
                {
                    email: data.email
                },
                objToUpdate
            )
            console.log("updateUSerrrrrrrrrrrrrrrrrr", updateUser)
            if (updateUser && updateUser.nModified) {
                return {
                    data: "OTP Sent Successfully",
                    value: true
                }
            }
        }
        return {
            data: "Failed to Send OTP",
            value: false
        }
    },
    async updateUser(data) {
        const updateOutput = await User.updateOne(
            { email: data.email },
            data.updateObj
        )
        if (updateOutput && !updateOutput.nModified) {
            return { data: "Failed to Update User OTP", value: false }
        }
        return { data: "Otp Sent Successfully", value: true }
    }
}
