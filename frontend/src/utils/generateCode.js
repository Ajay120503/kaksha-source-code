// utils/generateCode.js
export function generateClassCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";

  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}

export function generateReadableCode() {
  // like ABCD-1234
  const part1 = generateClassCode(4);
  const part2 = generateClassCode(4);
  return `${part1}-${part2}`;
}
