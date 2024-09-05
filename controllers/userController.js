const UserModel = require('../models/userModel');
const fs = require('fs')
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken');
const cloudinary = require('../utils/cloudinary.js')
const sendMail = require(`../helpers/sendMail.js`);
const { signUpTemplate,verifyTemplate,emergencyContactTemplate} = require(`../helpers/htmlTemplate.js`);
// exports.registerUser = async (req, res) => {
//     try {
//       const {
//         fullName,
//         email,
//         password,
//         address,
//         gender,
//         phoneNumber,
//         confirmPassword,
//         EmergencyPhoneNumbers, 
//         EmergencyEmails,       
//       } = req.body;
  
//       if (!fullName || !email || !password || !address || !gender || !phoneNumber || !confirmPassword) {
//         return res.status(400).json({ message: "Kindly enter all details" });
//       }
  
//       if (EmergencyPhoneNumbers.length < 3 || EmergencyPhoneNumbers.length > 5) {
//         return res.status(400).json({ message: "Please enter at least 3 and at most 5 emergency phone numbers" });
//       }
  
//       if (EmergencyEmails.length < 3 || EmergencyEmails.length > 5) {
//         return res.status(400).json({ message: "Please enter at least 3 and at most 5 emergency emails" });
//       }
  
//       const existingUser = await UserModel.findOne({ email });
//       if (existingUser) {
//         return res.status(400).json({ message: "User already exists" });
//       }
  
//       if (confirmPassword !== password) {
//         return res.status(400).json({ message: "Password does not match, kindly fill in your password" });
//       }

//       const createFolderResult = await cloudinary.api.create_folder('alertify');
//       let picture = {}; // Empty object for profile picture
//       if (req.files && req.files.profilePicture) {
//           picture = await new Promise((resolve, reject) => {
//               cloudinary.uploader.upload(req.files.profilePicture.tempFilePath, {
//                   folder: 'alertify', // Specify the folder name here
//                   allowed_formats: ['txt', 'doc', 'pdf', 'docx', 'png', 'jpeg'], // Allow these file formats
//                   max_file_size: 2000000
//               }, (error, result) => {
//                   if (error) {
//                       reject(error);
//                   } else {
//                       resolve(result);
//                   }
//               });
//           });
//       }

  
//       const saltedPassword = await bcrypt.genSalt(12);
//       const hashedPassword = await bcrypt.hash(password, saltedPassword);
  
//       const user = new UserModel({
//         fullName,
//         address,
//         gender,
//         email: email.toLowerCase(),
//         password: hashedPassword,
//         phoneNumber,
//         profilePicture: { public_id: picture.public_id, url: picture.url },
//         EmergencyPhoneNumbers,  
//         EmergencyEmails         
//       });
  
//       const userToken = jwt.sign(
//         { id: user._id, email: user.email },
//         process.env.jwt_secret,
//         { expiresIn: "3 Minutes" }
//       );
  
//       const verifyLink = `${req.protocol}://${req.get("host")}/api/v1/user/verify/${userToken}`;
//       await user.save();
//       await sendMail({
//         subject: `Kindly Verify your mail`,
//         email: user.email,
//         html: signUpTemplate(verifyLink, user.fullName),
//       });
  
//       res.status(201).json({
//         status: "created successfully",
//         message: `Welcome ${user.fullName} to ALERTIFY, kindly check your mail to access your link to verify your account`,
//         data: user,
//       });
//     } catch (error) {
//       res.status(500).json({
//         message: error.message,
//       });
//     }
//   };


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
        EmergencyEmails,       
      } = req.body;
  
      // Check for all required fields
      if (!fullName || !email || !password || !address || !gender || !phoneNumber || !confirmPassword) {
        return res.status(400).json({ message: "Kindly enter all details" });
      }
  
      // Emergency contacts length check
      if (EmergencyPhoneNumbers.length < 3 || EmergencyPhoneNumbers.length > 5) {
        return res.status(400).json({ message: "Please enter at least 3 and at most 5 emergency phone numbers" });
      }
  
      if (EmergencyEmails.length < 3 || EmergencyEmails.length > 5) {
        return res.status(400).json({ message: "Please enter at least 3 and at most 5 emergency emails" });
      }

      // Check if the user already exists
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
  
      // Check if passwords match
      if (confirmPassword !== password) {
        return res.status(400).json({ message: "Password does not match, kindly fill in your password" });
      }

   

      // Hash the password
      const saltedPassword = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, saltedPassword);
  
      // Create new user
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
  
      // Create a token for the user
      const userToken = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "3 Minutes" }
      );
  
      const verifyLink = `${req.protocol}://${req.get("host")}/api/v1/user/verify/${userToken}`;
      
      // Save the user
      await user.save();

      // Send verification email
      await sendMail({
        subject: `Kindly Verify your mail`,
        email: user.email,
        html: signUpTemplate(verifyLink, user.fullName),
      });
  

       for (const emergencyEmail of EmergencyEmails) {
        const { name, email: contactEmail } = emergencyEmail;
        const htmlContent = emergencyContactTemplate(fullName, name); 
        await sendMail({
          subject: `You have been added as an emergency contact on Alertify`,
          email: contactEmail,
          html: htmlContent,
        });
      }
      // Respond with success
      res.status(201).json({
        status: "created successfully",
        message: `Welcome ${user.fullName} to ALERTIFY, kindly check your mail to access your link to verify your account`,
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
};

 


exports.logInUser = async(req,res)=>{
  try {
     const {email,password}=req.body
     if(!email || !password){
      return res.status(400).json({message:"kindly enter all details"})
  };
     const existingUser = await UserModel.findOne({email:email.toLowerCase()})
     if(!existingUser){
     return res.status(404).json({message:"user not found"})
     }

     const confirmPassword = await bcrypt.compare(password,existingUser.password)
     if(!confirmPassword){
      return res.status(400).json({message:"incorrect password"})
      }
      const token = await jwt.sign({userId:existingUser._id, email:existingUser.email, isAdmin: existingUser.isAdmin},process.env.JWT_SECRET,{expiresIn:"5d"})
      res.status(200).json({
          message:`${existingUser.fullName}, you have successfully logged into your account`, data:existingUser, token
         })

  } catch (error) {
      res.status(500).json(error.message)
  }
}

exports.makeAdmin = async(req,res)=>{
  try {
      const {userId} = req.params
      const user = await UserModel.findById(userId)
      if(!user){
          return res.status(404).json({message:"user not found"})
      }
      user.isAdmin = true
      await user.save()
      res.status(200).json({
          message:  `${user.fullName} is now an admin`, data:user
         })
  } catch (error) {
      res.status(500).json(error.message)
  }
}
exports.verifyEmail = async(req,res)=>{
  try {
     const {token} = req.params
     const {email}=jwt.verify(token,process.env.JWT_SECRET) 
     const user = await UserModel.findOne({email})
     if(!user){
      return res.status(404).json({message:"user not found"})
      }

      if(user.isVerified){
          return res.status(400).json({message:"user already verified"})
          }
      user.isVerified=true
      await user.save()

      res.status(200).json({
          message:"user verification successful", data:user
         })

  } catch (error) {
      if(error instanceof jwt.JsonWebTokenError){
          return res.status(400).json({message:"link expired"})
      }
      res.status(500).json(error.message) 
  }
}

exports.resendVerification = async(req,res)=>{
  try {
      const {email} = req.body
      const user = await UserModel.findOne({email})
      if(!user){
          return res.status(400).json({message:"user does not exist"})
      }    
      
      if(user.isVerified){
          return res.status(400).json({message:"user already verified"})
          }
      const token = await jwt.sign({userId:user._id, userEmail:user.email},process.env.JWT_SECRET,{expiresIn:"20mins"})  
      const verifyLink=`${req.protocol}://${req.get("host")}/api/v1/user/verify/${user._id}/${token}`   
      let mailOptions={
          email:user.email,
          subject:"verification email",
          html:verifyTemplate(verifyLink,user.firstname)
      }
     await sendMail(mailOptions)
      res.status(200).json({message:"Your verification link has been sent to your email"})
  } catch (error) {
      res.status(500).json(error.message) 
  }
}

// Forgot Password
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
      const resetToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: "30m" });

      // Send reset password email
      const mailOptions = {
          email: user.email,
          subject: "Password Reset",
          html: `Please click on the link to reset your password: <a href="${req.protocol}://${req.get("host")}/api/v1/user/reset-password/${resetToken}">Reset Password</a> link expires in 30 minutes`,
      };
      //   Send the email
      await sendMail(mailOptions);
      //   Send a success response
      res.status(200).json({
          message: `${user.fullName}, your new reset password has been sent to your email successfully`
      });
  } catch (error) {
      res.status(500).json({
          message: error.message
      });
  }
};

// Reset Password
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
              message: "User not found"
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
          message: `${user.fullName}, your Password has been reset successfully`
      });
  } catch (error) {
      res.status(500).json({
          message: error.message
      });
  }
};

// Change Password
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
              message: "User not found"
          });
      }
      // Confirm the previous password
      const isPasswordMatch = await bcrypt.compare(existingPassword, user.password);
      if (!isPasswordMatch) {
          return res.status(401).json({
              message: "Existing password does not match"
          });
      }
      // Salt and hash the new password
      const saltedRound = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, saltedRound);
      // Update the user's password
      user.password = hashedPassword;
      // Save the changes to the database
      await user.save();
      //   Send a success response
      res.status(200).json({
          message: `${user.fullName}, you have successfully changed your password`
      });
  } catch (error) {
      res.status(500).json({
          message: error.message
      });
  }
};

exports.updateUser = async (req, res) => {
    try {
        const { userId} = req.params;
        const { fullName,address,gender,phoneNumber } = req.body;
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                status:'not found',
                message:'user not found'
            });
        }
        const data = {
            fullName: fullName || user.fullName,
            address: address || user.address,
            gender: gender || user.gender,
            phoneNumber: phoneNumber || user.phoneNumber,
            profilePic: user.profilePic
        };
        if (req.file && req.file.profilePic) {
            const imagePublicId = user.profilePic.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(imagePublicId);  // Destroy old image
            const updateResponse = await cloudinary.uploader.upload(profilePic); 
            data.profilePic = updateResponse.secure_url;  // Update data with new image URL
        }
        const updatedUser = await UserModel.findByIdAndUpdate(userId, data, { new: true });
        res.status(200).json({
            status:'successful',
            message: 'User new details updated successfully',
            data: updatedUser
        });
    } catch (error) {
        res.status(500).json({
            status: 'Server Error',
            errorMessage: error.message,
        });
    }
};
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
