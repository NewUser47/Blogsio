const nodeMailer = require('nodemailer');

const sendEmail = async (options) => {
  //1 Create a transporter
  const transporter = nodeMailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    //ACTIVATE IN GMAIL - "less secure app" option
  });
  //2 Define email options
  const mailOptions = {
    from: 'Apoorv Agrawal <hello@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };
  //3 Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
