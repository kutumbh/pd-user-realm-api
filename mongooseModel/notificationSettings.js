const mongoose = require('mongoose')
const notificationSettingsSchema = new mongoose.Schema(
  {
    //sender : notification creator
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'newUser'
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'group'
    },
    notificationType: {
      type: String,
      enum: ['SendNotification', 'DontSendNotification'],
      default: 'SendNotification'
    },
    userNotificationType: {
      type: String,
      enum: ['SendNotification', 'DontSendNotification'],
      default: 'SendNotification'
    },
    emailNotificationType: {
      type: String,
      enum: ['SendNotification', 'DontSendNotification'],
      default: 'DontSendNotification'
    },
    wishesNotificationType: {
      type: String,
      enum: ['SendNotification', 'DontSendNotification'],
      default: 'SendNotification'
    },
    pushNotificationType: {
      type: String,
      enum: ['SendNotification', 'DontSendNotification'],
      default: 'SendNotification'
    },
    
    stories:{
      type: String,
      enum: ['SendNotification', 'DontSendNotification'],
      default: 'SendNotification'
    },
    trees:{
      type: String,
      enum: ['SendNotification', 'DontSendNotification'],
      default: 'SendNotification'
    }
  },
  {
    timestamps: true
  }
)

const notificationSettings = mongoose.model(
  'notificationSettings',
  notificationSettingsSchema
)

module.exports = notificationSettings
