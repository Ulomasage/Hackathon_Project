const joiValidation = require("@hapi/joi");

exports.signUpValidator = async (req, res, next) => {
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
      "any.required": "please kindly fill your email address",
      "string.empty": "email cannot be empty",
      "string.email":
        "invalid email format. please enter a valid email address",
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
      confirmPassword: joiValidation
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
      address:joiValidation.string().required(),
     gender:joiValidation.string().required().valid("male","female"),
     phoneNumber:joiValidation.string().regex(/^\d{11}$/).message('Phone number must be exactly 11 digits') 
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