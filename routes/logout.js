const express = require('express');
const router = express.Router();
const ldbg = require('debug')('logout:ldbg');
const dotenv = require('dotenv');
const util = require('util');
const url = require('url');
const querystring = require('querystring');

dotenv.config();

router.get('/lgo', (req, res) => {
   let returnTo = req.protocol + '://' + req.hostname;
   const port = req.connection.localPort;
   if (port !== undefined && port !== 80 && port !== 443) {
      returnTo = process.env.NODE_ENV === 'production' ? `${returnTo}/logout` : `${returnTo}:${port}/logout`;
   }

   req.logout();

   if(req.session) {
      req.session.destroy( (err) => {
         if(err) console.error(err);

         let logoutURL = new url.URL(
             util.format('https://%s/v2/logout', process.env.AUTH0_DOMAIN)
         );

         const searchString = querystring.stringify({
            client_id: process.env.AUTH0_CLIENT_ID,
            returnTo: returnTo
         });
         logoutURL.search = searchString;

         res.redirect(logoutURL);
      });
   }
});

router.get('/logout' , (req, res) => {
   res.render('logout');
});

module.exports = router;