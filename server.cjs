const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;

app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

// Read credentials from email.txt
let emailConfig = {
  user: 'contact.firstquadtechsolutions@gmail.com',
  pass: 'iznqxxdtveduvovu'
};

try {
  const content = fs.readFileSync(path.join(__dirname, 'email.txt'), 'utf8');
  const lines = content.split('\n');
  lines.forEach(line => {
    if (line.startsWith('email:')) emailConfig.user = line.replace('email:', '').trim();
    if (line.startsWith('password:')) emailConfig.pass = line.replace('password:', '').trim();
  });
} catch (err) {
  console.error('Error reading email.txt, using default credentials');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailConfig.user,
    pass: emailConfig.pass,
  },
});

app.post('/api/send-email', async (req, res) => {
  const { candidate, certData, letterData } = req.body;

  if (!candidate || !candidate.email || !certData || !letterData) {
    return res.status(400).json({ error: 'Missing candidate details or image data' });
  }

  const certBase64 = certData.replace(/^data:image\/png;base64,/, "");
  const letterBase64 = letterData.replace(/^data:image\/png;base64,/, "");

  const mailOptions = {
    from: emailConfig.user,
    to: candidate.email,
    subject: `Internship Documents - ${candidate.name} | First Quad Tech Solutions`,
    text: `Dear ${candidate.salutation || 'Ms.'} ${candidate.name},\n\nCongratulations on completing your internship with First Quad Tech Solutions! Please find your Internship Certificate and Completion Letter attached.\n\nWe wish you all the best for your future endeavors.\n\nBest Regards,\nTeam First Quad Tech Solutions`,
    attachments: [
      {
        filename: `Certificate_${candidate.name.replace(/\s+/g, '_')}.png`,
        content: certBase64,
        encoding: 'base64'
      },
      {
        filename: `Completion_Letter_${candidate.name.replace(/\s+/g, '_')}.png`,
        content: letterBase64,
        encoding: 'base64'
      }
    ]
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: `Email sent to ${candidate.email}` });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

app.listen(port, () => {
  console.log(`Email server running at http://localhost:${port}`);
});
