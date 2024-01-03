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

// const text = "the place was good but i did not like the food places around";
// const text = "the food places nearby were enjoyable but the place was quite not good";
const text = "the guides of the tourist place were aggressive but indeed the tourist place was beautiful";

const words = tokenizer.tokenize(text);

const sentimentScore = analyzer.getSentiment(words);
let sentimentLabel;

if (sentimentScore >= 0) {
sentimentLabel = 'positive';
} else {
sentimentLabel = 'negative';
}

console.log(`Word: ${words}, Sentiment: ${sentimentLabel}, Score: ${sentimentScore}`);


// --------- METHOD 3 (sentence-level approach)------------

// const natural = require('natural');
// const Sentiment = require('sentiment');

// const tokenizer = new natural.WordTokenizer();
// const sentiment = new Sentiment();

// const text = "the food places nearby were enjoyable but the place was quite dirty";
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
