import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js';
import ErrorHandler from '../middlewares/error.js';
import { Message } from '../models/messageSchema.js';
import { User } from '../models/userSchema.js';
import { sendEmail } from '../utils/sendEmail.js';

export const sendMessage = catchAsyncErrors(async (req, res, next) => {
  const { sender_name, subject, message, email } = req.body;
  try {
    if (!sender_name || !subject || !message || !email) {
      return next(new ErrorHandler(400, 'Please fill all fields'));
    }

    const data = await Message.create({
      senderName: sender_name,
      subject,
      message,
      email,
    });

    res.status(200).json({
      success: true,
      message: 'Message sent successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
  const replyMessage = `Thank you ${sender_name} for your message. I will get back to you soon! \n\n Regards,\n Kamran Latif Ch \n Full Stack Developer`;
  const replyMessageHTML = `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <p>Dear <strong>${sender_name}</strong>,</p>
    <p>Thank you for reaching out! I appreciate your message and will get back to you soon.</p>

    <p>In the meantime, feel free to check my portfolio for more updates:</p>
    <p><a href=${process.env.DASHBOARD_URL} style="color: #007BFF; text-decoration: none;">Visit My Portfolio</a></p>

    <hr style="border: 0; height: 1px; background: #ddd; margin: 20px 0;">

    <p style="font-size: 14px; color: #555;">
      Best Regards,<br>
      <strong>Kamran Latif Ch</strong><br>
      <span style="color: #007BFF;">Full Stack Developer</span><br>
    </p>
  </div>
`;


  const messageToUser = `A new message is received from ${sender_name}, ${email}. \n\n ${message}`;

  try {
    await sendEmail({
      email: email,
      subject: 'Thank You For Your Message',
      message: replyMessage,
      html:replyMessageHTML
    });

    try {
      await sendEmail({
        email: 'kamranlatif98@gmail.com',
        subject: subject,
        message: messageToUser,
      });
    } catch (error) {
      console.error(
        'Failed to send email to kamranlatif98@gmail.com:',
        error.message
      );
      return next(new ErrorHandler(500, 'Failed to send email to admin.'));
    }
  } catch (error) {
    // Handle error for the first email
    return next(new ErrorHandler(500, error.message));
  }
 
});

export const getAllMessages = catchAsyncErrors(async (req, res, next) => {
  try {
    const messages = await Message.find();

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    next(error);
  }
});

export const deleteMessage = catchAsyncErrors(async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return next(
        new ErrorHandler(404, `Message not found with ID ${req.params.id}`)
      );
    }

    await message.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
});
