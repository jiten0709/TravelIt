// --------- METHOD 1 ------------

// // Import the Sentiment library
// const Sentiment = require('sentiment');

// // Create a new Sentiment instance
// const sentiment = new Sentiment();

// // Sample text for sentiment analysis
// const text = "Weve booked this private day tour, and there was no response from the company to arrange for the pickup. Tried calling them multiple times but the line was unavailable. Trip adviser should look into this and stop consumers from purchasing this package if its not active anymore.";

// // Analyze the sentiment of the text
// const result = sentiment.analyze(text);

// // Output the sentiment score and comparative score
// console.log(result); 


// --------- METHOD 2 (document-level approach)------------

const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

const SentimentAnalyzer = natural.SentimentAnalyzer;
const stemmer = natural.PorterStemmer;

const analyzer = new SentimentAnalyzer('English', stemmer, 'afinn');

const text = "I am leaving this poor review because I signed up for a tour, paid and was never contacted.Before using this company see if you can find an email, an address or a phone number that works, I challenge you.Luckily I realized this and made other plans, now I am left to try to figure out how to get my money back.";
const words = tokenizer.tokenize(text);

const sentimentScore = analyzer.getSentiment(words);
let sentimentLabel;

if (sentimentScore > 0) {
sentimentLabel = 'positive';
} else if (sentimentScore < 0) {
sentimentLabel = 'negative';
} else {
sentimentLabel = 'neutral';
}

console.log(`Word: ${words}, Sentiment: ${sentimentLabel}, Score: ${sentimentScore}`);


// --------- METHOD 3 (sentence-level approach)------------

// const natural = require('natural');
// const Sentiment = require('sentiment');

// const tokenizer = new natural.WordTokenizer();
// const sentiment = new Sentiment();

// const text = "I am leaving this poor review because I signed up for a tour, paid and was never contacted.Before using this company see if you can find an email, an address or a phone number that works, I challenge you.Luckily I realized this and made other plans, now I am left to try to figure out how to get my money back.";
// const sentences = text.split(/[.!?]/);

// let totalSentimentScore = 0;

// sentences.forEach((sentence) => {
//   const words = tokenizer.tokenize(sentence);
//   const sentenceSentiment = sentiment.analyze(words.join(' '));
//   totalSentimentScore += sentenceSentiment.score;

//   // You can add code here to analyze and interpret individual sentence sentiment
//   let sentenceSentimentLabel;

//   if (sentenceSentiment.score > 0) {
//     sentenceSentimentLabel = 'positive';
//   } else if (sentenceSentiment.score < 0) {
//     sentenceSentimentLabel = 'negative';
//   } else {
//     sentenceSentimentLabel = 'neutral';
//   }

//   console.log(`Sentence: ${sentence}`);
//   console.log(`Sentence Sentiment: ${sentenceSentimentLabel}, Score: ${sentenceSentiment.score}`);
// });

// // Overall document sentiment based on total sentiment score
// let overallSentimentLabel;

// if (totalSentimentScore > 0) {
//   overallSentimentLabel = 'positive';
// } else if (totalSentimentScore < 0) {
//   overallSentimentLabel = 'negative';
// } else {
//   overallSentimentLabel = 'neutral';
// }

// console.log(`Overall Document Sentiment: ${overallSentimentLabel}, Total Score: ${totalSentimentScore}`);
