const express = require('express');
const router = express.Router();

// landing route
router.get('/', (req, res) => {
    res.render('landing');
});

module.exports = router;