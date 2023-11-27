const mongoose = require('mongoose')
const groupSchema = new mongoose.Schema(
  {
    //sender : notification creator
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'newUser'
    },
    groupName: {
      type: String,
      default: null
    },
    groupType:{
      groupType1:{
      type: String,
      default:"PU"
      },
      groupType2:{
        type: Number,
        default:3
      }
    },
    InvitedMembers: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'newUser'
      }
    ], //active members

    subGroupId: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'newUser'
      }
    ],

    storageUsed: {
      Storage: {
        type: String
      },
      member: {
        type: String
      }
    },

    beneficiary: [
      {
        memberId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'newUser'
          // unique: true
        },
        invitation: {
          type: String,
          enum: [
            'ownerSent',
            'userAccepted',
            'userDeclined',
            'userSent',
            'ownerAccepted',
            'ownerDeclined'
          ]
        }
      }
    ]
  },
  {
    timestamps: true
  }
)
const group = mongoose.model('group', groupSchema)
module.exports = group