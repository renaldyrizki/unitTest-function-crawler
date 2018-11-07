'use strict';
const Scraper = require("../src/scraper.js");
const chai = require('chai');
const reqp = require('request-promise');
const should = chai.should();
const expect = chai.expect;

var scraper

describe('Scraper.js', function() {
	describe('options', function() {
		it('baseUrl', async () => {
			scraper = new Scraper({
						baseUrl : 'https://www.olx.co.id'
					  });
		  	expect(scraper.options.baseUrl).to.equal('https://www.olx.co.id');
	 	});
	});

	describe('scraper', function() {
		it('scraper', (done) => {
		    scraper.scrape('/properti/tanah/q-tanah/', function(err, $) {
		      expect(err).to.equal(null);
		      done(); 
		    })
	 	});

	 	it('scraper failed', (done) => {
		    scraper.scrape('properti/tacscscsah/', function(err, $) {
		      expect(err).to.be.an('error');
		      done(); 
		    });
	 	});
	});

	describe('scraperpost', function() {
		var scraperpost = new Scraper({
					baseUrl : ''
				  });
		it('scraper post', (done) => {
			expect(scraperpost.options.baseUrl).to.equal('');
		    scraperpost.scrapePost('https://www.kompasiana.com/search_artikel', 'tanah', function(err, $) {
		      expect(err).to.equal(null);
		      expect($).to.not.equal(null);
		      done();
		    })
	 	});
	});
});
