// const stopword = require("stopword");

// function preprocess(text) {
//   const tokens = text
//     .toLowerCase()
//     .replace(/[^a-z\s]/g, "")
//     .split(/\s+/);

//   return stopword.removeStopwords(tokens);
// }

// function vectorize(tokens, vocabulary) {
//   const vector = Array(vocabulary.length).fill(0);
//   tokens.forEach(t => {
//     const idx = vocabulary.indexOf(t);
//     if (idx !== -1) vector[idx]++;
//   });
//   return vector;
// }

// function cosineSimilarity(text1, text2) {
//   const tokens1 = preprocess(text1);
//   const tokens2 = preprocess(text2);

//   const vocabulary = [...new Set([...tokens1, ...tokens2])];

//   const v1 = vectorize(tokens1, vocabulary);
//   const v2 = vectorize(tokens2, vocabulary);

//   const dot = v1.reduce((s, v, i) => s + v * v2[i], 0);
//   const mag1 = Math.sqrt(v1.reduce((s, v) => s + v * v, 0));
//   const mag2 = Math.sqrt(v2.reduce((s, v) => s + v * v, 0));

//   if (!mag1 || !mag2) return 0;

//   return Number(((dot / (mag1 * mag2)) * 100).toFixed(2));
// }

// module.exports = { cosineSimilarity };

const natural = require("natural");
const stopword = require("stopword");

const tokenizer = new natural.WordTokenizer();

function preprocess(text) {

  const tokens = tokenizer.tokenize(
    text
      .toLowerCase()
      .replace(/[^a-z\s]/g, " ")
  );

  return stopword.removeStopwords(tokens);
}

function tfidfSimilarity(text1, text2) {

  const tokens1 = preprocess(text1).join(" ");
  const tokens2 = preprocess(text2).join(" ");

  const tfidf = new natural.TfIdf();

  tfidf.addDocument(tokens1);
  tfidf.addDocument(tokens2);

  const terms = new Set([
    ...tfidf.listTerms(0).map(t => t.term),
    ...tfidf.listTerms(1).map(t => t.term)
  ]);

  let dot = 0;
  let mag1 = 0;
  let mag2 = 0;

  terms.forEach(term => {

    const v1 = tfidf.tfidf(term, 0);
    const v2 = tfidf.tfidf(term, 1);

    dot += v1 * v2;
    mag1 += v1 * v1;
    mag2 += v2 * v2;

  });

  if (!mag1 || !mag2) return 0;

  return Number(((dot / (Math.sqrt(mag1) * Math.sqrt(mag2))) * 100).toFixed(2));
}

module.exports = { tfidfSimilarity };