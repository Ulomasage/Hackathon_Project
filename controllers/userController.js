const UserModel = require('../models/userModel');
const fs = require('fs')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cloudinary = require('../utils/cloudinary.js')
const sendMail = require(`../helpers/sendMail.js`);
const { signUpTemplate,verifyTemplate,} = require(`../helpers/htmlTemplate.js`);


exports.registerUser = async (req, res) => {
  try {
      const {fullName,email,password,address,gender,phoneNumber,confirmPassword,EmergencyPhoneNumbers,EmergencyEmails} = req.body;
      if(!fullName || !email || !password || !address || !gender || !phoneNumber || !confirmPassword){
          return res.status(400).json({message:"kindly enter all details"})
      };
      const existingUser = await UserModel.findOne({email})
      if(existingUser){
      return res.status(400).json({message:"user already exist"})
      }
      if(confirmPassword !== password){
        return res.status(400).json({message:"password does not match, kindly fill in your password"})
       }else{
      const saltedPassword = await bcrypt.genSalt(12)
      const hashedPassword = await bcrypt.hash(password,saltedPassword)
       
      
       const user = new UserModel({
          fullName,
          address,
          gender,        
          email:email.toLowerCase(),
          password:hashedPassword,
          phoneNumber,
          EmergencyPhoneNumbers,
          EmergencyEmails
      })
      const userToken = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "20 Minutes" }
    );
    const verifyLink = `${req.protocol}://${req.get("host")}/api/v1/verify/${userToken}`;
    await user.save();
    await sendMail({
        subject: `Kindly Verify your mail`,
        email: user.email,
        html: signUpTemplate(verifyLink, user.firstName),
    });
    const Quote = ["Empower yourself with ALERTIFY, where a single tap transforms your vigilance into action. Together, we can turn awareness into safety and make our communities stronger, one alert at a time."];

  const randomQuote = Quote[Math.floor(Math.random() * Quote.length)];

      res.status(201).json({
          status:'created successfully',
          message: `Welcome ${user.fullName}!,${randomQuote}. kindly check your mail to access your link to verify your account`,
          data: user,
      });
  }
  } catch (error) {
      res.status(500).json({
          message: error.message
      })
  }
}


exports.verifyEmail = async (req, res) => {
  try {
      // Extract the token from the request params
      const { token } = req.params;
      // Extract the email from the verified token
      const { email } = jwt.verify(token, process.env.JWT_SECRET);
      // Find the user with the email
      const user = await UserModel.findOne({ email });
      // Check if the user is still in the database
      if (!user) {
          return res.status(404).json({
              message: "User not found",
          });
      }
      // Check if the user has already been verified
      if (user.isVerified) {
          return res.status(400).json({
              message: "User already verified",
          });
      }
      // Verify the user
      user.isVerified = true;
      // Save the user data
      await user.save();
      // Send a success response
      res.status(200).json({
          message: "User verified successfully",
      });
  } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
          return res.json({ message: "Link expired." });
      }
      res.status(500).json({
          message: error.message,
      });
  }
};

exports.logInUser = async (req, res) => {
  try {
      const { email, password } = req.body;
      const existingUser = await UserModel.findOne({
          email
      });
      if (!existingUser) {
          return res.status(404).json({
              message: "User not found."}); }

      const confirmPassword = await bcrypt.compare(password,existingUser.password);
      if (!confirmPassword) {
          return res.status(404).json({
              message: "Incorrect Password." });}
      if (!existingUser.isVerified) {
          return res.status(400).json({
              message:
                  "User not verified, Please check you email to verify your account.",
          });
      }
      const token = await jwt.sign(
          {
              userId: existingUser._id,
              email: existingUser.email,
          },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
      );

      res.status(200).json({
          message: "Login successfully",
          data: existingUser,
          token,
      });
  } catch (error) {
      res.status(500).json({
          message: error.message,
      });
  }
};

exports.resendVerification = async (req, res) => {
  try {
      const { email } = req.body;
      // Find the user with the email
      const user = await UserModel.findOne({ email });
      // Check if the user is still in the database
      if (!user) {
          return res.status(404).json({
              message: "User not found"
          });
      }
      // Check if the user has already been verified
      if (user.isVerified) {
          return res.status(400).json({
              message: "User already verified."
          });
      }
      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
          expiresIn: "20mins"
      });
      const verifyLink = `${req.protocol}://${req.get(
          "host"
      )}/api/v1/verify/${token}`;
      let mailOptions = {
          email: user.email,
          subject: "Verification email",
          html: verifyTemplate(verifyLink, user.fullName),
      };
      // Send the the email
      await sendMail(mailOptions);
      // Send a success message
      res.status(200).json({
          message: "Verification email resent successfully.",
      });
  } catch (error) {
      res.status(500).json({
          message: error.message,
      });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
      // Extract the email from the request body
      const { email } = req.body;
      // Check if the email exists in the database
      const user = await UserModel.findOne({ email });
      if (!user) {
          return res.status(404).json({
              message: "User not found"
          });
      }
      // Generate a reset token
      const resetToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
          expiresIn: "30m",
      });
      const resetLink = `${req.protocol}://${req.get(
          "host"
      )}/api/v1/user/reset-password/${resetToken}`;
      // Send reset password email
      const mailOptions = {
          email: user.email,
          subject: "Password Reset",
          html: forgotPasswordTemplate(resetLink, user.fullName),
      };
      //   Send the email
      await sendMail(mailOptions);
      //   Send a success response
      res.status(200).json({
          message: "Password reset email sent successfully.",
      });
  } catch (error) {
      res.status(500).json({
          message: error.message
      });
  }
};

exports.resetPassword = async (req, res) => {
  try {
      const { token } = req.params;
      const { password } = req.body;
      // Verify the user's token and extract the user's email from the token
      const { email } = jwt.verify(token, process.env.JWT_SECRET);
      // Find the user by ID
      const user = await UserModel.findOne({ email });
      if (!user) {
          return res.status(404).json({
              message: "User not found",
          });
      }
      // Salt and hash the new password
      const saltedRound = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, saltedRound);
      // Update the user's password
      user.password = hashedPassword;
      // Save changes to the database
      await user.save();
      // Send a success response
      res.status(200).json({
          message: "Password reset successful",
      });
  } catch (error) {
      res.status(500).json({
          message: error.message,
      });
  }
};

exports.changePassword = async (req, res) => {
  try {
      const { token } = req.params;
      const { password, existingPassword } = req.body;
      // Verify the user's token and extract the user's email from the token
      const { email } = jwt.verify(token, process.env.JWT_SECRET);
      // Find the user by ID
      const user = await UserModel.findOne({ email });
      if (!user) {
          return res.status(404).json({
              message: "User not found.",
          });
      }
      // Confirm the previous password
      const isPasswordMatch = await bcrypt.compare(
          existingPassword,
          user.password
      );
      if (!isPasswordMatch) {
          return res.status(401).json({
              message: "Existing password does not match.",
          });
      }

      // Salt and hash the new password
      const saltedRound = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, saltedRound);

      // Update the user's password
      user.password = hashedPassword;

      const resetLink = `${req.protocol}://${req.get(
          "host"
      )}/api/v1/user/change-password/${resetToken}`;

      // Send reset password email
      const mailOptions = {
          email: user.email,
          subject: "Password Chnaged Successfully",
          html: changePasswordTemplate(user.fullName),
      };
      //   Send the email
      await sendMail(mailOptions);
      // Save the changes to the database
      await user.save();
      //   Send a success response
      res.status(200).json({
          message: "Password changed successful",
      });
  } catch (error) {
      res.status(500).json({
          message: error.message,
      });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const {userId} = req.params;
    const { firstName, lastName, phoneNumber, address} = req.body;
    const data = await UserModel.findById(userId)
    if(!data){
      return res.status(404).json({message:`user not found`})
    }
      data.firstName = firstName || data.firstName,
      data.lastName = lastName || data.lastName,
      data.phoneNumber = phoneNumber || data.phoneNumber,
      data.address = address || data.address
      await data.save()
    // Check if a file is uploaded
    if (req.file) {
      const cloudProfile = await cloudinary.uploader.upload(req.file.path, { folder: "user_dp" });
      data.profilePicture = {
        pictureUrl: cloudProfile.secure_url
      };
    }
    const updatedUser = await UserModel.findByIdAndUpdate(userId, data, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: `User with ID:${userId} not found. `});
    }

    res.status(200).json({
      message: `User with ID:${userId} has updated successfully.`,
       data:updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });}
};;
exports.getAllUsers = async(req,res)=>{
  try {
      const allusers = await UserModel.find()
      if(allusers.length <=0){
          return res.status(400).json({
              message:"No available registered users"
          })
      }
      res.status(200).json({
          message:'List of all users in the database',
          totalUsersRegistered:allusers.length,
          data:allusers
      })
  } catch (error) {
      res.status(500).json(error.message)
  }
}



exports.removeUser = async(req,res)=>{
  try {
      const {userId} = req.params
      const user = await UserModel.findById(userId)
      if(!user){
          res.status(404).json({
              message:'User not found'
          })
         }

      const deletedUser = await UserModel.findByIdAndDelete(userId)
      res.status(200).json({
          message:'User deleted successfully',
      })
  } catch (error) {
      res.status(500).json(error.message)
  }
}


exports.getOneUser = async (req, res) => {
  try {
      const { userId } = req.params
      const oneUser = await UserModel.findOne(userId);
      if(!oneUser){
          return res.status(404).json({
              message: 'User not found'
          })
      }
      res.status(200).json({
          message: 'Below is the one user found',
          data: oneUser
      })
  } catch (error) {
      res.status(500).json({
          message: error.message
      })
  }
}


exports.logOut = async (req, res) => {
  try {
      const auth = req.headers.authorization;
      const token = auth.split(' ')[1];

      if(!token){
          return res.status(401).json({
              message: 'invalid token'
          })
      }
      // Verify the user's token and extract the user's email from the token
      const { email } = jwt.verify(token, process.env.JWT_SECRET);
      // Find the user by ID
      const user = await UserModel.findOne({ email });
      if (!user) {
          return res.status(404).json({
              message: "User not found"
          });
      }
      user.blackList.push(token);
      // Save the changes to the database
      await user.save();
      //   Send a success response
      res.status(200).json({
          message: "User logged out successfully."
      });
  } catch (error) {
      res.status(500).json({
          message: error.message
      });
  }
}