// (c) 2020 The MITRE Corporation. All Rights Reserved.

const fs = require('fs');
const cheerio = require("cheerio");
const handlebars = require('handlebars');
const parse = require("csv-parse");
const findValue = require('./findval');


const fname = "DTS.html";

const data = fs.readFileSync(fname, 'utf8');
const $ = cheerio.load(data);

const people = fs.readFileSync('contacts.csv', 'utf8');
let precords = '';

	parse(people, {
	  columns: ['dts_name', 'email', 'fname'],
	  skip_empty_lines: true
	}, function(err, records){
	if(!err) {

		precords = (records)
		//console.log(precords);
		//console.log(JSON.stringify(precords));
		const found = precords.find( d => d.dts_name === 'Newman Eric J.' )
		console.log(found.email);


	}
	});


//console.log(typeof precords);

//console.log(precords.findValue('dts_name', 'Newman Eric J.'));
return;

let user = machine = status = problem = "";

let compliantCount = $("#ContentPlaceHolder1_lblCompliantCnt").text();
let nonCompliantCount = $("#ContentPlaceHolder1_lblNCCnt").text();
let notReportingCount = $("#ContentPlaceHolder1_lblWaivedCnt").text();

const source = " Dear {{user}},\n\n   This is a friendly DTS reminer. \r\n Your machine with an ID of {{machine}} is out of spec.\n\n {{status}}\n\n\n\n";
const template = handlebars.compile(source);

$("#ContentPlaceHolder1_ctl09_tblDeptDetail tbody > tr").each((index, element) => {

		//console.log(index, element);
		user = $("#ContentPlaceHolder1_ctl09_tblDeptDetail > tbody > tr:nth-child(" + index + ") > th:nth-child(1)").find('a').first().text() || user;
		machine = $("#ContentPlaceHolder1_ctl09_tblDeptDetail > tbody > tr:nth-child(" + index + ") > th:nth-child(2)").find('a').first().text()|| "";
		problem = $("#ContentPlaceHolder1_ctl09_tblDeptDetail > tbody > tr:nth-child(" + index + ") > th:nth-child(4)").find('img').attr('src') || "";

		switch(problem) {
			case 'images/redx.png':
				status = 'It seems to be missing some critical updates.'
				break;

			case 'images/question.jpg':
				status = 'It seems it hasn\'t been reporting in for a while.'
				break;

			case 'images/warning.png':
				status = 'Looks like it has some updates pending.'
				break;

			case 'images/greencheck.png':
				status = ''
				break;
			default:
				status = 'unknown'
				break;

		}

		if(user && status) {
			//console.log( user, machine, status);
			let person = user.split(',');
			let data = {
			  user: person[1]+' '+ person[0],
			  machine: machine,
			  status: status
			}
  			let html = template(data);
			console.log(html)
		}

});
