require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Nodemailer transporter setup (using environment variables for security)
const transporter = nodemailer.createTransport({
    service: "Gmail", // Replace with the email service you’re using (e.g., "Gmail", "Yahoo")
    auth: {
        user: process.env.EMAIL_USER, // Set in environment variables
        pass: process.env.EMAIL_PASS  // Set in environment variables
    }
});

// POST endpoint to handle contact form data
app.post("/api/contact", (req, res) => {
    const { name, email, message, phone } = req.body;

    // Define email content
    const mailOptions = {
        from: email, // Sender's email
        to: "srinithyavaddi@visaira.com", // Admin's email to receive submissions
        subject: "New Contact Form Submission",
        text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending email:", error);
            res.status(500).json({ message: "Failed to send email" });
        } else {
            console.log("Email sent:", info.response);
            res.status(200).json({ message: "Form data received and email sent successfully" });
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
