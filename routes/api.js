const express = require('express');
const router = express.Router();
const AppDatabase = require('../database/AppDatabase');
const jwt = require('jsonwebtoken');
const app = require('../app');
const codes = require('../database/codes');

/* POST /rest/api/login  */
router.post('/login', async function(req, res) {

	const data = req.body.login;
	if (data) {

		const db = new AppDatabase();
		const user = await db.fetchUser(data.username);

		if (user && user.pwd === pwd) {
			response200(res, null);
		} else {
			response403(res, {code: user.isError ? user.code : codes.UNKNOWN_ERROR, message: "Forbidden: Invalid credentials"});
		}
		return;
	}

	response409({code: user.isError ? user.code : codes.UNKNOWN_ERROR, message: "Conflict: No data provided"});
});

/* POST /rest/api/register  */
router.post('/register', async function(req, res) {

	res.json(true);
	return;
	const usr = req.body.usr;
	if (usr) {
		const db = new AppDatabase();
		const _id = await db.insertUser(usr);

		if (_id) {
			let token = generateDefaultToken();
			res.status(200);
			res.end({token: token, id: _id});
		} else {

		}
	}

	res.status(409);
	res.end({code: user.isError ? user.code : codes.UNKNOWN_ERROR, message: "No data provided"});
});

/* JWT Middleware */
router.use(function (req, res, next) {
	const token = req.headers['access-token'];
	if (token) {
		jwt.verify(token, app.get('secret'), (err, decoded) => {
			if (err) {
				return res.json({ mensaje: 'Token inválida' });
			} else {
				req.decoded = decoded;
				next();
			}
		});
	} else {
		res.send({
			mensaje: 'Token no proveída.'
		});
	}
});

// =====================================================================================================================
// Util methods
// =====================================================================================================================

/* Response */

function response200(res, data, tokenData = null) {
	tokenData = getToken(tokenData);
	sendResponse(res, data, tokenData, 200);
}

function response403(res, data, tokenData = null) {
	tokenData = getToken(tokenData);
	sendResponse(res, data, tokenData, 403);
}

function response409(res, data, tokenData = null) {
	tokenData = getToken(tokenData);
	sendResponse(res, data, tokenData, 409);
}

function response410(res, data, tokenData = null) {
	tokenData = getToken(tokenData);
	sendResponse(res, data, tokenData, 410);
}

function sendResponse(res, data, token, status) {
	let json;
	if (data) {
		json = {
			token: token,
			data: data
		};
	} else {
		json = {
			token: token
		};
	}
	res.status(status);
	res.json(json);
}

/* Token */

function getToken(tokenData = null) {
	if (!tokenData) {
		return generateDefaultToken();
	} else {
		return generateToken(tokenData.data, tokenData.expiresIn);
	}
}

function generateDefaultToken() {
	return generateToken({checked: true}, 1440 /* 24h */);
}

function generateToken(data, expiresIn) {
	return jwt.sign(data, app.get('secret'), {
		expiresIn: expiresIn
	});
}


module.exports = router;
