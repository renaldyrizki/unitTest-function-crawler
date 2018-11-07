'use strict';
const kompasiana = require("../src/kompasiana/kompasiana.js");
const chai = require('chai');
const should = chai.should();
const expect = chai.expect;
const query = 'Tanah';
const selector = {
	container: {
		tag: '.artikel--content',
		not: '',
		attr: '',
	},
	link: {
		tag: 'h2 > a',
		not: '',
		attr: 'href',
		suffix: '',
	},
};
const query_err = 'Tanah';
const selector_err = {
	container: {
		tag: '.artikssel--content',
		not: '',
		attr: '',
	},
	link: {
		tag: 'h2 > a',
		not: '',
		attr: 'href',
		suffix: '',
	},
};
const kompasiana_content = new kompasiana(selector, query);

var result;
var result2;
var result3;
const key = ["title", "url","creator_name","creator_url","content","images","datetime_ms","datetime_str","datetime_ms_update","datetime_str_update","tag"];
describe('kompasiana', function() {

	describe('test crawler', function() {
		it('constructor', () => {
		  expect(kompasiana_content.query).to.equal(query);
		  expect(kompasiana_content.selectors).to.equal(selector);
		});

		it('getLink', async () => {
		  	result = await kompasiana_content.getLink(query, selector);
		  	expect(result.length).to.equal(15);
		  	expect(result).to.be.an('array');
	 	});

	 	it('getContent', async () => {
		  	result2 = await kompasiana_content.getContent(result[0]);
		  	expect(result2).to.be.an('object').that.has.all.keys(key);
	 	});

	 	it('null properti', async () => {
		  	result2 = await kompasiana_content.getContent(result[0]);
		  	expect(result2).to.be.an('object').that.has.all.keys(key);
		  	expect(result2.datetime_ms).to.not.equal('');
		  	expect(result2.datetime_str).to.not.equal('');
		  	expect(result2.datetime_ms_update).to.not.equal('');
		  	expect(result2.datetime_str_update).to.not.equal('');
	 	});

	 	it('savetomongo', async () => {
		  	result3 = await kompasiana_content.savetomongo([result2]);
		  	expect(result3.result.ok).to.equal(1);
	 	});
	});

	describe('Error', function() {
		it('getLink', async () => {
			 result = await kompasiana_content.getLink(query_err, selector_err);
			 expect(result.length).to.equal(0);
	 	});
	});
});
