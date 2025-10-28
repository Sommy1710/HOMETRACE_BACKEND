import { sendEmail } from "../../lib/emailService.js";

export const testEmail = async (req, res) => {
  try {
    await sendEmail({
      to: 'martinsomto2001@gmail.com', // Replace with a real test email
      subject: 'Test Email from API',
      html: '<h3>This is a test email from your Node.js API! 🚀</h3>',
    });

    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ error: 'Failed to send email.' });
  }
};