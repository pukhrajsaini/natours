const nodemailer = require('nodemailer');

const sendEmail = async options => {
  // 1) define the transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
    // activate in gmail 'less secure app' Option

  })
  // 2) define the email options

  const mailOptions = {
    from: 'Pukhraj Saini<pukhraj.saini97@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.text,
    // html:
  }
  // 3) actually send the email
  await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;