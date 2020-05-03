const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

// require models
const Message = require("../models/message");
const Admin = require("../models/admin");

const {
	PROJECT_EMAIL,
	PROJECT_EMAIL_USER,
	PROJECT_EMAIL_PWD,
	PROJECT_EMAIL_HOST,
	ADMIN_EMAIL,
} = process.env;
// nodemailer setup
// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
	host: PROJECT_EMAIL_HOST,
	port: 587,
	secure: false, // true for 465, false for other ports
	auth: {
		user: PROJECT_EMAIL_USER, // generated ethereal user
		pass: PROJECT_EMAIL_PWD, // generated ethereal password
	},
});

router.get("/", async function (req, res) {
	try {
		let site = await Admin.findOne({});
		// console.log(site);
		res.render("index", { csrfToken: req.csrfToken(), site });
	} catch (err) {
		req.flash("error", err.message);
		res.redirect("/");
	}
});

router.post("/", async function (req, res) {
	try {
		let message = await Message.create(req.body);
		// email for customer
		let welcomeMailOptions = {
			from: PROJECT_EMAIL, // sender address
			to: message.email, // list of receivers
			subject: `thanks for contacting us`, // Subject line
			html: `<p>Hi ${message.name}</p>,
            <p> A big thank you for show request </p> 
            <p> Your show details are as below: </p> 
            <p> name : ${message.name}, </p>
            <p> email: ${message.email}, </p>
            <p> contact no.: ${message.mobile}, </p>
            <p> location: ${message.location}, </p>
            <p> duration: ${message.duration}, </p>
            <p> message: ${message.message} </p>
            <p> Show date: ${message.showDate} </p>

            <p> Ayush Sharma </p>`,
		};
		transporter.sendMail(welcomeMailOptions);

		//email for ayush
		let myMailOptions = {
			from: PROJECT_EMAIL, // sender address
			to: [`gskumawat555@gmail.com`, ADMIN_EMAIL], // list of receivers
			subject: `you have a new request for a show`, // Subject line
			html: `<p> Hi, </p>
            <p> you got a new request for a show. details are enlisted below : </p>
            <p> name : ${message.name}, </p>
            <p> email: ${message.email},  </p>
            <p> contact no.: ${message.mobile}, </p>
            <p> location: ${message.location}, </p>
            <p> duration: ${message.duration}, </p>
            <p> message: ${message.message} </p>
            <p> Show date: ${message.showDate} </p>

            <p> pat on your back. you are now becomming popular. </p>`,
		};
		transporter.sendMail(myMailOptions);
		req.flash(
			"success",
			"Thanks for contacting us. shortly you will receive confirmation for same."
		);
		res.redirect("/#contact");
	} catch (err) {
		req.flash("error", err.message);
		res.redirect("/#contact");
	}
});

module.exports = router;
