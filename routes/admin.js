const express = require("express");
const router = express.Router();


//show admin page
router.get('/', function(req, res) {
    res.render('admin', { csrfToken: req.csrfToken() })
})

// handle youtube video urls upload


//  handle slider image upload


//show live Shows request requested upto one month  earlier 


module.exports = router;
