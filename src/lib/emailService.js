import { BrevoClient } from "@getbrevo/brevo";
import dotenv from "dotenv";
dotenv.config();

const brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY,
});

const sendEmail = async ({ to, subject, html }) => {
    await brevo.transactionalEmails.sendTransacEmail({
        sender: {
            email: process.env.EMAIL_USER,
            name: process.env.EMAIL_NAME || "Your App",
        },

        to: [
            {
                email: to,
            },
        ],

        subject,
        htmlContent: html,
    });
};

export { sendEmail };


/*import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});


const sendEmail = async ({to, subject, html}) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
    };

    await transporter.sendMail(mailOptions);
};

export {transporter, sendEmail};*/
