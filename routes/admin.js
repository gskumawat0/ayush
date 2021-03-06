const express = require("express");
const router = express.Router();
const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

//middlewares
const { isLoggedIn } = require("../middlewares");

const {
	AWS_SECRET_ACCESS,
	AWS_ACCESS_KEY,
	BUCKET_REGION,
	BUCKET_NAME,
} = process.env;

// require models
const Admin = require("../models/admin");
const Message = require("../models/message");

//setup s3 bucket
const s3 = new aws.S3({
	secretAccessKey: AWS_SECRET_ACCESS,
	accessKeyId: AWS_ACCESS_KEY,
	region: BUCKET_REGION,
});

const upload = multer({
	storage: multerS3({
		s3: s3,
		bucket: BUCKET_NAME,
		acl: "public-read-write",
		metadata: function (req, file, cb) {
			cb(null, { fieldName: file.fieldname });
		},
		key: function (req, file, cb) {
			cb(null, Date.now().toString() + "-" + file.originalname);
		},
	}),
});

const singleUpload = upload.single("image");

//show admin page
router.get("/", isLoggedIn, async function (req, res) {
	try {
		let sitePromise = Admin.findOne({});
		let messagesPromise = Message.find({
			date: { $gt: Date.now() - 1000 * 60 * 60 * 24 * 31 },
		});
		let [site, messages] = await Promise.all([
			sitePromise,
			messagesPromise,
		]);
		res.render("admin", { csrfToken: req.csrfToken(), site, messages });
	} catch (err) {
		req.flash("error", err.message);
		res.redirect("back");
	}
});

// handle youtube video urls upload
router.post("/videos", isLoggedIn, async function (req, res) {
	try {
		let { ytVideoUrl } = req.body;
		await Admin.findOneAndUpdate(
			{},
			{ $push: { videos: { ytVideoUrl } } },
			{ upsert: true, new: true }
		);
		req.flash("success", "you successfully inserted a video");
		res.redirect("back");
	} catch (err) {
		req.flash("error", err.message);
		res.redirect("back");
	}
});

//handle video delete request
router.delete("/videos/:videoId", isLoggedIn, async function (req, res) {
	try {
		await Admin.findOneAndUpdate(
			{},
			{ $pull: { videos: { _id: req.params.videoId } } },
			{ new: true }
		);
		req.flash("success", `Successfully deleted a Video`);
		res.redirect("back");
	} catch (err) {
		req.flash("error", err.message);
		res.redirect("back");
	}
});

//  handle slider image upload
router.put("/slide/:imageKey", isLoggedIn, singleUpload, async function (
	req,
	res
) {
	try {
		await s3.deleteObject({
			Bucket: BUCKET_NAME,
			Key: req.params.imageKey,
		}).promise();

		let image = req.file.location;
		let { key } = req.file;
		await Admin.findOneAndUpdate(
			{},
			{ $pull: { images: { key: req.params.imageKey } } },
			{ upsert: true, new: true }
		);
		await Admin.findOneAndUpdate(
			{},
			{ $push: { images: { key, image } } },
			{ upsert: true, new: true }
		);
		req.flash("success", "Successfully updated a slider image");
		res.redirect("back");
	} catch (err) {
		if (req.file) {
			await s3
				.deleteObject({
					Bucket: BUCKET_NAME,
					Key: req.file.key,
				})
				.promise();
		}
		req.flash("error", err.message);
		res.redirect("back");
	}
});

router.post("/profile/image", isLoggedIn, singleUpload, async function (
	req,
	res
) {
	try {
		let { imagekey } = req.params;
		if (imagekey) {
			await s3
				.deleteObject({
					Bucket: BUCKET_NAME,
					Key: req.params.imagekey,
				})
				.promise();
		}
		let image = req.file.location;
		let { key } = req.file;

		await Admin.findOneAndUpdate(
			{},
			{ $set: { profileImg: { image, key } } },
			{ new: true }
		);
		req.flash("success", "Successfully updated your profile image");
		res.redirect("back");
	} catch (err) {
		if (req.file) {
			await s3
				.deleteObject({
					Bucket: BUCKET_NAME,
					Key: req.file.key,
				})
				.promise();
		}
		req.flash("error", err.message);
		res.redirect("back");
	}
});

router.put(
	"/profile/image/:imagekey",
	isLoggedIn,
	singleUpload,
	async function (req, res) {
		try {
			let { imagekey } = req.params;
			if (imagekey) {
				await s3
					.deleteObject({
						Bucket: BUCKET_NAME,
						Key: req.params.imagekey,
					})
					.promise();
			}
			let image = req.file.location;
			let { key } = req.file;

			await Admin.findOneAndUpdate(
				{},
				{ $set: { profileImg: { image, key } } },
				{ new: true }
			);
			req.flash("success", "Successfully updated your profile image");
			res.redirect("back");
		} catch (err) {
			if (req.file) {
				await s3
					.deleteObject({
						Bucket: BUCKET_NAME,
						Key: req.file.key,
					})
					.promise();
			}
			req.flash("error", err.message);
			res.redirect("back");
		}
	}
);

module.exports = router;
