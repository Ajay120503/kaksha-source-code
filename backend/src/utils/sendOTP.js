const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendOTPEmail = async (email, otp) => {
  await resend.emails.send({
    from: "SecureVault <onboarding@resend.dev>",
    to: email,
    subject: "Verify your account",
    html: `
      <h2>Email Verification</h2>
      <p>Your OTP code is:</p>
      <h1>${otp}</h1>
      <p>This OTP expires in 10 minutes.</p>
    `,
  });
};