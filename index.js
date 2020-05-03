const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const session = require("express-session");
const csrf = require("csurf");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoStore = require("connect-mongo")(session);
const mongoose = require("mongoose");
const moment = require("moment");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
mongoose.Promise = global.Promise;

// require routes
const indexRoute = require("./routes/index");
const authRoute = require("./routes/auth");
const adminRoute = require("./routes/admin");

//require models
const User = require("./models/user");

const { DATABASEURL: dburl, NODE_ENV, SESSION_ID, PORT = 8000 } = process.env;
mongoose
	.connect(dburl, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
	})
	.then(console.log(`connection established`))
	.catch((err) => {
		console.log(err);
	});
if (NODE_ENV === "development") {
	mongoose.set("debug", true);
}

app.use(methodOverride("_method"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(flash());

app.use(
	session({
		name: "awesome-session",
		secret: SESSION_ID,
		resave: false,
		saveUninitialized: false,
		store: new mongoStore({ mongooseConnection: mongoose.connection }),
		cookie: {
			maxAge: 6 * 30 * 24 * 60 * 60 * 1000,
		},
	})
);

app.use(csrf({ cookie: true })); // place below session and cookieparser and above any router config

app.use(function (err, req, res, next) {
	req.flash("error", err.message);
	next(err);
});

//authorization
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(function (id, done) {
	User.findById(id, function (err, user) {
		done(err, user);
	});
});

app.use(function (req, res, next) {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	// res.locals.csrfToken = req.csrfToken();
	next();
});

app.use(indexRoute);
app.use("/auth", authRoute);
app.use("/admin", adminRoute);

app.get("*", function (req, res) {
	res.send(`<h1> you bloody hell.. don't try to  mess with me.</h1>`);
});

app.listen(PORT, () => {
	console.log(`server is running on port: ${PORT}`);
});
