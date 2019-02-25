const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

// require models
const Message = require("../models/message");
const Admin = require("../models/admin");

// nodemailer setup
// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    host: 'smtp.stackmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'projectmail@nintia.in', // generated ethereal user
        pass: process.env.EMAIL_PWD // generated ethereal password
    }
});

router.get('/', async function(req, res) {
    try {
        let site = await Admin.findOne({});
        // console.log(site);
        res.render('index', { csrfToken: req.csrfToken(), site });
    }
    catch (err) {
        req.flash('error', err.message);
        res.redirect('/');
    }
});

router.post('/', async function(req, res) {
    try {
        let message = await Message.create(req.body);
        // email for customer
        let welcomeMailOptions = {
            from: '"Ayush Sharma 👻" <projectmail@nintia.in>', // sender address
            to: message.email, // list of receivers
            subject: `thanks for contacting us`, // Subject line
            text: `Hi ${message.name},
you contact us for a show with details enlisted below:  
name : ${message.name},
email: ${message.email},
contact no.: ${message.mobile},
location: ${message.location},
duration: ${message.duration},
message: ${message.message}
date: ${message.showDate}


Ayush Sharma`,
        };
        transporter.sendMail(welcomeMailOptions);

        //email for ayush
        // setup email data with unicode symbols
        let myMailOptions = {
            from: '"Ayush Sharma Website" <projectmail@nintia.in>', // sender address
            to: `gskumawat555@gmail.com`, // list of receivers
            subject: `you have a new request for a show`, // Subject line
            text: `Hi,
you got a new request for a show. details are enlisted below :
name : ${message.name},
email: ${message.email},
contact no.: ${message.mobile},
location: ${message.location},
duration: ${message.duration},
message: ${message.message}
date: ${message.showDate}

pat on your back. you are now becomming popular.
`,
        };
        transporter.sendMail(myMailOptions);
        req.flash('success', 'Thanks for contacting us. shortly you will receive confirmation for same.')
        res.redirect('/#contact');


    }
    catch (err) {
        req.flash('error', err.message);
        res.redirect('/#contact');
    }

});


module.exports = router;
