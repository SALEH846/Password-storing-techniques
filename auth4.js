const express = require("express");
const router = express.Router();
const { pool } = require("./db.js");
const bcrypt = require("bcrypt");

// register/signup POST request handler
router.post("/register", async (req, res, next) => {
	// check if user already exist
	const sql = "select * from auth4 where username = $1";
	const result = await pool.query(sql, [req.body.username]);

	// success, if user does not exist
	if (result.rowCount === 0) {
		// `bcrypt's` `hash` function will create a random salt automatically
		// and store it in the hashed password for future use
		const hash = await bcrypt.hash(req.body.password, 10);

		await pool.query("insert into auth4 (username, password) values ($1, $2)", [
			req.body.username,
			hash,
		]);

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
	const sql = "select * from auth4 where username = $1";
	const result = await pool.query(sql, [req.body.username]);

	// fail, if user doesn't exist
	if (result.rowCount === 0) {
		return res
			.status(400)
			.json({ message: "The username or password is incorrect!" });
	} else {
		// if user exist in the DB with the same username the compare passwords
		const saltedPassword = result.rows[0].password;

		const isSuccessful = await bcrypt.compare(
			req.body.password,
			saltedPassword
		);

		if (isSuccessful) {
			return res.status(200).json({ message: "The user is authenticated!" });
		} else {
			return res
				.status(400)
				.json({ message: "The username or password is incorrect!" });
		}
	}
});

module.exports = router;
