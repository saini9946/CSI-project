const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //create a transporter
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: 'vedicyadav1002@gmail.com',
      pass: 'devansh123',
    },
    //Activate in gmail "less secure app" option
  });

  //Define the email options
  const mailOptions = {
    from: '"Vedic Yadav "<vedicyadav1002@io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  //Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
