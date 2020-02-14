// (c) 2020 The MITRE Corporation. All Rights Reserved.

const fs = require('fs');
const cheerio = require("cheerio");
const handlebars = require('handlebars');
const parse = require("csv-parse");
const nodemailer = require('nodemailer')

const fname = "Desktop Steward Compliance Report.html";

const data = fs.readFileSync(fname, 'utf8');

const $ = cheerio.load(data);
let mode = process.argv[2] || '';

const people = fs.readFileSync('contacts.csv', 'utf8');
let  found = user = machine = status = problem = "", badcount=0;

let compliantCount    = $("#ContentPlaceHolder1_lblCompliantCnt").text();
let nonCompliantCount = $("#ContentPlaceHolder1_lblNCCnt").text();
let notReportingCount = $("#ContentPlaceHolder1_lblWaivedCnt").text();
let totalMachines     = $("#ContentPlaceHolder1_lblTotal").text();

const styles = fs.readFileSync('styles.css', 'utf8');

const source = styles + fs.readFileSync('template.html', 'utf8');
const template = handlebars.compile(source);
const csource = styles + fs.readFileSync('ctemplate.html', 'utf8');
const ctemplate = handlebars.compile(csource);

let bads = [], glbads = [];

	parse(people, {
	  columns: ['dts_name', 'email', 'fname', 'manager'],
	  skip_empty_lines: true
	}, function(err, records){
		if(!err) {
			eprocess(records);
			//cprocess();
			//glprocess(records);
		} else {
			console.log(err)
		}
	});

//  function cprocess() {
// 	let data = {
// 	  author: '<a href="mailto:ejnewman@mitre.org?subject=DTS Report">Eric Newman</a>',
// 	  recipient: 'Cindy',
// 	  bads: bads,
// 	  compliantCount: compliantCount,
// 	  nonCompliantCount: nonCompliantCount,
// 	  notReportingCount: notReportingCount,
// 	  totalMachines: totalMachines
// 	}
// 	let html = ctemplate(data);
//
// 	mode = 'cindy'
// 	sendEmail(html, 'Cindy', 'Eric', 'Cindy\'s DTS Updates Report Summary')
//  }
 function glprocess(records) {
	let data = {
	  author: '<a href="mailto:ejnewman@mitre.org?subject=DTS Report">Eric Newman</a>',
	  recipient: 'TBD',
	  bads: glbads,
	  compliantCount: compliantCount,
	  nonCompliantCount: nonCompliantCount,
	  notReportingCount: notReportingCount,
	  totalMachines: totalMachines
	}

	Object.keys(glbads).forEach(function (key) {
		data.bads = glbads[key];
		let p = records.find( d => d.email === key )
		if(p ) {
			data.recipient = p.fname
			let html = ctemplate(data);

			mode = 'gl'
			sendEmail(html, data.recipient, key, 'Group Leads\'s DTS Updates Report Summary')
		}

	});

}


 function eprocess(records) {
 	let prevUser = '', machine = [], status = "",mechname = "";

	$("#ContentPlaceHolder1_ctl09_tblDeptDetail tbody > tr").each((index, element) => {


			user =         $("#ContentPlaceHolder1_ctl09_tblDeptDetail > tbody > tr:nth-child(" + index + ") > th:nth-child(1)").find('a').first().text() || user;

			if(user) {

				let mach =     $("#ContentPlaceHolder1_ctl09_tblDeptDetail > tbody > tr:nth-child(" + index + ") > th:nth-child(2)").find('a').first().text() || [];
				machname = 	   $("#ContentPlaceHolder1_ctl09_tblDeptDetail > tbody > tr:nth-child(" + index + ") > th:nth-child(3) > div").text() || "";
				problem =      $("#ContentPlaceHolder1_ctl09_tblDeptDetail > tbody > tr:nth-child(" + index + ") > th:nth-child(4)").find('img').attr('src') || "";

				cuser = user.replace(',', ' ') // Kill the spurious commas

				found = records.find( d => d.dts_name === cuser )

				if(user !== prevUser) {
					machine = []
				}

				switch(problem) {
					case 'images/redx.png':
						status = 'Missing some critical patches or system updates.'
						machine.push(machname.trim() + "</td><td>" + mach.trim() + "</td><td>" + status.trim());
						let baduser = user.trim() + "</td><td>" + machname.trim() + "</td><td>" + mach.trim()
						bads.push(baduser);
						if(!glbads[found.manager]) {glbads[found.manager] = []}
						glbads[found.manager].push(baduser)
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

				if(cuser && (machine.length > 0)) {

					//found = records.find( d => d.dts_name === user )
					if(!found) {
						console.log("Missing Name: " + cuser)
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
							sendEmail(html, found.fname, found.email, found.fname + '\'s DTS updates reminder',)
						}
					}
			}
	});
}


function  sendEmail(html, uname, address, title) {

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
					to: 'ejnewman@mitre.org', //address
					subject: title,
					html: html,
					text: html.replace(/(<([^>]+)>)/ig,""),
					replyTo: 'ejnewman@mitre.org',
					onError: (e) => {
						console.log(e)
					},
					onSuccess: (i) => {
						console.log('Success: '+ address)
					}

			   })
				if(mode == 'just1') {
					mode = 'test';
				}

			} else {
				console.log('skipping send to ' + address);
			}
	}