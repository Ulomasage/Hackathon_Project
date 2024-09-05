const joiValidation = require("@hapi/joi");



exports.signUpValidator = async (req, res, next) => {
  const emergencyContactSchema = joiValidation.object({
    name: joiValidation.string().required().messages({
      "any.required": "Name is required for emergency contact.",
      "string.empty": "Name cannot be an empty string.",
    }),
    number: joiValidation.string().required().regex(/^\d{10,11}$/).messages({
      "any.required": "Number is required for emergency contact.",
      "string.empty": "Number cannot be an empty string.",
      "string.pattern.base": "Number must be a valid phone number.",
    }),
    relation: joiValidation.string().required().messages({
      "any.required": "Relation is required for emergency contact.",
      "string.empty": "Relation cannot be an empty string.",
    }),
  });

  const emergencyEmailSchema = joiValidation.object({
    name: joiValidation.string().required().messages({
      "any.required": "Name is required for emergency email.",
      "string.empty": "Name cannot be an empty string.",
    }),
    email: joiValidation.string().email().required().messages({
      "any.required": "Email is required for emergency email.",
      "string.empty": "Email cannot be an empty string.",
      "string.email": "Invalid email format for emergency email.",
    }),
    relation: joiValidation.string().required().messages({
      "any.required": "Relation is required for emergency email.",
      "string.empty": "Relation cannot be an empty string.",
    }),
  });

  const Schema = joiValidation.object({
    fullName: joiValidation.string().min(3).required().trim().pattern(new RegExp(/^[^\s].+[^\s]$/)).messages({
      "any.required": "Fullname is required.",
      "string.empty": "Fullname cannot be an empty string.",
      "string.min": "Full name must be at least 3 characters long.",
      "string.pattern.base": "Full name cannot start or end with a whitespace.",
    }),
    email: joiValidation
      .string()
      .email()
      .min(7)
      .required()
      .messages({
        "any.required": "Please kindly fill your email address.",
        "string.empty": "Email cannot be empty.",
        "string.email": "Invalid email format. Please enter a valid email address.",
      }),
    password: joiValidation
      .string()
      .required()
      .min(8)
      .max(50)
      .messages({
        "string.empty": "Password cannot be empty.",
      }),
    confirmPassword: joiValidation
      .string()
      .required()
      .min(8)
      .max(50)
      .messages({
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
    EmergencyPhoneNumbers: joiValidation
      .array()
      .min(3)
      .max(5)
      .items(emergencyContactSchema)
      .required()
      .custom((value, helpers) => {
        const phoneNumbers = value.map(contact => contact.number);
        const uniqueNumbers = new Set(phoneNumbers);
        if (uniqueNumbers.size !== phoneNumbers.length) {
          return helpers.message("please enter a different phoneNumber, we cannot have the same numers in an emergency contact");
        }
        return value;
      })
      .messages({
        "array.min": "Please enter at least 3 emergency phone numbers.",
        "array.max": "Please enter at most 5 emergency phone numbers.",
      }),
    EmergencyEmails: joiValidation
      .array()
      .min(3)
      .max(5)
      .items(emergencyEmailSchema)
      .required()
      .custom((value, helpers) => {
        const emails = value.map(contact => contact.email);
        const uniqueEmails = new Set(emails);
        if (uniqueEmails.size !== emails.length) {
          return helpers.message("please enter a different Emails, we cannot have the same Email in an emergency contact.");
        }
        return value;
      })
      .messages({
        "array.min": "Please enter at least 3 emergency emails.",
        "array.max": "Please enter at most 5 emergency emails.",
      }),
    // profilePicture: joiValidation.string().uri().required().messages({
    //   "any.required": "Profile picture is required.",
    //   "string.uri": "Profile picture must be a valid URL.",
    // }),
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
      "any.required": "please provide your email address",
      "string.empty": "email cannot be empty",
      "string.email":"invalid email format. please enter a valid email address",
    }),
    password: joiValidation
      .string()
      .required()
      .min(8)
      .max(50)
      // .regex(
      //   /^(?=.[a-z])(?=.[A-Z])(?=.[0-9])(?=.[!@#$%^&(),.?":{}|<>])[A-Za-z0-9!@#$%^&(),.?":{}|<>]{8,50}$/
      // )
      .messages({
        "string.pattern.base":
          "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",
        "string.empty": "Password cannot be empty",
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