const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
const util = require('util');
const url = require('url');
const querystring = require('querystring');

dotenv.config();

router.get('/lgo', (req, res) => {
   req.logout();

   let returnTo = req.protocol + '://' + req.hostname;
   const port = req.connection.localPort;
   if (port !== undefined && port !== 80 && port !== 443) {
      returnTo += ':' + port;
   }
   returnTo += '/logout';

   let logoutURL = new url.URL(
       util.format('https://%s/v2/logout', process.env.AUTH0_DOMAIN)
   );

   console.log("returnTo = " + returnTo);
   const searchString = querystring.stringify({
      client_id: process.env.AUTH0_CLIENT_ID,
      returnTo: returnTo
   });
   logoutURL.search = searchString;

   res.redirect(logoutURL);
});

router.get('/logout' , (req, res) => {
   res.render('logout');
});

module.exports = router;