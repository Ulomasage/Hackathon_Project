const DescriptionModel = require('../models/descreptionModel');
const UserModel = require('../models/userModel');
const sendMail = require('../helpers/sendMail');
const twilioClient = require('../helpers/twiloConfig');

// Function to handle description submission
const submitDescription = async (req, res) => {
    const userId = req.user.id || req.user._id || req.user.userId; 
    const { description } = req.body;

    try {
        // Fetch user and their emergency contacts
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Save description to the database
        const newDescription = new DescriptionModel({
            userId: userId,
            description: description,
        });
        await newDescription.save();

        // Create distress alert update message
        const message = `
            <h1>Distress Alert Update!</h1>
            <p>The user ${user.fullName} provided an additional description.</p>
            <p><b>Description:</b> ${description}</p>
            <p><b>Phone Number:</b> ${user.phoneNumber}</p>
            <p><b>Email:</b> ${user.email}</p>
        `;

        // Iterate over merged EmergencyContacts to send emails and SMS
        const contactPromises = user.EmergencyContacts.map(contact => {
            const emailPromise = sendMail({
                email: contact.email,
                subject: 'Distress Alert Update',
                html: message,
            }).then(() => {
                console.log(`Email sent to ${contact.email}`);
            }).catch(error => {
                console.error(`Error sending email to ${contact.email}:`, error.message);
            });

            const smsPromise = twilioClient.messages.create({
                body: `Distress Alert Update! The user ${user.fullName} provided an additional description: "${description}".`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: contact.phoneNumber,
            }).then(() => {
                console.log(`SMS sent to ${contact.phoneNumber}`);
            }).catch(error => {
                console.error(`Error sending SMS to ${contact.phoneNumber}:`, error.message);
            });

            return Promise.all([emailPromise, smsPromise]);
        });

        // Await all email and SMS promises
        await Promise.all(contactPromises);

        res.json({ message: 'Description submitted and distress messages updated successfully' });

    } catch (error) {
        console.error('Error submitting description:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    submitDescription,
};