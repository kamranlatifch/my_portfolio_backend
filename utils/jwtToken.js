export const generateToken = (user, message, statusCode, res) => {
  const token = user.generateWebToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIES_EXPIRES_TIME * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    message,
    user,
  });
};
