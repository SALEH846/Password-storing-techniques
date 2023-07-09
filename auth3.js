const express = require("express");
const router = express.Router();
const { pool } = require("./db.js");
const crypto = require("crypto");

// helper functions
function sha256(txt) {
	const secret = "This is a secret";
	const hash = crypto.createHmac("sha256", secret).update(txt).digest("hex");

	return hash;
}

async function randomSalt() {
	return crypto.randomBytes(64).toString("hex");
}

// register/signup POST request handler
router.post("/register", async (req, res, next) => {
	// check if user already exist
	const sql = "select * from auth3 where username = $1";
	const result = await pool.query(sql, [req.body.username]);

	// success, if user does not exist
	if (result.rowCount === 0) {
		const salt = await randomSalt();
		await pool.query(
			"insert into auth3 (username, password, salt) values ($1, $2, $3)",
			[req.body.username, sha256(req.body.password + salt), salt]
		);
		return res
			.status(200)
			.json({ message: "The user has been successfully registered!" });
	} else {
		return res.status(400).json({ message: "This user already exists..." });
	}
});

// login POST request
router.post("/login", async (req, res, next) => {
	// check if user exists
	const sql = "select * from auth3 where username = $1";
	const result = await pool.query(sql, [req.body.username]);

	// fail, if user doesn't exist
	if (result.rowCount === 0) {
		return res
			.status(400)
			.json({ message: "The username or password is incorrect!" });
	} else {
		// if user exist in the DB with the same username the compare passwords
		const saltedPassword = result.rows[0].password;
		const saltedUserPassword = sha256(req.body.password + result.rows[0].salt);
		if (saltedPassword === saltedUserPassword) {
			return res.status(200).json({ message: "The user is authenticated!" });
		} else {
			return res
				.status(400)
				.json({ message: "The username or password is incorrect!" });
		}
	}
});

module.exports = router;
