require('dotenv').config();
const csv = require('csv-parser');
const fs = require('fs');
const nodemailer = require('nodemailer');
const results = [];
const headers = ['name', 'label', 'created_at', 'email', 'has_website', 'website_url', 'district', 'phone_number'];
const sentEmailsFile = 'sent_emails.json';
let sentEmails = [];

if (fs.existsSync(sentEmailsFile)) {
	sentEmails = JSON.parse(fs.readFileSync(sentEmailsFile, { encoding: 'utf8' }));
}

let emailTemplate;
let emailObject;

let transporter = nodemailer.createTransport({
	service: process.env.TRANSPORTER_SERVICE,
	auth: {
		user: process.env.TRANSPORTER_MAIL,
		pass: process.env.TRANSPORTER_PASS,
	},
});

let noWebsite = JSON.parse(fs.readFileSync('templates/noWebsite.json', { encoding: 'utf8' }));
let hasWebsite = JSON.parse(fs.readFileSync('templates/hasWebsite.json', { encoding: 'utf8' }));

const sendMail = ({ name, email, has_website }) => {
	const sentEmail = sentEmails.find((e) => e.email === email);
	if (sentEmail) {
		console.log(`Email already sent to ${email}, skipping...`);
		return Promise.resolve();
	}
	const { object, msg } = has_website === 'Non' ? noWebsite : hasWebsite;
	const emailTemplate = msg.replace('{ENTERPRISE_NAME}', name);
	const mailOptions = {
		from: 'Andrew Mathieu',
		to: email,
		subject: object,
		text: emailTemplate,
	};
	return transporter.sendMail(mailOptions).then(() => {
		const sentDate = new Date().toISOString();
		sentEmails.push({ email, sentDate });
		fs.writeFileSync(sentEmailsFile, JSON.stringify(sentEmails, null, 2));
		console.log(`Email sent to ${email}`);
	});
};

// Lecture du fichier CSV
fs.createReadStream('data.csv')
	.pipe(csv(headers))
	.on('data', (data) => {
		if (!data.phone_number) {
			delete data.phone_number;
		}
		if (!data.website_url) {
			delete data.website_url;
		}
		results.push(data);
	})
	.on('end', () => {
		const promises = results.map((prospect) => sendMail(prospect));
		Promise.all(promises)
			.then((results) => {
				console.log('All emails sent successfully');
			})
			.catch((error) => {
				console.error('Error sending emails:', error);
			});
	});
