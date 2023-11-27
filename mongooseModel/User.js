var schema = new Schema(
    {
        name: String,
        smsCount: { type: Number, default: 0 },
        updatedSmsCountDate: { type: Date, default: Date.now },
        email: { type: String, unique: true },
        //change this after cognito users are migrated
        // password: {type: String,  select: false },
        password: { type: String },
        accessLevel: String,
        accessToken: String,
        emailVerification: String,
        mobileVerification: String,
        emailVerified: { type: Boolean, default: false },
        mobileVerified: { type: Boolean, default: false },
        forgotPasswordVerification: String,
        cognitousername: {
            type: String,
            default: null
        },
        deviceInfo: {
            appVersion: {
                type: String,
                default: null
            },

            platForm: {
                type: String,

                default: null
            },

            osVersion: {
                type: String,

                default: null
            },

            model: {
                type: String,

                default: null
            },

            operatingSystem: {
                type: String,

                default: null
            },
            deviceToken: {
                type: String,

                default: null
            }
        },

        countryCode: {
            type: Number,
            trim: true,
            default: null
        },
        mobileNo: {
            type: Number,
            trim: true
            //  unique: true
            // default: null
        },

        BD_Flag: {
            type: Number
        },
        MD_Flag: {
            type: Number
        },

        DD_Flag: {
            type: Number
        },
        groupType: {
            groupType1: {
                type: String,
                default: "PU"
            },
            groupType2: {
                type: Number,
                default: 3
            }
        },
        otpExpiry:{
            type:Date,
            default:null,
        },
        personalDetails: {
            name: {
                type: String,
                trim: true
                //     required: true
            },
            middlename: {
                type: String,
                trim: true
            },
            lastname: {
                type: String,
                trim: true
                //    required: true
            },
            gender: {
                type: String,
                default: null
            },
            relationStatus: {
                type: String,
                default: null
            },
            profilepic: {
                type: String,
                default: null
            },
            livingStatus: {
                type: String,
                default: null
            }
        },
        location: {
            currentlocation: {
                type: mongoose.Schema.Types.Mixed,
                default: null
                // place_id: String,
                // lat: Number,
                // lon: Number,
                // address: String,
                // district: String,
                // city: String,
                // state: String,
                // pincode: Number,
                // country: String,
                // country_code: String
            },
            previous_locations: [
                {
                    type: mongoose.Schema.Types.Mixed,
                    default: null
                    // place_id: String,
                    // lat: Number,
                    // lon: Number,
                    // address: String,
                    // district: String,
                    // city: String,
                    // state: String,
                    // pincode: Number,
                    // country: String,
                    // country_code: String
                }
            ],
            placeOfBirth: {
                type: mongoose.Schema.Types.Mixed,
                default: null
                // place_id: String,
                // lat: Number,
                // lon: Number,
                // address: String,
                // district: String,
                // city: String,
                // state: String,
                // pincode: Number,
                // country: String,
                // country_code: String
            },
            placeOfDeath: {
                type: mongoose.Schema.Types.Mixed,
                default: null
                // place_id: String,
                // lat: Number,
                // lon: Number,
                // address: String,
                // district: String,
                // city: String,
                // state: String,
                // pincode: Number,
                // country: String,
                // country_code: String
            }
        },

        birthDetails: {
            dob: {
                type: Date,
                default: null
            },
            dod: {
                type: Date,
                default: null
            }
        },
        marriageDetails: {
            maidenName: {
                type: String,
                default: null
            },
            marraigeDate: {
                type: Date,
                default: null
            },
            linkYourSpouse: {
                type: String,
                default: null
            },
            location_of_wedding: {
                type: mongoose.Schema.Types.Mixed,
                default: null
                // place_id: String,
                // lat: Number,
                // lon: Number,
                // address: String,
                // district: String,
                // city: String,
                // state: String,
                // pincode: Number,
                // country: String,
                // country_code: String
            }
        },
        medicalDetails: {
            bloodgroup: {
                type: String
            },
            chronic_condition: [
                {
                    name: String
                }
            ],
            allergies: [
                {
                    name: String
                }
            ],
            illnesses: [
                {
                    name: String
                }
            ],
            preExistingConditions: [
                {
                    name: String
                }
            ]
        },
        moreInfo: {
            community: {
                type: String,
                default: null
            },
            subcommunity: {
                type: String,
                default: null
            },
            religion: {
                type: String,
                default: null
            },
            motherTounge: {
                type: String,
                default: null
            },
            gothra: {
                type: String,
                default: null
            },
            deity: {
                type: String,
                default: null
            },
            priestName: {
                type: String,
                default: null
            },
            ancestorVillage: {
                type: String,
                default: null
            }
        },

        workDetails: [
            {
                company_name: String,
                fromDate: {
                    type: Date
                },
                toDate: {
                    type: Date
                },
                address: {
                    type: String
                },
                location: {
                    type: mongoose.Schema.Types.Mixed,
                    default: null
                    // place_id: String,
                    // lat: Number,
                    // lon: Number,
                    // address: String,
                    // district: String,
                    // city: String,
                    // state: String,
                    // pincode: Number,
                    // country: String,
                    // country_code: String
                }
            }
        ],

        educationDetails: {
            college: [
                {
                    name: {
                        type: String
                    },
                    address: {
                        type: String
                    },
                    location: {
                        type: mongoose.Schema.Types.Mixed,
                        default: null
                        // place_id: String,
                        // lat: Number,
                        // lon: Number,
                        // address: String,
                        // district: String,
                        // city: String,
                        // state: String,
                        // pincode: Number,
                        // country: String,
                        // country_code: String
                    },

                    fromDate: {
                        type: Date
                    },
                    toDate: {
                        type: Date
                    },
                    degree: {
                        type: String
                    },
                    FD_Flag: {
                        type: Number
                    },
                    TD_Flag: {
                        type: Number
                    }
                }
            ],
            //Not using
            school: [
                {
                    name: {
                        type: String
                    },
                    location: {
                        place_id: String,
                        lat: Number,
                        lon: Number,
                        address: String,
                        district: String,
                        city: String,
                        state: String,
                        pincode: Number,
                        country: String,
                        country_code: String
                    },

                    fromDate: {
                        type: Date
                    },
                    toDate: {
                        type: Date
                    },
                    degree: {
                        type: String
                    },
                    FD_Flag: {
                        type: Number
                    },
                    TD_Flag: {
                        type: Number
                    }
                }
            ]
        },
        sociallinks: [
            {
                account: String,
                link: String
            }
        ],

        other: [
            {
                account: String,
                link: String
            }
        ],
        signup: {
            hasEmail: {
                type: Boolean
            },
            hasMobile: {
                type: Boolean
            },
            hasGoogle: {
                type: Boolean
            },
            hasApple: {
                type: Boolean
            },
            hasFacebook: {
                type: Boolean
            }
        },

        treeIdin: [{ type: mongoose.Schema.Types.ObjectId, ref: "newtree" }],
        parents: [{ type: mongoose.Schema.Types.ObjectId, ref: "newUser" }],
        children: [{ type: mongoose.Schema.Types.ObjectId, ref: "newUser" }],
        husbands: [{ type: mongoose.Schema.Types.ObjectId, ref: "newUser" }],
        wifes: [{ type: mongoose.Schema.Types.ObjectId, ref: "newUser" }],
        siblings: [{ type: mongoose.Schema.Types.ObjectId, ref: "newUser" }],
        linkedGroup: [{ type: mongoose.Schema.Types.ObjectId, ref: "group" }]
    },
    { timestamps: true }
)
export default mongoose.model("newUser", schema)
