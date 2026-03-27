const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendRegistrationEmail = async (email, name, password) => {
  const loginUrl = 'http://localhost:5173/'; // Frontend URL
  const mailOptions = {
    from: `"PlacementPro Admin" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to PlacementPro! 🎓 Your Login Credentials',
    html: `
      <div style="font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; color: #374151; line-height: 1.6; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
        <div style="text-align: center; padding-bottom: 25px; border-bottom: 2px solid #ede9fe; margin-bottom: 25px;">
          <h1 style="color: #4f46e5; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.5px;">PlacementPro</h1>
          <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 15px; font-weight: 500;">Your Career Journey Starts Here</p>
        </div>
        
        <p style="font-size: 16px;">Hello <strong style="color: #111827;">${name}</strong>,</p>
        
        <p style="font-size: 16px;">Welcome to PlacementPro! Your college administrator has successfully registered your academic profile in our placement tracking system.</p>
        
        <div style="background-color: #f9fafb; border-left: 4px solid #4f46e5; padding: 20px; margin: 30px 0; border-radius: 6px;">
          <h3 style="margin-top: 0; color: #111827; font-size: 18px; margin-bottom: 12px;">Your Login Credentials</h3>
          <p style="margin: 8px 0; font-size: 15px;"><strong>Email ID:</strong> <span style="background-color: #e0e7ff; color: #4338ca; padding: 3px 8px; border-radius: 4px; font-family: monospace; font-size: 14px;">${email}</span></p>
          <p style="margin: 8px 0; font-size: 15px;"><strong>Password:</strong> <span style="background-color: #e0e7ff; color: #4338ca; padding: 3px 8px; border-radius: 4px; font-family: monospace; font-size: 14px;">${password}</span></p>
        </div>
        
        <p style="font-size: 16px;">Please log in to your account to review your profile, check eligibility, and apply to upcoming placement drives and internship opportunities.</p>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="${loginUrl}" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.25); transition: background-color 0.2s;">Login to Dashboard</a>
        </div>
        
        <p style="font-size: 14px; color: #6b7280;">If you have any issues logging in, please contact your college placement coordinator.</p>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 13px;">
          &copy; ${new Date().getFullYear()} PlacementPro System. All rights reserved.
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to:', email);
    return info;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    // We don't throw error to prevent breaking the flow if email fails.
  }
};

const sendAdminRegistrationEmail = async (email, name, password) => {
  const loginUrl = 'http://localhost:5173/'; // Frontend URL
  const mailOptions = {
    from: `"PlacementPro System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to PlacementPro! 🏢 Admin Credentials',
    html: `
      <div style="font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; color: #374151; line-height: 1.6; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; padding-bottom: 25px; border-bottom: 2px solid #ede9fe; margin-bottom: 25px;">
          <h1 style="color: #4f46e5; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.5px;">PlacementPro</h1>
          <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 15px; font-weight: 500;">Enterprise Placement Management</p>
        </div>
        
        <p style="font-size: 16px;">Hello <strong style="color: #111827;">${name}</strong>,</p>
        
        <p style="font-size: 16px;">Welcome to PlacementPro! The platform owner has securely provisioned an administrative environment for your college.</p>
        <p style="font-size: 16px;">As a College Administrator, your dashboard allows you to manage student profiles, register hiring companies, and track all placement applications across your institution.</p>
        
        <div style="background-color: #f9fafb; border-left: 4px solid #4f46e5; padding: 20px; margin: 30px 0; border-radius: 6px;">
          <h3 style="margin-top: 0; color: #111827; font-size: 18px; margin-bottom: 12px;">Your Admin Credentials</h3>
          <p style="margin: 8px 0; font-size: 15px;"><strong>Admin Email:</strong> <span style="background-color: #e0e7ff; color: #4338ca; padding: 3px 8px; border-radius: 4px; font-family: monospace; font-size: 14px;">${email}</span></p>
          <p style="margin: 8px 0; font-size: 15px;"><strong>Admin Password:</strong> <span style="background-color: #e0e7ff; color: #4338ca; padding: 3px 8px; border-radius: 4px; font-family: monospace; font-size: 14px;">${password}</span></p>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="${loginUrl}" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">Login to Admin Dashboard</a>
        </div>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 13px;">
          &copy; ${new Date().getFullYear()} PlacementPro System. All rights reserved.
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Admin Email sent successfully to:', email);
    return info;
  } catch (error) {
    console.error('❌ Error sending admin email:', error);
  }
};

module.exports = { sendRegistrationEmail, sendAdminRegistrationEmail };
