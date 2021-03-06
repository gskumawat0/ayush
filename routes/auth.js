const express = require("express");
const router = express.Router({ mergeParams: true });
const passport = require("passport");
const nodemailer = require("nodemailer");
const User = require("../models/user");
const crypto = require("crypto");
const { isUser } = require("../middlewares");
const {
	PROJECT_EMAIL,
	PROJECT_EMAIL_USER,
	PROJECT_EMAIL_PWD,
	PROJECT_EMAIL_HOST,
	ADMIN_CODE,
} = process.env;

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
	host: PROJECT_EMAIL_HOST,
	port: 465,
	secure: true, // true for 465, false for other ports
	auth: {
		user: PROJECT_EMAIL_USER, // generated ethereal user
		pass: PROJECT_EMAIL_PWD, // generated ethereal password
	},
});

//authentication routes
router.get("/signup", isUser, function (req, res) {
	res.render("auth/signup", { csrfToken: req.csrfToken() });
});

router.post("/signup", isUser, function (req, res) {
	let { username, email, adminCode } = req.body;
	if (adminCode !== ADMIN_CODE) {
		req.flash(
			"error",
			`you are not allowed. if you have any query, message me <a href='/#contact'>here<a>.`
		);
		return res.redirect("back");
	}
	let newUser = new User({ email, username });
	User.register(newUser, req.body.password, function (error, user) {
		if (error) {
			console.log(error);
		} else {
			passport.authenticate("local")(req, res, async function () {
				try {
					let signupMailOptions = {
						from: PROJECT_EMAIL, // sender address
						to: req.user.email, // list of receivers
						subject: `welcome onBoard`, // Subject line
						html: `<p>Hi </p>, 
                            <p>you have recently signup at iayushsharma.co.in.</p>                        
                            <p>your username : ${req.user.username}</p>
                            <p>Thanks</p>
                            `,
					};
					transporter.sendMail(signupMailOptions);
					req.flash("success", "successfully Signed In");
					res.redirect(`/admin`);
				} catch (err) {
					req.flash("error", err.message);
					return res.redirect("back");
				}
			});
		}
	});
});

//login route
router.get("/login", isUser, function (req, res) {
	res.render("auth/login", { csrfToken: req.csrfToken() });
});

router.post(
	"/login",
	passport.authenticate("local", {
		failureRedirect: "/auth/login",
		failureFlash: true,
	}),
	function (req, res) {
		req.flash("success", "welcome back");
		res.redirect(`/admin`);
	}
);

//logout
router.get("/logout", function (req, res) {
	req.session.urlToForward = undefined;
	req.logout();
	req.flash("success", "successfully logged out");
	res.redirect("/auth/login");
});

// forgot password
router.get("/forget-password", isUser, function (req, res) {
	res.render("auth/forget-pwd", { csrfToken: req.csrfToken() });
});

// handle form submission and generate new reset token
router.post("/forget-password", isUser, async function (req, res, next) {
	try {
		let token = await crypto.randomBytes(20).toString("hex");
		let user = await User.findOne({ email: req.body.email });
		if (!user) throw Error("No account with that email address exists.");
		let newUser = await User.findOneAndUpdate(
			{ email: req.body.email, username: req.body.username },
			{
				$set: {
					resetPasswordToken: token,
					resetPasswordExpires: Date.now() + 1000 * 60 * 10,
				},
			},
			{ new: true }
		);
		let resetMailOption = {
			to: newUser.email,
			from: PROJECT_EMAIL,
			subject: "Password Reset",
			html: `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account on IAyushSharma.</p>
            <p>Please click on the following link, or paste this into your browser to complete the process:</p>
            <p>https://${req.headers.host}/reset-password/${newUser.resetPasswordToken}</p>
            <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
 
            <p>IAyushSharma</p>`,
		};
		transporter.sendMail(resetMailOption);
		req.flash(
			"success",
			"An e-mail has been sent to " +
				user.email +
				" with further instructions."
		);
		res.redirect("back");
	} catch (err) {
		req.flash("error", err.message);
		return res.redirect("back");
	}
});

// send form to reset password
router.get("/reset-password/:token", isUser, async function (req, res) {
	try {
		let user = await User.findOne({
			resetPasswordToken: req.params.token,
			resetPasswordExpires: { $gt: Date.now() },
		});
		if (!user)
			throw Error("Password reset token is invalid or has expired.");
		res.render("auth/reset-pwd", {
			token: req.params.token,
			csrfToken: req.csrfToken(),
		});
	} catch (err) {
		req.flash("error", err.message);
		return res.redirect("/auth/forget-password");
	}
});

// change password here

router.post("/reset-password/:token", isUser, async function (req, res) {
	try {
		let user = await User.findOne({
			resetPasswordToken: req.params.token,
			resetPasswordExpires: { $gt: Date.now() },
		});
		if (!user)
			throw Error("Password reset token is invalid or has expired.");
		if (req.body.password === req.body.confirm) {
			user.setPassword(req.body.password, function (err) {
				if (err) throw err;
				user.resetPasswordToken = undefined;
				user.resetPasswordExpires = undefined;
				user.save();
			});
		} else {
			throw Error("Passwords do not match.");
		}
		let confirnMailOption = {
			to: user.email,
			from: PROJECT_EMAIL,
			subject: "Your password has been changed on iayushsharma.co.in",
			html: `  <p>Hi,</p>
                <p>This is a confirmation that the password for your account ${user.email} on IAyushSharma has just changed.</p>
                <p>if this is not done by you, please contact us at gskumawat555@gmail.com as soon as possible to neutralize the possible damage.</p> 
                `,
		};
		transporter.sendMail(confirnMailOption);
		req.flash("success", "Success! Your password has been changed.");
		res.redirect("/admin");
	} catch (err) {
		req.flash("error", err.message);
		return res.redirect("back");
	}
});

module.exports = router;
