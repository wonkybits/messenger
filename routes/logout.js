const express = require('express');
const router = express.Router();
const ldbg = require('debug')('logout:ldbg');
const dotenv = require('dotenv');
const util = require('util');
const url = require('url');
const querystring = require('querystring');

dotenv.config();

router.get('/lgo', (req, res) => {
   console.log('before req.logout()');
   req.logout();
   console.log('after req.logout()');

   let returnTo = req.protocol + '://' + req.hostname;
   console.log('returnTo = ' + returnTo);
   const port = req.connection.localPort;
   console.log('port = ' + port);
   if (port !== undefined && port !== 80 && port !== 443) {
      returnTo += ':' + port;
   }
   returnTo += '/logout';
   console.log('returnTo(with port) = ' + returnTo);

   let logoutURL = new url.URL(
       util.format('https://%s/v2/logout', process.env.AUTH0_DOMAIN)
   );

   const searchString = querystring.stringify({
      client_id: process.env.AUTH0_CLIENT_ID,
      returnTo: returnTo
   });
   logoutURL.search = searchString;
   console.log('logoutURL = ' + logoutURL);

   res.redirect(logoutURL);
});

router.get('/logout' , (req, res) => {
   res.render('logout');
});

module.exports = router;