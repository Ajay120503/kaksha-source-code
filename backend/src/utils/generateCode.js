const crypto = require("crypto");

module.exports = function generateCode(length = 6) {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    code += chars[randomIndex];
  }

  return code;
};
