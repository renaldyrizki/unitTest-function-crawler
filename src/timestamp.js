const months = [
	'january',
	'february',
	'march',
	'april',
	'may',
	'juny',
	'july',
	'august',
	'september',
	'october',
	'november',
	'december',
];

function toTimestamp(dateInput){
	const now = new Date();
	const re = toRegex(dateInput.format);
	// console.log(re);
	let parsedDateInput = re.exec(dateInput.str.toLowerCase());

	// failed parse;
	if (!parsedDateInput) return null;

	parsedDateInput = parsedDateInput.slice(1);
	const formatKeys = dateInput.format.replace(/[^ \w]+/g, ' ').split(' ').filter(key => key);
	let dateInputObject = { };

	// to date input object
	formatKeys.forEach(function (key, index){
		const code = key[0];
		dateInputObject[code] = parsedDateInput[index];
	});

	// to number
	for (let key in dateInputObject){
		if (key === 'y') {
			if (dateInputObject[key].length === 2){
				const year = now.getFullYear().toString().slice(0, 2) + dateInputObject[key];
				dateInputObject[key] = parseInt(year);
			} else {
				dateInputObject[key] = parseInt(dateInputObject[key]);
			}
		} else if (key === 'M'){
			dateInputObject[key.toLowerCase()] = toMonthNumber(dateInputObject[key]);
			delete dateInputObject[key];
		} else if (key === 'm'){
			dateInputObject[key] = parseInt(dateInputObject[key]) - 1;
		}else {
			dateInputObject[key] = parseInt(dateInputObject[key]);
		}
	}

	let date = new Date();

	dateInputObject = sortDateKeys(dateInputObject);

	// set date using date input
	for (let key in dateInputObject){
		const value = dateInputObject[key];

		if (value){
			if (key === 'y') date.setYear(value);
			else if (key === 'm') date.setMonth(value);
			else if (key === 'd') date.setDate(value);
			else if (key === 'h') date.setHours(value);
			else if (key === 'i') date.setMinutes(value);
		}
	}

	if (date > new Date()) return null;

	return date.getTime();
}

function sortDateKeys(dateInputObject){
	const d = dateInputObject['d'] ? dateInputObject['d'] : null;
	const m = dateInputObject['m'] ? dateInputObject['m'] : null;
	const h = dateInputObject['h'] ? dateInputObject['h'] : null;
	const i = dateInputObject['i'] ? dateInputObject['i'] : null;
	const y = dateInputObject['y'] ? dateInputObject['y'] : null;

	return {y, m, d, h, i};
}

function toMonthNumber(monthStr){
	if (monthStr.length < 3) return new Date().getMonth();

	const code = monthStr.slice(0, 3);

	if (code === 'jan') return 0;
	if (code === 'feb') return 1;
	if (code === 'mar') return 2;
	if (code === 'apr') return 3;
	if (code === 'may' || code === 'mei') return 4;
	if (code === 'jun') return 5;
	if (code === 'jul') return 6;
	if (code === 'aug' || code === 'agu') return 7;
	if (code === 'sep') return 8;
	if (code === 'oct' || code === 'okt') return 9;
	if (code === 'nov') return 10;
	if (code === 'dec' || code === 'des') return 11;
}

function toRegex(format){
	let reToken = '';
	let re = '';

	for (let i = 0 ; i < format.length ; i++){
		const token = format[i];
		const isDelimitter = isDelimitterToken(token);
		const isLastToken = (i === format.length - 1);

		// get token
		if (isDelimitter){
			reToken += token;
		}

		if (!isDelimitter || isLastToken) {
			// exec / create regex from reToken
			const initToken = reToken[0];

			if (initToken === 'd' || initToken === 'm' || initToken === 'y' || initToken === 'h' || initToken === 'i'){
				const reConvert = '\\d+';
				re += isLastToken ? `(${reConvert})` : `(${reConvert})${token}`;
			} else if (initToken === 'M'){
				const numToken = reToken.length;
				const reConvert = numToken == 4 ? '[a-z]+' : `[a-z]{${numToken}}`;
				re += `(${reConvert})${token}`;
			} else {
				re += backslashToken(token);
			}

			reToken = '';
		}
	}

	return new RegExp(re, 'g');
}

function isDelimitterToken(token){
	const delimiters = ".-: ,/|";
	return token && !delimiters.includes(token);
}

function backslashToken(token){
	if (token == "|") return "\\|";

	return token;
}

module.exports = {
	toTimestamp: toTimestamp
};