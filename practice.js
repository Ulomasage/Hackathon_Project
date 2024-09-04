const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel'); // Adjust the path according to your project structure
const sendMail = require('../utils/sendMail'); // Adjust the path according to your project structure
const signUpTemplate = require('../templates/signUpTemplate'); // Adjust the path according to your project structure

exports.registerUser = async (req, res) => {
  try {
    const { 
      fullName, 
      email, 
      password, 
      address, 
      gender, 
      phoneNumber, 
      confirmPassword, 
      EmergencyPhoneNumbers, 
      EmergencyEmails 
    } = req.body;

    // Check if all required fields are provided
    if (!fullName || !email || !password || !address || !gender || !phoneNumber || !confirmPassword) {
      return res.status(400).json({ message: "Kindly enter all details" });
    }

    // Check if password and confirmPassword match
    if (confirmPassword !== password) {
      return res.status(400).json({ message: "Password does not match, kindly fill in your password" });
    }

    // Validate emergency contacts and emails
    const minContacts = 3;
    const maxContacts = 5;

    if (EmergencyPhoneNumbers.length < minContacts || EmergencyPhoneNumbers.length > maxContacts) {
      return res.status(400).json({ message: `Emergency phone numbers must be between ${minContacts} and ${maxContacts}.` });
    }

    if (EmergencyEmails.length < minContacts || EmergencyEmails.length > maxContacts) {
      return res.status(400).json({ message: `Emergency emails must be between ${minContacts} and ${maxContacts}.` });
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const saltedPassword = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, saltedPassword);

    // Create a new user
    const user = new UserModel({
      fullName,
      address,
      gender,
      email: email.toLowerCase(),
      password: hashedPassword,
      phoneNumber,
      EmergencyPhoneNumbers,
      EmergencyEmails
    });

    // Create a JWT token
    const userToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.jwt_secret,
      { expiresIn: "3m" } // Changed to 3 minutes
    );

    // Generate verification link
    const verifyLink = `${req.protocol}://${req.get("host")}/api/v1/user/verify/${userToken}`;

    // Save the user and send verification email
    await user.save();
    await sendMail({
      subject: "Kindly Verify Your Mail",
      email: user.email,
      html: signUpTemplate(verifyLink, user.fullName),
    });

    res.status(201).json({
      status: 'Created successfully',
      message: `Welcome ${user.fullName} to ALERTIFY. Kindly check your mail to access the link to verify your account.`,
      data: user,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel'); // Adjust the path according to your project structure
const sendMail = require('../utils/sendMail'); // Adjust the path according to your project structure
const signUpTemplate = require('../templates/signUpTemplate'); // Adjust the path according to your project structure

exports.registerUser = async (req, res) => {
  try {
    const { 
      fullName, 
      email, 
      password, 
      address, 
      gender, 
      phoneNumber, 
      confirmPassword, 
      EmergencyPhoneNumbers, 
      EmergencyEmails 
    } = req.body;

    // Check if all required fields are provided
    if (!fullName || !email || !password || !address || !gender || !phoneNumber || !confirmPassword) {
      return res.status(400).json({ message: "Kindly enter all details" });
    }

    // Check if password and confirmPassword match
    if (confirmPassword !== password) {
      return res.status(400).json({ message: "Password does not match, kindly fill in your password" });
    }

    // Validate emergency contacts and emails
    const minContacts = 3;
    const maxContacts = 5;

    if (EmergencyPhoneNumbers.length < minContacts || EmergencyPhoneNumbers.length > maxContacts) {
      return res.status(400).json({ 
        message: `Emergency phone numbers must be between ${minContacts} and ${maxContacts}. You provided ${EmergencyPhoneNumbers.length}.` 
      });
    }

    if (EmergencyEmails.length < minContacts || EmergencyEmails.length > maxContacts) {
      return res.status(400).json({ 
        message: `Emergency emails must be between ${minContacts} and ${maxContacts}. You provided ${EmergencyEmails.length}.` 
      });
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const saltedPassword = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, saltedPassword);

    // Create a new user
    const user = new UserModel({
      fullName,
      address,
      gender,
      email: email.toLowerCase(),
      password: hashedPassword,
      phoneNumber,
      EmergencyPhoneNumbers,
      EmergencyEmails
    });

    // Create a JWT token
    const userToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.jwt_secret,
      { expiresIn: "3m" } // Changed to 3 minutes
    );

    // Generate verification link
    const verifyLink = `${req.protocol}://${req.get("host")}/api/v1/user/verify/${userToken}`;

    // Save the user and send verification email
    await user.save();
    await sendMail({
      subject: "Kindly Verify Your Mail",
      email: user.email,
      html: signUpTemplate(verifyLink, user.fullName),
    });

    res.status(201).json({
      status: 'Created successfully',
      message: `Welcome ${user.fullName} to ALERTIFY. Kindly check your mail to access the link to verify your account.`,
      data: user,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
