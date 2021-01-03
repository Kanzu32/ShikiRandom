const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');

const urlencodedParser = bodyParser.urlencoded({extended: false});

const app = express();

const axios = require('axios');
const cheerio = require('cheerio');

function getUrl(str, type) {
	str = str.split(' ').join('+');
	if (type == 'planned') {
		return `https://shikimori.one/${str}/list/anime/mylist/planned/order-by/name`;
	};
	if (type == 'watched') {
		return `https://shikimori.one/${str}/list/anime/mylist/completed/order-by/name`;
	};
	
};

function getAnimeShikimori(url) {
	let arr = [];
	let res;
	let promise = new Promise((resolve, reject) => {
		axios.get(url)
			.then(response => {

				let html = cheerio.load(response.data);
				html('.tooltipped').each((i, elem) => {
					arr.push({
						name: html(elem).text(),
						link: html(elem).attr('href'),
					});
				});

				res = arr[Math.floor(Math.random()*arr.length)];

				axios.get(res.link).then(response => {
					let html = cheerio.load(response.data);
					let img = html('.c-poster').children('center').children('img').attr('src');
					res.img = img;
					resolve(res);
				});

			},
			error => {
				reject('error');
			});
	});
	return promise;
};

function generateResultPage(animeName, animeLink, animeImg, name = "", type = "planned") {
	let plan = 'checked';
	let watch = '';
	if (type == 'watched') {
		plan = '';
		watch = 'checked';
	};
	return `<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>ShikiRandom</title>
	<link rel="stylesheet" href="style.css">
</head>
<body>

	<img id="logo" src="logo.png" >

	<form method="post" action="http://localhost:8080/">
		<input type='text' name='inp' value='${name}'>
		<button type='submit'>Random!</button>
		<p id="text">Enter Shikimori account name</p>
		<div id='searchType'>
			<input type='radio' name='type' ${plan} value='planned'>Planned
			<input type='radio' name='type' ${watch} value='watched'>Watched
		</div>
	</form>
	
	<div id='linkZone'>
		<div class='linkWrap'><a href="${animeLink}"><img id="image" src="${animeImg}"></a></div>
		<div class='linkWrap'><a href="${animeLink}"><p id="anime-name">${animeName}<p></a></div>
	</div>

</body>
</html>`;
};

function generateStartPage (error = "", name = "", type = "planned") {
	let plan = 'checked';
	let watch = '';
	if (type == 'watched') {
		plan = '';
		watch = 'checked';
	};
	return `<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>ShikiRandom</title>
	<link rel="stylesheet" href="style.css">
</head>
<body>

	<img id="logo" src="logo.png" >

	<form method="post" action="http://localhost:8080/">
		<input type='text' name='inp' value='${name}'>
		<button type='submit'>Random!</button>
		<p id="text">Enter Shikimori account name</p>
		<div id='searchType'>
			<input type='radio' name='type' ${plan} value='planned'>Planned
			<input type='radio' name='type' ${watch} value='watched'>Watched
		</div>
	</form>

	
	<p id="error">${error}</p>

</body>
</html>`
}

app.use(express.static(__dirname));

app.get('/', urlencodedParser, function(req, res) {
	res.send(generateStartPage());
});

app.post('/', urlencodedParser, function(req, res) {
	let type = req.body.type;
	let str = req.body.inp;
	let url = getUrl(str, type);
	getAnimeShikimori(url).then(

		anime => {
			res.end(generateResultPage(anime.name, anime.link, anime.img, str, type));
		},
		error => {
			res.send(generateStartPage('Error', str, type));
		});

});

app.listen(8080);

console.log("server is on");