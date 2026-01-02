const nodemailer = require('nodemailer');

/**
 * Create email transporter
 */
const createTransporter = () => {
    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

/**
 * Send email notification
 */
exports.sendEmail = async ({ to, subject, html }) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Email sending failed:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send welcome email
 */
exports.sendWelcomeEmail = async (user) => {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3b82f6;">Welcome to CampusFind! 🎉</h2>
      <p>Hi ${user.name},</p>
      <p>Thank you for registering with CampusFind - your campus Lost & Found management system.</p>
      <p>You can now:</p>
      <ul>
        <li>Report lost items</li>
        <li>Report found items</li>
        <li>Search for your lost belongings</li>
        <li>Get automatic match notifications</li>
        <li>Submit and track claims</li>
      </ul>
      <p>Get started by logging in to your account!</p>
      <p style="margin-top: 30px;">Best regards,<br>The CampusFind Team</p>
    </div>
  `;

    return await this.sendEmail({
        to: user.email,
        subject: 'Welcome to CampusFind!',
        html
    });
};

/**
 * Send item match notification
 */
exports.sendMatchNotification = async (user, item, matchedItem) => {
    const itemType = item.type === 'lost' ? 'lost' : 'found';
    const matchType = matchedItem.type === 'lost' ? 'lost' : 'found';

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10b981;">Great News! We Found a Match! 🎯</h2>
      <p>Hi ${user.name},</p>
      <p>We found a potential match for your ${itemType} item:</p>
      <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Your Item:</h3>
        <p><strong>${item.title}</strong></p>
        <p>${item.description}</p>
        <h3>Matched ${matchType.charAt(0).toUpperCase() + matchType.slice(1)} Item:</h3>
        <p><strong>${matchedItem.title}</strong></p>
        <p>${matchedItem.description}</p>
      </div>
      <p>Login to your account to view details and submit a claim if this is your item.</p>
      <p style="margin-top: 30px;">Best regards,<br>The CampusFind Team</p>
    </div>
  `;

    return await this.sendEmail({
        to: user.email,
        subject: 'CampusFind: Potential Match Found!',
        html
    });
};

/**
 * Send claim notification
 */
exports.sendClaimNotification = async (user, claim, item) => {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f59e0b;">New Claim Request 📋</h2>
      <p>Hi ${user.name},</p>
      <p>Someone has submitted a claim for an item you reported:</p>
      <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Item:</strong> ${item.title}</p>
        <p><strong>Category:</strong> ${item.category}</p>
        <p><strong>Location:</strong> ${item.location}</p>
      </div>
      <p>Please login to review the claim details and proof of ownership.</p>
      <p style="margin-top: 30px;">Best regards,<br>The CampusFind Team</p>
    </div>
  `;

    return await this.sendEmail({
        to: user.email,
        subject: 'CampusFind: New Claim Request',
        html
    });
};

/**
 * Send claim status update
 */
exports.sendClaimStatusUpdate = async (user, claim, item, status) => {
    const statusText = status === 'approved' ? 'Approved ✅' : 'Rejected ❌';
    const statusColor = status === 'approved' ? '#10b981' : '#ef4444';

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${statusColor};">Claim ${statusText}</h2>
      <p>Hi ${user.name},</p>
      <p>Your claim has been ${status}:</p>
      <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Item:</strong> ${item.title}</p>
        <p><strong>Category:</strong> ${item.category}</p>
        <p><strong>Status:</strong> ${status.toUpperCase()}</p>
        ${claim.verificationNotes ? `<p><strong>Notes:</strong> ${claim.verificationNotes}</p>` : ''}
      </div>
      ${status === 'approved' ?
            '<p>Congratulations! You can now coordinate with the finder to retrieve your item.</p>' :
            '<p>If you believe this is an error, please contact support.</p>'
        }
      <p style="margin-top: 30px;">Best regards,<br>The CampusFind Team</p>
    </div>
  `;

    return await this.sendEmail({
        to: user.email,
        subject: `CampusFind: Claim ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        html
    });
};
