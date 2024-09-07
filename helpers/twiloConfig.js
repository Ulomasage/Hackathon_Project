// twilioConfig.js
const twilio = require('twilio');
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;   

const twilioClient = twilio(accountSid, authToken);

module.exports = twilioClient;