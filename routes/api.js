const express = require('express');
const router = express.Router();
const AppDatabase = require('../database/AppDatabase');
const jwt = require('jsonwebtoken');
const app = require('../app');

/* POST /rest/api/login  */

router.post('/login', async function(req, res) {

	let pwd = req.body.pwd;
  	let username = req.body.username;

  	if (pwd && username) {

		const db = new AppDatabase();
		const user = await db.fetchUser(username);

		if (user && user.pwd === pwd) {

			let token = jwt.sign({checked: true}, app.get('secret'), {
				expiresIn: 1440
			});
			res.status(200);
			res.end({token: token});

		} else {

			res.status(409);
			res.end({code: /* TODO */ false, message: "Invalid credentials"});

		}

		return;
  	}

  	res.status(410);
  	res.end({code: /* TODO */ false, message: "No data provided"});

});

module.exports = router;
