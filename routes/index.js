const express = require("express");
const router = express.Router();

router.get('/', function(req, res) {
    try {
        res.render('index');
    }
    catch (err) {
        console.log(err);
        res.redirect('back');
    }
});



module.exports = router;
