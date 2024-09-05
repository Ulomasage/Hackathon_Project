exports.signUpTemplate=(verifyLink,fullName)=>{
    return `
    
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Welcome to ALERTIFY, your number one trusted security brand</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #2c2c2c; /* Dark background */
            margin: 0;
            padding: 0;
        }
        .container {
            width: 80%;
            margin: 20px auto; /* Add some top margin */
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            background-color: #f4f4f4; /* Light grey background */
        }
        .header {
            background: #333333;
            padding: 10px;
            text-align: center;
            border-bottom: 1px solid #ddd;
            color: #ffffff;
        }
        .content {
            padding: 20px;
            color: #333333;
        }
        .footer {
            background: #333333;
            padding: 10px;
            text-align: center;
            border-top: 1px solid #ddd;
            font-size: 0.9em;
            color: #cccccc;
        }
        .button {
            display: inline-block;
            background-color: #000000;
            color: #ffffff;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to ALERTIFY!</h1>
        </div>
        <div class="content">
            <p>Hello ${fullName},</p>
            <p>Thank you for signing up on our platform. We are excited to have you on board.</p>
            <p>Please click the button below to verify your account:</p>
            <p>
                <a href="${verifyLink}" class="button">Verify My Account</a>
            </p>
            <p>If you did not create an account, please ignore this email.</p>
            <p>Best regards,<br> ALERTIFY TEAM </P>
            </p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} . All rights reserved.</p>
            
        </div>
    </div>
</body>
</html>
    
    `
}


exports.verifyTemplate = (verifyLink, fullName) => {
    return `
    <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Welcome to ALERTIFY, your number one trusted security brand</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #2c2c2c; /* Dark background */
            margin: 0;
            padding: 0;
        }
        .container {
            width: 80%;
            margin: 20px auto; /* Add some top margin */
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            background-color: #f4f4f4; /* Light grey background */
        }
        .header {
            background: #333333;
            padding: 10px;
            text-align: center;
            border-bottom: 1px solid #ddd;
            color: #ffffff;
        }
        .content {
            padding: 20px;
            color: #333333;
        }
        .footer {
            background: #333333;
            padding: 10px;
            text-align: center;
            border-top: 1px solid #ddd;
            font-size: 0.9em;
            color: #cccccc;
        }
        .button {
            display: inline-block;
            background-color: #000000;
            color: #ffffff;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Verification Email</h1>
        </div>
        <div class="content">
            <p>Hello ${fullName},</p>
            <p>Your verification email.</p>
            <p>Please click the button below to verify your account:</p>
            <p>
                <a href="${verifyLink}" class="button">Verify My Account</a>
            </p>
            <p>If you did not create an account, please ignore this email.</p>
            <p>Best regards,<br> ALERTIFY TEAM </p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} . All rights reserved.</p>
            
        </div>
    </div>
</body>
</html>
    `
}

// emergencyContactTemplate.js
exports.emergencyContactTemplate = (userName, contactName) => {
    return `
      <html>
        <body>
          <h1>Hello ${contactName},</h1>
          <p>You have been added as an emergency contact by <strong>${userName}</strong> on the Alertify app.</p>
          <p>Please be prepared to receive notifications in case of any emergencies.</p>
          <br/>
          <p>Best regards,</p>
          <p>The Alertify Team</p>
        </body>
      </html>
    `;
  };


module.exports = function generateDistressTemplate(user, preciseLocation, deviceInfo) {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9;">
            <header style="background-color: red; color: white; text-align: center; padding: 10px 0;">
                <h1 style="margin: 0;">Distress Alert!</h1>
            </header>
            
            <section style="padding: 20px; background-color: #e0e0e0; color: #333;">
                <p><strong>The user ${user.fullName} is in danger.</strong> Please contact them immediately.</p>
                <p><strong>Location:</strong> ${preciseLocation}</p>
                <p><strong>Device Type:</strong> ${deviceInfo.deviceType}</p>
                <p><strong>User Agent:</strong> ${deviceInfo.userAgent}</p>
                <p><strong>Phone Number:</strong> ${user.phoneNumber}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <img src="${user.profilePic}" alt="Profile Picture" style="width: 100px; height: auto;" />
            </section>
            
            <footer style="background-color: #333; color: #aaa; text-align: center; padding: 10px 0;">
                <p>&copy; 2024 Alertify. All rights reserved.</p>
            </footer>
        </div>
    `;
};

module.exports = function descriptionTemplate(user, description) {
    return `
        <html>
        <head>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: white;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                }
                .header {
                    background-color: #e53935; /* Sharp red for alert */
                    color: white;
                    text-align: center;
                    padding: 20px 10px;
                    font-size: 24px;
                    font-weight: bold;
                }
                .body {
                    background-color: #ffffff;
                    padding: 30px 20px;
                    color: #333;
                    font-size: 16px;
                    line-height: 1.6;
                }
                .body p {
                    margin: 0 0 20px;
                }
                .description {
                    background-color: #f1f1f1;
                    padding: 15px;
                    border-left: 4px solid #e53935;
                    font-style: italic;
                    color: #555;
                }
                .footer {
                    background-color: #333;
                    color: white;
                    text-align: center;
                    padding: 15px 10px;
                    font-size: 14px;
                }
                .footer p {
                    margin: 0;
                }
                .contact-info {
                    font-weight: bold;
                    color: #e53935;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    Distress Alert Update
                </div>
                <div class="body">
                    <p><strong>${user.fullName}</strong> has provided an additional description regarding their distress situation. Please review the details below:</p>
                    <div class="description">
                        <p><strong>Description:</strong> ${description}</p>
                    </div>
                    <p>For immediate contact, refer to the following details:</p>
                    <p><strong>Phone Number:</strong> <span class="contact-info">${user.phoneNumber}</span></p>
                    <p><strong>Email:</strong> <span class="contact-info">${user.email}</span></p>
                </div>
                <div class="footer">
                    <p>Distress Alert Service - Please act immediately</p>
                </div>
            </div>
        </body>
        </html>
    `;
}



