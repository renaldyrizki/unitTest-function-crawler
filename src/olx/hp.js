'use strict';
const olx = require("./olx.js");
const category = "/elektronik-gadget/q-xiaomi/";
const selector = {
	container: {
		tag: '#gallerywide > li',
		not: '',
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