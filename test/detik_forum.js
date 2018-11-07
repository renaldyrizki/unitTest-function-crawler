'use strict';
const detik_forum = require("../src/detik_forum/detik_forum.js");
const chai = require('chai');
const should = chai.should();
const expect = chai.expect;
const query = 'Tanah';
const selector = {
  container: {
    tag: '#detikcontent > .box_left > .tree > ul > li',
    not: '',
    attr: '',
  },
  link: {
    tag: 'a.more',
    not: '',
    attr: 'href',
    suffix: '',
  },
};
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
const detik_forum_content = new detik_forum(selector, query);

var result;
var result2;
var result3;
const key = ["title", "url","creator_name","creator_url","content","quote","images","datetime_ms","datetime_str","tag"];
describe('detik_forum', function() {

  describe('query Electronic', function() {
    it('constructor', () => {
      expect(detik_forum_content.query).to.equal(query);
      expect(detik_forum_content.selectors).to.equal(selector);
    });
    
    it('getLink', async () => {
        result = await detik_forum_content.getLink(query, selector);
        expect(result.length).to.equal(10);
        expect(result).to.be.an('array');
    });

    it('getContent', async () => {
        result2 = await detik_forum_content.getContent('http://forum.detik.com/showthread.php?t=1644192');
        expect(result2).to.be.an('object').that.has.all.keys(key);
    });

    it('null properti', async () => {
        result2 = await detik_forum_content.getContent('http://forum.detik.com/showthread.php?t=1644192');
        expect(result2).to.be.an('object').that.has.all.keys(key);
        expect(result2.datetime_ms).to.not.equal('');
        expect(result2.datetime_str).to.not.equal('');
    });

    it('savetomongo', async () => {
        result3 = await detik_forum_content.savetomongo([result2]);
        expect(result3.result.ok).to.equal(1);
    });
  });

  describe('Error', function() {
    it('getLink', async () => {
       result = await detik_forum_content.getLink(query, selector_err);
       expect(result.length).to.equal(0);
    });
  });
});
