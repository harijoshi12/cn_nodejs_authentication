import axios from "axios";

/**
 * Verify reCAPTCHA token
 * @param {string} token - reCAPTCHA response token
 * @returns {Promise<boolean>} Whether the token is valid
 */
export const verifyRecaptcha = async (token) => {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`;

  try {
    const response = await axios.post(verifyUrl, null, {
      params: {
        secret: secretKey,
        response: token,
      },
    });
    return response.data.success;
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return false;
  }
};
