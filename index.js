// (c) 2020 The MITRE Corporation. All Rights Reserved.

const fs = require('fs');
const cheerio = require("cheerio");
const handlebars = require('handlebars');
const parse = require("csv-parse");
//const nodeoutlook = require('nodejs-nodemailer-outlook')
const nodemailer = require('nodemailer')

const fname = "Desktop Steward Compliance Report.html";

const data = fs.readFileSync(fname, 'utf8');
const emailpw = fs.readFileSync('.credentials', 'utf8');

const $ = cheerio.load(data);
const mode = process.argv[2] || '';

const people = fs.readFileSync('contacts.csv', 'utf8');
let  found = user = machine = status = problem = "", badcount=0;

let compliantCount    = $("#ContentPlaceHolder1_lblCompliantCnt").text();
let nonCompliantCount = $("#ContentPlaceHolder1_lblNCCnt").text();
let notReportingCount = $("#ContentPlaceHolder1_lblWaivedCnt").text();
let totalMachines     = $("#ContentPlaceHolder1_lblTotal").text();

const source = fs.readFileSync('template.html', 'utf8');
const template = handlebars.compile(source);
let emailBusy = false;

	parse(people, {
	  columns: ['dts_name', 'email', 'fname'],
	  skip_empty_lines: true
	}, function(err, records){
	if(!err) {

		eprocess(records);

	}
	});


return;


 function eprocess(records) {
 	let prevUser = '', machine = [], status = "",mechname = "";

	$("#ContentPlaceHolder1_ctl09_tblDeptDetail tbody > tr").each((index, element) => {


			user =         $("#ContentPlaceHolder1_ctl09_tblDeptDetail > tbody > tr:nth-child(" + index + ") > th:nth-child(1)").find('a').first().text() || user;
			let mach =     $("#ContentPlaceHolder1_ctl09_tblDeptDetail > tbody > tr:nth-child(" + index + ") > th:nth-child(2)").find('a').first().text() || [];
			machname = $("#ContentPlaceHolder1_ctl09_tblDeptDetail > tbody > tr:nth-child(" + index + ") > th:nth-child(3) > div").text() || "";
			problem =      $("#ContentPlaceHolder1_ctl09_tblDeptDetail > tbody > tr:nth-child(" + index + ") > th:nth-child(4)").find('img').attr('src') || "";


			if(user !== prevUser) {
				machine = []
			}

			switch(problem) {
				case 'images/redx.png':
					status = 'Seems to be missing some critical patches or system updates.'
					machine.push(machname.trim() + "</td><td>" + mach.trim() + "</td><td>" + status.trim());
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
			if(user && (machine.length > 0)) {

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
					  author: '<a href="mailto:ejnewman@mitre.org?subject=DTS Report">Eric Newman</a>',
					  email: found.email.padEnd(40, ' '),
					  compliantCount: compliantCount,
					  nonCompliantCount: nonCompliantCount,
					  notReportingCount: notReportingCount,
					  totalMachines: totalMachines
					}
					let html = template(data);
						sendEmail(html, found.fname, found.email)
					}
			}
	});
}


function  sendEmail(html, uname, address) {

			if(mode !== 'test') {

				console.log('Send to ' + address);


			   let transporter = nodemailer.createTransport({
				 port: 25,
				 host: 'mail.mitre.org',
				 secure: false,
				 ignoreTLS: true
			   })
			   let info = transporter.sendMail({
					from: 'ejnewman@mitre.org',
					to: 'ejnewman@mitre.org',
					subject: uname + '\'s DTS Reminder',
					html: html,
					text: html.replace(/(<([^>]+)>)/ig,""),
					eplyTo: 'ejnewman@mitre.org',
					onError: (e) => {
						console.log(e)
					},
					onSuccess: (i) => {
						console.log('Success: '+ address)
					}

			   })
   				console.log("Message sent: %s", info.messageId)


// 				nodeoutlook.sendEmail({
// 					auth: {
// 						user: "ejnewman@mitre.org",
// 						pass: emailpw
// 					},
// 					from: 'ejnewman@mitre.org',
// 					to: 'ejnewman@mitre.org',
// 					subject: uname + '\'s DTS Reminder',
// 					html: html,
// 					text: html.replace(/(<([^>]+)>)/ig,""),
// 					replyTo: 'ejnewman@mitre.org',
// 					onError: (e) => {
// 						console.log(e)
// 					},
// 					onSuccess: (i) => {
// 						console.log('Success: '+ address)
// 					}
// 				})
			} else {
				console.log('skipping send to ' + address);
			}
	}