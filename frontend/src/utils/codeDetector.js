export const detectCode = (text, selectedLanguage = "plaintext") => {
  // User explicitly selected a language
  if (selectedLanguage !== "plaintext") {
    return {
      isCode: true,
      language: selectedLanguage,
    };
  }

  // Optional fallback (very conservative)
  const looksLikeCode =
    text.split("\n").length >= 3 &&
    /[{}();=<>]/.test(text);

  if (!looksLikeCode) {
    return { isCode: false, language: null };
  }

  // Fallback only → treat as plain code block
  return {
    isCode: true,
    language: "plaintext",
  };
};
