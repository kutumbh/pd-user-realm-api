const mongoose = require('mongoose')
const subscriptionOrderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: false
    }, 
    groupId: {
        type: mongoose.Schema.Types.ObjectId, ref: ''
      }, 
      ownerId: {
        type: mongoose.Schema.Types.ObjectId, ref: ''
      }, 
      productType:{
        groupType1:{
          type: String,
          default:"PU"
          },
          groupType2:{
            type: Number,
            default:3
          }

      },
       serviceProviderId:{
        type: mongoose.Schema.Types.ObjectId, ref: ''

      },
      Plan: {
        type: String,
        required: false
      },
      SubsType: {
        type: String,
        required: false,
        default:null
      },
     
      amount: {
        type: String,
        required: false,
        default:null
      },
      currency:{
        type: String,
        enum: ['USD', 'INR'],
        default: 'INR'
      },
      startDate: {
        type: Date,
        default:null
      },
      EndDate: {
        type: Date,
        default:null
      },
      
      order_status: {
        type: String,
        default:null
      },
      ServiceDescription:{
        type:String
      },
      ccDetail:[
        {
        cName:{
          type: String
        },
        cardNumber:{
          type:Number
        },
        cvv:{
          type:String
        },
        expiryYear:{
          type:Number
        }
      }
      ]
    
  },
  {
    timestamps: true
  }
)
module.exports = mongoose.model('subscriptionOrder', subscriptionOrderSchema)
