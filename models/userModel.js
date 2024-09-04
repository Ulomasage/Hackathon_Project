const mongoose = require('mongoose')


// Subdocument schema for emergency contacts
const EmergencyContactSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    number: {
      type: String,
      required: true,
    },
    relation: {
      type: String,
      required: true,
    }
  });
  
  const EmergencyEmailSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    relation: {
      type: String,
      required: true,
    }
  });
  

const userSchema = new mongoose.Schema({
   fullName: {
        type: String,
        required: true,
        trim:true
    },
    profilePic: {
        type: String,
        require: false
    },
    gender:{
        type: String,
        required: true,
        enum:["male","female"],
        trim:true
    },
    phoneNumber:{
        type: String,
        required: true
    },
    EmergencyPhoneNumbers:[EmergencyContactSchema],
    EmergencyEmails:[ EmergencyEmailSchema],
    address:{
        type: String,
        required: true
    },
    email:{
        type:String,
        required: true,
        unique: true,
        trim:true,
        toLowerCase:true
    },
    password:{
        type:String
    },
    blackList:[],
    isAdmin:{
        type:Boolean,
        default:false
     },
    isVerified:{
        type:Boolean,
        default:false
    },
    // alert:[{
    //     type:mongoose.Schema.Types.ObjectId,
    //     ref:"alert"
    // }]
}, {timestamps: true})

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel

