const jwt=require("jsonwebtoken")
const UserModel=require("../models/userModel")
require("dotenv").config()

exports.authentication = async (req, res, next) => {
  try {
      const auth = req.headers.authorization;
      
      // Check if the authorization header exists
      if (!auth) {
          return res.status(401).json({ message: "See admin for authorization" });
      }

      // Extract token from the authorization header (format: Bearer <token>)
      const token = auth.split(" ")[1];
      if (!token) {
          return res.status(400).json({ message: "Invalid token" });
      }

      // Verify the token using JWT_SECRET
      const decodeToken = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by ID in the decoded token
      const user = await UserModel.findById(decodeToken.id);  // Assuming the token has the field 'id'
      if (!user) {
          return res.status(400).json({ message: "Authentication failed: user not found" });
      }

      // Check if the token is blacklisted (e.g., in case of logout or token expiry)
      if (user.blackList && user.blackList.includes(token)) {
          return res.status(401).json({ message: "Session expired: please login to continue" });
      }

      // Attach the decoded token and user info to the request object for use in next middleware/route
      req.user = decodeToken;
      req.authenticatedUser = user;
      
      // Proceed to the next middleware or route handler
      next();

  } catch (error) {
      // Handle JWT errors specifically
      if (error instanceof jwt.JsonWebTokenError) {
          return res.status(401).json({ message: "Session timeout or invalid token" });
      }

      // Handle any other errors
      res.status(500).json({ message: error.message });
  }
};


exports.isAdmin = async (req, res, next) => {
    try {
      if (req.user.isAdmin) {
        next();
      } else {
        res.status(403).json({ message: "Unauthorized: Not an admin" });
      }
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };


  
  exports.getUserIdFromToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from headers

    if (!token) {
        return res.status(403).json({ message: 'Token required for authorization' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
        console.log(decoded); // Log the decoded token to see its structure
        req.user = decoded; // Attach the decoded user to req.user
        next(); // Continue to the controller
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};



