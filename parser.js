// Tableau export has the following fields
// 1 header: EPI_CLASS
// 2 header: EPI_NAME
// 3 header: BARCODE
// 4 header: CHK_NAME
// 5 header: DUE_DATE (MDY)
// 6 header: OPS_OP_SYS
// 7 header: OPS_VERSION
// 8 header: EPI_OWNER_NAME
// 9 header: EMAIL_ADDRESS
// 10 header: EPI_OWNER_ORG
// 11 header: LAST_INV_DATE (MDY)
// 12 header: Blank
// 13 header: DUE_DATE
// 14 header: EPI_OWNER_ID
// 15 header: LAST_INV_DATE
// 16 header: OWNING_CENTER
// 17 header: VERSION

const fs = require('fs'); 
const csv = require('csv-parser');
const utf8 = require('to-utf-8')
const nodemailer = require("nodemailer");

let mode = process.argv[2];

let results = [];
let msg = "";
let email = "", machine = "", issue = "";
let bads = [];
let firsts = [];
let lasts = [];
let machines = [];
let cnt = 0;


function processTableau() {
    let records = [];
    fs.createReadStream("Department_data.csv")
        .pipe(utf8())
        .pipe(csv({separator:'\t'}))
        // .on('headers', (headers) => {
        //     console.log (headers.length)
        //     for(let o=0; o < headers.length;o+=1) {
        //         console.log(o + ` header: ${headers[o]}`)
        //     }
        // })
        .on('data', function(data){

            try {
                owner =  data.EPI_OWNER_NAME;
                machine = data.EPI_NAME;
                issue= data.CHK_NAME; //, email=`${ data.EMAIL_ADDRESS} `;
                email= data.EMAIL_ADDRESS;
                owner = owner.trim().split(',');
                own = owner[1].trim();
                let first = own.split(' ');
                if(first[1] !== undefined) {
                    own = first[0];
                }
                email = email.trim();
                
                if(results[email] === undefined) {
                    results[email] = [];
                    msg = "<html><body>Hi " + own + ",<br /><p>Please excuse this interruption. MITRE\'s Desktop Steward has noticed the following machine(s) that need attention. ";
                    msg += "These devices have been noted as needing some important update and/or security patches. ";
                    msg += "The FJ: DTS page will have more information and links to potential remedies. ";
                    msg += "Our department is trying to actively stay on top of any security vulnerabilities.</p>";
                    msg += '<div style="text-align:center; width:100%">';
                    msg += '<table border=1 width="90%" >';
                    msg += '<tr width="25%"><th bgcolor="#33D1FF">Machine</th><th bgcolor="#33D1FF">Issue</th></tr>';
                    results[email].push(msg);
                }
                msg = '<tr><td bgcolor="E5F4F9">' + machine + '</td><td bgcolor="#E5F4F9">' + issue + "</td></tr>";
                results[email].push(msg);
                let d = [];
                d.push(owner[1] + " " + owner[0]);
                d.push(machine);
                d.push(issue);
                if(bads[email] === undefined) {
					bads[email] = [];
                }
                bads[email].push(d);
            }
            catch(err) {
                //error handler
                console.log(err)
            }
        })
        .on('end',function(){

            for (let [key, value] of Object.entries(results)) {

                value = value.join(' ') + "</table></div><p/>This is just an FYI, so no need to contact me on this. ";
                value += "If you've already updated, you may need to run the MITRE updater app on your device to have changes register.";
                value += " As always any issues should go straight to the help desk.<p/>Thanks!<p/> Eric Newman</body></html>";
                //console.log(key, value);
                const title = "* Updates needed for your MITRE devices *";
                let email = key;
                //email = 'ejnewman@mitre.org'
                sendEmail(value, email, title);
                
            }
            dlprocess();

        });  
    
function sendEmail(html, address, title) {
	
	if (mode == "nosend") {
		address = "ejnewman@mitre.org";
	}
	
	console.log("Sending to " + address, mode);
	
	if (mode !== "nosend") {
		let transporter = nodemailer.createTransport({
			port: 25,
			host: "mail.mitre.org",
			secure: false,
			ignoreTLS: true,
		});
		let info = transporter.sendMail({
			from: "ejnewman@mitre.org",
			to: address, //'ejnewman@mitre.org', //address
			subject: title,
			html: html,
			text: html.replace(/(<([^>]+)>)/gi, ""),
			replyTo: "ejnewman@mitre.org",
			onError: (e) => {
				console.log(e);
			},
			onSuccess: (i) => {
				console.log("Success: " + address);
			},
		});
	
	}
 }
	//

	function dlprocess() {

		let DL = "Jenny";
		let DLmail = "jrekas@mitre.org";
		let msg = "";
		
		if (mode !== undefined) {
			DLmail = "ejnewman@mitre.org";
		}

		const title = "* Updates needed for our Department's MITRE devices *";

	
		let html = "<html><body>Hi " + DL + ",<br /><p>Please excuse this interruption. MITRE\'s Desktop Steward has noticed the following department machine(s) that need attention. ";
			html += "These devices have been noted as needing some important update and/or security patches. <p/>";
			html += '<div style="text-align:center; width:100%">';
			html += '<table border=1 width="90%" >';
			html += '<tr width="25%"><th bgcolor="#33D1FF">Person</th><th bgcolor="#33D1FF">Machine</th><th bgcolor="#33D1FF">Issue</th></tr>';
		
		Object.keys(bads).forEach(function (data) {
			let d = bads[data];
		
			html += '<tr><td bgcolor="E5F4F9">' + d[0][0] + '</td><td bgcolor="#E5F4F9">' + d[0][1] + "</td>";
			html += '<td bgcolor="#E5F4F9">' + d[0][2] + "</td></tr>";
			
			console.log (d[0][0]+ "|" + d[0][1]+ "|" + (d[0][2]).substr(0, 20));
		});
		html += "</table>";

		//console.log(html);
		sendEmail(html, DLmail, title);
		sendEmail(html, "ejnewman@mitre.org", title);
	
	};
}

processTableau();


//------------------------------------------
