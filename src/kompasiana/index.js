'use strict';
const argv = require('minimist')(process.argv.slice(2));
const kompasiana = require("./kompasiana.js");
const query = argv.key;
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
const kompasiana_content = new kompasiana(selector, query);
kompasiana_content.run();