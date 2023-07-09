// Method - 2
// Store the hashed password in the database
const express = require("express");
const crypto = require("crypto");
const { pool } = require("./db.js");
const router = express.Router();

function sha256(txt) {
	const secret = "abcdefg";
	const hash = crypto.createHmac("sha256", secret).update(txt).digest("hex");

	return hash;
}

// login post request
router.post("/login", async (req, res) => {
	const sql =
		"select username from auth2 where username = $1 and password = $2";
	const result = await pool.query(sql, [
		req.body.username,
		sha256(req.body.password),
	]);

	// Failed to find the user
	if (result.rowCount === 0) {
		res.send({ error: "Incorrect username or password." });
	} else {
		res.send({ sucess: "Logged in successfully." });
	}
});

// Signup post request
router.post("/register", async (req, res) => {
	// check if user already exist
	const sql = "select username from auth2 where username = $1";
	const result = await pool.query(sql, [req.body.username]);

	// Sucess, user does not already exist, create it
	if (result.rowCount === 0) {
		await pool.query("insert into auth2 (username, password) values ($1, $2)", [
			req.body.username,
			sha256(req.body.password),
		]);
		res.send({ success: "User created successfully" });
	} else {
		res.send({ error: "User already exists" });
	}
});

module.exports = router;
