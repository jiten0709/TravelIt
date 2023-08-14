// ------------------------------------------
// ------------------------------------------

// const axios = require('axios');
// const cheerio = require('cheerio');

// const wikipediaUrl = 'https://en.wikipedia.org/wiki/Crawler';

// async function crawlWikipediaPage() {
//   try {
//     const response = await axios.get(wikipediaUrl);
//     const html = response.data;
//     const $ = cheerio.load(html);

//     // Extract data from the Wikipedia page
//     const title = $('h1#firstHeading').text().trim();
//     const introduction = $('div.mw-parser-output > p').first().text().trim();
//     const introduction2 = $('div.mw-parser-output > ul').first().text().trim();

//     // Output the extracted data
//     console.log('Title:', title);
//     console.log('Introduction:', introduction);
//     console.log(introduction2);
//   } catch (error) {
//     console.error('Error while crawling Wikipedia:', error.message);
//   }
// }

// crawlWikipediaPage();

// ----------------------------

const axios = require('axios');
const cheerio = require('cheerio');

const wikipediaUrl = 'https://www.tripadvisor.in/Attraction_Review-g304554-d311667-Reviews-Gateway_of_India-Mumbai_Maharashtra.html';

async function crawlWikipediaPage() {
  try {
    const response = await axios.get(wikipediaUrl);
    const html = response.data;
    const $ = cheerio.load(html);

    // Extract data from the Wikipedia page
    // const title = $('h1#firstHeading').text().trim();
    const introduction = $('biGQs _P pZUbB KxBGd').first().text().trim();
    // const introduction2 = $('div.mw-parser-output > ul').first().text().trim();

    // Output the extracted data
    // console.log('Title:', title);
    console.log('data:', introduction);
    // console.log(introduction2);
  } catch (error) {
    console.error('Error while crawling:', error.message);
  }
}

crawlWikipediaPage();

// ------------------

// const axios = require('axios');
// const cheerio = require('cheerio');

// const wikipediaUrl = 'https://us.trip.com/travel-guide/attraction/mumbai/gateway-of-india-mumbai-69349985/';

// async function crawlWikipediaPage() {
//   try {
//     const response = await axios.get(wikipediaUrl);
//     const html = response.data;
//     const $ = cheerio.load(html);

//     // Extract data from the Wikipedia page
//     const title = $('div.sort-get-catergory > span').text().trim();
//     const introduction1 = $('div.hover-pointer ').first().text().trim();
//     const introduction2 = $('div.TripReviewItemContainer-sc-1fopyhi-0 review-item > li').first().text().trim();
//     const introduction3 = $('div.mw-parser-output > ul').first().text().trim();

//     // Output the extracted data
//     console.log('Title:', title);
//     console.log('Introduction1:', introduction1);
//     console.log('Introduction2:', introduction2);
//     console.log('Introduction3:', introduction3);
//     // console.log(introduction2);
//   } catch (error) {
//     console.error('Error while crawling Wikipedia:', error.message);
//   }
// }

// crawlWikipediaPage();

// ------------------

// const axios = require('axios');
// const cheerio = require('cheerio');

// const url = 'https://us.trip.com/travel-guide/attraction/mumbai/gateway-of-india-mumbai-69349985/';

// axios.get(url)
//   .then((response) => {
//     const html = response.data;
//     const $ = cheerio.load(html);

//     const reviews = [];

//     $('.TripReviewItemContainer-sc-1fopyhi-0 review-item .gl-poi-detail_comment-content').each((index, element) => {
//       const userName = $(element).find('.review_score score-name').text().trim();
//       const reviewText = $(element).find('.comment-content').text().trim();
//       const rating = $(element).find('.star-score').attr('data-score');

//       reviews.push({ userName, reviewText, rating });
//     });

//     console.log(reviews);
//   })
//   .catch((error) => {
//     console.error('Error while fetching reviews:', error.message);
//   });
