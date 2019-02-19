process.env.NODE_ENV === 'development' && require("dotenv").config();
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

const dburl = process.env.DATABASEURL;
mongoose.connect(dburl, { useNewUrlParser: true, useCreateIndex: true });
mongoose.set('debug', true);
app.use(methodOverride("_method"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(flash());

app.use(session({
    name: 'awesome-session',
    secret: process.env.SESSION_ID,
    resave: false,
    saveUninitialized: false,
    store: new mongoStore({ mongooseConnection: mongoose.connection }),
    cookie: {
        maxAge: (6 * 30 * 24 * 60 * 60 * 1000),
    }
}));

app.use(csrf({ cookie: true })); // place below session and cookieparser and above any router config

app.use(function(err, req, res, next) {
    req.flash('error', err.message);
    next(err);
});

app.use(indexRoute);
app.use('/admin', adminRoute);
app.use('/login', authRoute);

app.get('*', function(req, res) {
    res.send(`<h1> you bloody hell.. don't try to  mess with me.</h1>`);
});

app.listen(process.env.PORT || 8080, process.env.IP, () => {
    console.log(`server is running on port: ${process.env.PORT}`);
});
