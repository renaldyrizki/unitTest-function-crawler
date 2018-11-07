var cheerio = require('cheerio');
var extend = require('extend');
var request = require('request');

class Scraper {
  constructor(userOptions){
      var options = extend({
        method: 'GET',
        baseUrl: '',
        forever: true,
        // timeout: 20 * 1000,
        headers: {
          'Cache-Control': 'max-age=0',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36',
        },
      }, userOptions);
      this.options = options;
  }

  scrape(url, callback) {
    var req = this.getRequestInstance();
    req(url, function(error, response, body) {
      if (error) {
        return callback(error);
      }

      if (response.statusCode !== 200) {
        return callback(new Error('Failed to scrape the page.'));
      }

      var $ = cheerio.load(body);

      return callback(null, $);
    });
  }

  scrapePost(url, query, callback) {
    var req = this.getRequestInstance();
    req.post(url, { form: { text_search: query }}, function(error, response, body) {
      if (error) {
        return callback(error);
      }

      if (response.statusCode !== 200) {
        return callback(new Error('Failed to scrape the page.'));
      }

      var $ = cheerio.load(body);

      return callback(null, $);
    });
  }

  getRequestInstance() {
    return request.defaults(this.options);
  }
};

module.exports = Scraper;