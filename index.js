// (c) 2020 The MITRE Corporation. All Rights Reserved.

const fs = require('fs');
const cheerio = require("cheerio");
const handlebars = require('handlebars');
const parse = require("csv-parse");
const decode = require("./encryption");
const nodeoutlook = require('nodejs-nodemailer-outlook')


const fname = "DTS.html";

const data = fs.readFileSync(fname, 'utf8');
const $ = cheerio.load(data);

const people = fs.readFileSync('contacts.csv', 'utf8');
let  found = user = machine = status = problem = "";

let compliantCount = $("#ContentPlaceHolder1_lblCompliantCnt").text();
let nonCompliantCount = $("#ContentPlaceHolder1_lblNCCnt").text();
let notReportingCount = $("#ContentPlaceHolder1_lblWaivedCnt").text();

//const source = " Dear {{user}},\n\n   This is a friendly DTS reminer. \r\n Your machine with an ID of {{machine}} is out of spec.\n\n {{status}}\n\n\n\n";
const source = fs.readFileSync('template.html', 'utf8');
const template = handlebars.compile(source);
const emailpw = {
  iv: 'd5d4aca00f492fe9a39deb418fa88461',
  encryptedData: '707d24f90d615a064a3c28ee73d3ff8f32075b8f74830cd756faeeeb62af1653'
}


	parse(people, {
	  columns: ['dts_name', 'email', 'fname'],
	  skip_empty_lines: true
	}, function(err, records){
	if(!err) {

		process(records);

	}
	});


return;


 function process(records) {
 	let prevUser = '', machine = [], status = "",mechname = "";

	$("#ContentPlaceHolder1_ctl09_tblDeptDetail tbody > tr").each((index, element) => {

			user =         $("#ContentPlaceHolder1_ctl09_tblDeptDetail > tbody > tr:nth-child(" + index + ") > th:nth-child(1)").find('a').first().text() || user;
			let mach =     $("#ContentPlaceHolder1_ctl09_tblDeptDetail > tbody > tr:nth-child(" + index + ") > th:nth-child(2)").find('a').first().text() || [];
			machname = $("#ContentPlaceHolder1_ctl09_tblDeptDetail > tbody > tr:nth-child(" + index + ") > th:nth-child(3) > div").text() || "";
			problem =      $("#ContentPlaceHolder1_ctl09_tblDeptDetail > tbody > tr:nth-child(" + index + ") > th:nth-child(4)").find('img').attr('src') || "";
			//


			if(user !== prevUser) {
				machine = []
			}

			switch(problem) {
				case 'images/redx.png':
					status = ('Seems to be missing some critical updates.')
					break;

				case 'images/question.jpg':
					//status = ('Seems it has not reported in for a while.')
					status = ''

					break;

				case 'images/warning.png':
					//status = ('Looks like it has some updates pending.')
					status = ''
					break;

				case 'images/greencheck.png':
					status = ''
					break;
				default:
					status = '';
					break;

			}

			prevUser = user;

			user = user.replace(',', ' ');
			if(user && status) {

				machine.push(machname.trim() + "\r\n   ID:(" + mach.trim() + ") : " + status.trim());

				found = records.find( d => d.dts_name === user )
				if(!found) {
					console.log("Missing Name: " + user)
				}
				else {

					let data = {
					  user: found.dts_name + " " + found.email,
					  machine: machine,
					  status: status,
					  fname: found.fname,
					  email: found.email.padEnd(40, ' ')
					}
					let html = template(data);
					console.log(html)
					sendEmail()
					}
			}

	});
}

 function  sendEmail() {
 	console.log(decode(emailpw
 	))
// 		nodeoutlook.sendEmail({
// 			auth: {
// 				user: "ericnewman@mitre.org",
// 				pass: """
// 			},
// 			from: 'sender@outlook.com',
// 			to: 'receiver@gmail.com',
// 			subject: 'Hey you, awesome!',
// 			html: '<b>This is bold text</b>',
// 			text: 'This is text version!',
// 			replyTo: 'receiverXXX@gmail.com',
// 		}
}