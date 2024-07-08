export const passwordResetTemplate = (resetUrl) => `
  <p>You requested a password reset</p>
  <p>Click this <a href="${resetUrl}">link</a> to reset your password</p>
`;
