'use strict';
const argv = require('minimist')(process.argv.slice(2));
const detik_forum = require("./detik_forum.js");
const query = argv.key;
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
const detik_forum_content = new detik_forum(selector, query);
detik_forum_content.run();