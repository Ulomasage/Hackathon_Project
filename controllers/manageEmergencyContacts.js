const UserModel = require('../models/userModel');
const fs = require('fs')
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken');

const addEmergencyContact = async (req, res) => {
    try {
      const userId = req.user.id || req.user._id || req.user.userId;
      const { name, phoneNumber, email, relation } = req.body;
  
      // Validate if all required fields are filled
      if (!name || !phoneNumber || !email || !relation) {
        return res.status(400).json({
          message: "Please fill all required fields: name, phone number, email, and relation.",
        });
      }
  
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Please provide a valid email address." });
      }
  
      // Validate phone number format (adjust regex based on desired phone number format)
      const phoneRegex = /^[0-9]{10,15}$/;
      if (!phoneRegex.test(phoneNumber)) {
        return res.status(400).json({ message: "Please provide a valid phone number." });
      }
  
      const user = await UserModel.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Ensure EmergencyContacts is initialized as an empty array if not set
      user.EmergencyContacts = user.EmergencyContacts || [];
  
      // Check if the user has reached the maximum number of contacts
      if (user.EmergencyContacts.length >= 10) {
        return res.status(400).json({ message: "Cannot add more than 10 emergency contacts." });
      }
  
      // Check for duplicate phone number and email
      const phoneNumbers = user.EmergencyContacts.map(contact => contact.phoneNumber);
      const emails = user.EmergencyContacts.map(contact => contact.email);
  
      if (phoneNumbers.includes(phoneNumber)) {
        return res.status(400).json({ message: "This phone number is already added as an emergency contact." });
      }
  
      if (emails.includes(email)) {
        return res.status(400).json({ message: "This email is already added as an emergency contact." });
      }
  
      // Get existing contact IDs and find the next available ID
      const existingContactIds = user.EmergencyContacts.map(contact => parseInt(contact.contactId, 10)).sort((a, b) => a - b);
      let newContactId = '001';
  
      for (let i = 1; i <= 10; i++) {
        const id = i.toString().padStart(3, '0');
        if (!existingContactIds.includes(i)) {
          newContactId = id;
          break;
        }
      }
  
      // Add new contact with the assigned contact ID
      user.EmergencyContacts.push({ name, phoneNumber, email, relation, contactId: newContactId });
      await user.save();
  
      return res.status(200).json({ message: "Emergency contact added successfully", contacts: user.EmergencyContacts });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
  

  const updateEmergencyContact = async (req, res) => {
    try {
      const userId = req.user.id || req.user._id || req.user.userId;
      const { contactId, name, phoneNumber, email, relation } = req.body;
  
      // Validate if contactId and at least one field to update are provided
      if (!contactId || (!name && !phoneNumber && !email && !relation)) {
        return res.status(400).json({
          message: "Please provide the contactId and at least one field to update: name, phone number, email, or relation."
        });
      }
  
      // If provided, validate email format
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({ message: "Please provide a valid email address." });
        }
      }
  
      // If provided, validate phone number format
      if (phoneNumber) {
        const phoneRegex = /^[0-9]{10,15}$/;
        if (!phoneRegex.test(phoneNumber)) {
          return res.status(400).json({ message: "Please provide a valid phone number." });
        }
      }
  
      const user = await UserModel.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Find the contact by contactId
      const contactIndex = user.EmergencyContacts.findIndex(contact => contact.contactId === contactId);
  
      if (contactIndex === -1) {
        return res.status(404).json({ message: "Emergency contact not found" });
      }
  
      // Check for duplicates
      const existingContacts = user.EmergencyContacts.filter(contact => contact.contactId !== contactId);
      
      if (phoneNumber) {
        const phoneExists = existingContacts.some(contact => contact.phoneNumber === phoneNumber);
        if (phoneExists) {
          return res.status(400).json({ message: "This phone number is already used in your emergency contact." });
        }
      }
  
      if (email) {
        const emailExists = existingContacts.some(contact => contact.email === email);
        if (emailExists) {
          return res.status(400).json({ message: "This email address is already used in your emergency contact." });
        }
      }
  
      // Update the specific contact with the provided fields
      if (name) user.EmergencyContacts[contactIndex].name = name;
      if (phoneNumber) user.EmergencyContacts[contactIndex].phoneNumber = phoneNumber;
      if (email) user.EmergencyContacts[contactIndex].email = email;
      if (relation) user.EmergencyContacts[contactIndex].relation = relation;
  
      await user.save();
  
      return res.status(200).json({
        message: "Emergency contact updated successfully",
        contacts: user.EmergencyContacts
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
  
  

  const deleteEmergencyContact = async (req, res) => {
    try {
      const userId = req.user.id || req.user._id || req.user.userId;
      const { contactId } = req.body; // Get contactId from the request body
  
      // Validate contactId presence
      if (!contactId) {
        return res.status(400).json({ message: "Contact ID is required" });
      }
  
      // Find the user
      const user = await UserModel.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Check if the contact exists
      const contactIndex = user.EmergencyContacts.findIndex(contact => contact.contactId === contactId);
  
      if (contactIndex === -1) {
        return res.status(404).json({ message: "Emergency contact not found" });
      }
  
      // Ensure there are more than 5 contacts before deleting
      if (user.EmergencyContacts.length <= 5) {
        return res.status(400).json({ message: "Cannot delete contact. You must have at least 5 emergency contacts." });
      }
  
      // Remove the contact by contactId
      user.EmergencyContacts.splice(contactIndex, 1);
  
      // Save the updated user document
      await user.save();
  
      return res.status(200).json({
        message: "Emergency contact deleted successfully",
        contacts: user.EmergencyContacts
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
  

  module.exports={
    addEmergencyContact,
    updateEmergencyContact,
    deleteEmergencyContact
  }
