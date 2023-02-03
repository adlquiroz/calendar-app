import dotenv from 'dotenv';
import twilio from 'twilio';
dotenv.config();

// Download the helper library from https://www.twilio.com/docs/node/install
// Set environment variables for your credentials
// Read more at http://twil.io/secure
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
export const sendMessageFrom = process.env.messageSendFrom;
export const sendMessageFor = process.env.messageSendFor;

export const client = twilio(accountSid, authToken).messages
