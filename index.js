#!/usr/bin/env node
var request = require('request');
var cheerio = require('cheerio');
var argv = require('yargs').argv;
var iconv = require('iconv-lite');
var colors = require('colors');

var city = argv.city;

if(city == 'all') {
	request({
		url: 'http://www.stats.gov.cn/tjsj/tjbz/xzqhdm/201504/t20150415_712722.html',
		encoding: null,
		headers: {  
		  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36'
		}
	}, function(error, response, body) {
		if(!error && response.statusCode == 200) {
			var html = iconv.decode(body, 'utf-8');
	    	var $ = cheerio.load(html, {decodeEntities: false});
	    	var arr = [];

	    	$('div.TRS_PreAppend').find('p').each(function(i, dom) {
	    		var _number = $(this).find('span').eq(0).text().replace(/&nbsp;/g, '').replace(/^\s+/, '').replace(/\s+$/, '');
	    		if(/\d{3}[1-9]00/.test(_number)) {
	    			arr.push($(this).find('>span').eq(1).text().replace(/^\s+/, '').replace(/\s+$/, ''));
	    		}
	    	});
	    	for(var i=0; i<arr.length; i++) {
	    		var val = arr[i];

	    		if(val == '市辖区' || val == '县') {
	    			arr.splice(i, 1);
	    			i--;
	    		}
	    	}
	    	arr = ['北京', '上海', '天津', '重庆'].concat(arr);
	    	console.log(JSON.stringify(arr));
		}
	});
} else {
	var url = 'http://baike.baidu.com/item/' + encodeURIComponent(city);;
	var options = {
		url: url,
		encoding: null,
		headers: {  
		  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36'
		}
	};

	request(options, function(error, response, body) {
		if(!error && response.statusCode == 200) {
			var html = iconv.decode(body, 'utf-8');
	    	var $ = cheerio.load(html, {decodeEntities: false});
	    	var obj = {};
			$('div.basic-info').find('dt').each(function(i, dom) {
				obj[$(this).text()] = $('div.basic-info').find('dd').eq(i).text();
			});
			for(var i in obj) {
				if(typeof i != 'function') {
					console.log(i.replace(/&nbsp;/g, '').red, obj[i].replace(/^\s+/, '').replace(/\s+$/, '').green);
				}
			}
		}
	});
}