const joiValidation = require("@hapi/joi");

exports.signUpValidator = async (req, res, next) => {

  const emergencyContactSchema = joiValidation.object({
    name: joiValidation.string().required().messages({
      "any.required": "Name is required for emergency contact.",
      "string.empty": "Name cannot be an empty string.",
    }),
    phoneNumber: joiValidation.string().required().regex(/^\d{10,11}$/).messages({
      "any.required": "Phone number is required for emergency contact.",
      "string.empty": "Phone number cannot be an empty string.",
      "string.pattern.base": "Phone number must be a valid 10 or 11 digit number.",
    }),
    email: joiValidation.string().email().required().messages({
      "any.required": "Email is required for emergency contact.",
      "string.empty": "Email cannot be an empty string.",
      "string.email": "Invalid email format for emergency contact.",
    }),
    relation: joiValidation.string().required().messages({
      "any.required": "Relation is required for emergency contact.",
      "string.empty": "Relation cannot be an empty string.",
    }),
    contactId: joiValidation.string().regex(/^\d{3}$/).messages({
      "string.pattern.base": "Contact ID must be a valid three-digit number (e.g., 001, 002).",
    }),
  });

  // User Signup Schema
  const Schema = joiValidation.object({
    fullName: joiValidation.string().min(3).required().trim().pattern(new RegExp(/^[^\s].+[^\s]$/)).messages({
      "any.required": "Fullname is required.",
      "string.empty": "Fullname cannot be an empty string.",
      "string.min": "Full name must be at least 3 characters long.",
      "string.pattern.base": "Full name cannot start or end with a whitespace.",
    }),
    email: joiValidation.string().email().min(7).required().messages({
      "any.required": "Please kindly fill your email address.",
      "string.empty": "Email cannot be empty.",
      "string.email": "Invalid email format. Please enter a valid email address.",
    }),
    password: joiValidation.string().required().min(8).max(50).messages({
      "string.empty": "Password cannot be empty.",
    }),
    confirmPassword: joiValidation.string().required().min(8).max(50).messages({
      "string.empty": "Confirm password cannot be empty.",
    }),
    address: joiValidation.string().required().messages({
      "any.required": "Address is required.",
      "string.empty": "Address cannot be empty.",
    }),
    gender: joiValidation.string().required().valid("male", "female").messages({
      "any.required": "Gender is required.",
      "any.only": "Gender must be either 'male' or 'female'.",
    }),
    phoneNumber: joiValidation.string().regex(/^\d{11}$/).messages({
      "any.required": "Phone number is required.",
      "string.pattern.base": "Phone number must be exactly 11 digits.",
    }),
    EmergencyContacts: joiValidation.array()
      .min(5)
      .max(10)
      .items(emergencyContactSchema)
      .required()
      .custom((value, helpers) => {
        const phoneNumbers = value.map(contact => contact.phoneNumber);
        const emails = value.map(contact => contact.email);
        
        // Check for unique phone numbers
        const uniquePhoneNumbers = new Set(phoneNumbers);
        if (uniquePhoneNumbers.size !== phoneNumbers.length) {
          return helpers.message("Please enter different phone numbers. Duplicate numbers found.");
        }

        // Check for unique emails
        const uniqueEmails = new Set(emails);
        if (uniqueEmails.size !== emails.length) {
          return helpers.message("Please enter different emails. Duplicate emails found.");
        }

        return value;
      })
      .messages({
        "array.min": "Please enter at least 5 emergency contacts.",
        "array.max": "Please enter at most 10 emergency contacts.",
      }),
  });

  const { error } = Schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }
  next();
};

exports.logInValidator = async (req, res, next) => {
  const Schema = joiValidation.object({
    email: joiValidation.string().email().min(7).required().messages({
      "any.required": "Please provide your email address.",
      "string.empty": "Email cannot be empty.",
      "string.email": "Invalid email format. Please enter a valid email address.",
    }),
    password: joiValidation.string().required().min(8).max(50).messages({
      "string.empty": "Password cannot be empty.",
    }),
  });

  const { error } = Schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }
  next();
};
