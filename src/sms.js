import dotenv from 'dotenv';
import twilio from 'twilio';
dotenv.config();

// Download the helper library from https://www.twilio.com/docs/node/install
// Set environment variables for your credentials
// Read more at http://twil.io/secure
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const numberFron = "+19209900141";
const numberFor = "+529616604592"

export const client = twilio(accountSid, authToken).messages
  //.create({ body: "Hello from Twilio", from: "+19209900141", to: process.env.PHONE_NUMBER })
  //.then(message => console.log(message.sid));
  