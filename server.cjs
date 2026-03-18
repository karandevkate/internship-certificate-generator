const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;

app.use(bodyParser.json({ limit: '50mb' }));

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
  const { candidate, imageData } = req.body;

  if (!candidate || !candidate.email || !imageData) {
    return res.status(400).json({ error: 'Missing candidate details or image data' });
  }

  const base64Data = imageData.replace(/^data:image\/png;base64,/, "");

  const mailOptions = {
    from: emailConfig.user,
    to: candidate.email,
    subject: `Internship Certificate - ${candidate.name}`,
    text: `Dear ${candidate.name},\n\nPlease find your internship certificate for the ${candidate.module} module attached.\n\nBest Regards,\nFirst Quad Tech Solutions`,
    attachments: [
      {
        filename: `Certificate_${candidate.name.replace(/\s+/g, '_')}.png`,
        content: base64Data,
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
