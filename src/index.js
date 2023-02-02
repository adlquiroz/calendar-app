import path from 'path';
import fs from 'fs/promises';
import process from 'process';
import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis';
import { client } from "./sms.js";
import { ConversationPage } from 'twilio/lib/rest/conversations/v1/conversation.js';
import { Console } from 'console';


// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
	try {
		const content = await fs.readFile(TOKEN_PATH);
		const credentials = JSON.parse(content);
		return google.auth.fromJSON(credentials);
	} catch (err) {
		return null;
	}
}

/**
 * Serializes credentials to a file compatible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
	const content = await fs.readFile(CREDENTIALS_PATH);
	const keys = JSON.parse(content);
	const key = keys.installed || keys.web;
	const payload = JSON.stringify({
		type: 'authorized_user',
		client_id: key.client_id,
		client_secret: key.client_secret,
		refresh_token: client.credentials.refresh_token,
	});
	await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
	let client = await loadSavedCredentialsIfExist();
	if (client) {
		return client;
	}
	client = await authenticate({
		scopes: SCOPES,
		keyfilePath: CREDENTIALS_PATH,
	});
	if (client.credentials) {
		await saveCredentials(client);
	}
	return client;
}

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listEvents(auth) {
	const calendar = google.calendar({ version: 'v3', auth });
	const response = await calendar.events.list({
		calendarId: 'primary',
		timeMin: new Date().toISOString(),
		maxResults: 10,
		singleEvents: true,
		orderBy: 'startTime',
	});
	const events = response.data.items;
	if (!events || events.length === 0) {
		console.log('No hay eventos cercanos encontrados');
		client.create({ body: 'No hay eventos cercanos encontrados', from: numberFron, to: numberFor }).then(message => console.log(message.sid));
		return;
	}

	const messageBoddy = events.map((event, i) => {
		const start = newDateFormat(event.start.dateTime || event.start.date);
		return start + ' - ' + event.summary;
	}).filter(element => {

		const splitedString = element.split(", ");
		const dateString = splitedString[0];
		const date = new Date();
		const day = date.getDate().toString();
		const month = (date.getMonth() + 1).toString();
		const year = date.getFullYear().toString();
		const myDateString = day + '/' + month + '/' + year;

		if (dateString === myDateString) {
			return true;
		}
	});
	if (messageBoddy.length !== 0) {
		client.create({ body: messageBoddy.join(', '), from: numberFron, to: numberFor }).then(message => console.log(message.sid));
	}
}

authorize().then(logIn => {
	listEvents(logIn)
}).catch(console.error);


function newDateFormat(date) { 
	date = new Date(date);
	return date.toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });
};

