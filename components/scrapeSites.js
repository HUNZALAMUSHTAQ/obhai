const axios = require('axios');
const { load } = require('cheerio');
// const fs = require('fs');
const iconv = require('iconv-lite');

// Function to scrape the website and save results to a text file
async function scrapeWebsites({ chunk }) {
  try {
    const url = chunk.metadata.id.trim();

    if(!url.startsWith("http://relevancy.bger.ch")){
      url = `http://relevancy.bger.ch/cgi-bin/JumpCGI?id=${url}`
    }
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const decodedData = iconv.decode(response.data, 'ISO-8859-1');
    const $ = load(decodedData);

    // Select the elements you want to scrape using Cheerio selectors
    let scrapedData = $('.content').text();

    // Remove consecutive empty lines (including lines with spaces)
    scrapedData = scrapedData.replace(/(\n\s*){2,}/g, '\n');

    // Save the scraped data to a text file with UTF-8 encoding and BOM
    // fs.writeFileSync('scraped_data.txt', scrapedData, 'utf8');

    // console.log('Scraping completed successfully. Results saved to scraped_data.txt');
    // console.log(scrapedData);

    return Promise.resolve({
      verdictDate: chunk.metadata.verdict_date,
      verdictId: chunk.metadata.verdict_id,
      pageContent: chunk.pageContent,
      similarityScore: chunk.metadata.similarityScore,
      url,
      scrapedArticleFromUrl: scrapedData,
    });
  } catch (error) {
    // console.error('An error occurred while scraping the website:', error);
    return Promise.resolve(null);
  }
}

module.exports.scrapeWebsites = scrapeWebsites;
