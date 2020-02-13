const nodemailer = require('nodemailer')
function main() {
   console.log('email function running!')
   let transporter = nodemailer.createTransport({
     port: 25,
     host: 'mail.mitre.org',
     secure: false,
     ignoreTLS: true
   })
   let info = transporter.sendMail({
       from: '"Eric" <ejnewman@mitre.org>',
       to: "ejnewman@mitre.org",
       subject: "Eric Test!",
       text: "Hello world?", // plain text body
       html: "<b>Hello world?</b>" // html body
   })
   console.log("Message sent: %s", info.messageId)
}
main()