'use strict';
const olx = require("./olx.js");
const category = "/properti/tanah/q-tanah/";
const selector = {
	container: {
		tag: '.offer table tr',
		not: '.promoted',
		attr: '',
	},
	link: {
		tag: 'a.detailsLink',
		not: '',
		attr: 'href',
		suffix: '',
	},
};
const olx_content = new olx(selector, category);
olx_content.run();