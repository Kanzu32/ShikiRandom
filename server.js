const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');

const urlencodedParser = bodyParser.urlencoded({extended: false});

const app = express();

const axios = require('axios');
const cheerio = require('cheerio');

function getUrl(str) {
	str = str.split(' ').join('+');
	return `https://shikimori.one/${str}/list/anime/mylist/planned/order-by/name`;
};

function getAnime(url) {
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

function generateResultPage(animeName, animeLink, animeImg) {
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
		<input type='text' name='inp'>
		<button type='submit'>Random!</button>
	</form>

	<p id="text">Enter Shikimori account name</p>
	
	<a href="${animeLink}">
		<img id="image" src="${animeImg}">
		<p id="anime-name">${animeName}<p>
	</a>

</body>
</html>`;
};

function generateStartPage (error = "") {
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
		<input type='text' name='inp'>
		<button type='submit'>Random!</button>
	</form>

	<p id="text">Enter Shikimori account name</p>
	<p id="error">${error}</p>

</body>
</html>`
}

app.use(express.static(__dirname));

app.get('/', urlencodedParser, function(req, res) {
	res.send(generateStartPage());
});

app.post('/', urlencodedParser, function(req, res) {
	
	let str = req.body.inp;
	let url = getUrl(str);
	getAnime(url).then(anime => {
		res.end(generateResultPage(anime.name, anime.link, anime.img));
	},
	error => {
		res.send(generateStartPage('Error'));
	});

});

app.listen(8080);

console.log("server is on");