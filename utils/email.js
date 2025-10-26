const nodemailer = require('nodemailer');

async function sendEmail(options) {
  //create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //define the email options
  const mailOptions = {
    from: 'Natours <natours@example.com>', //fake email for the sandbox
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  //send the email
  await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;
