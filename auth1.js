// Method - 1
// Store the password in the database as the plain text
const express = require("express");
const { pool } = require("./db.js");
const router = express.Router();

// login post request
router.post("/login", async (req, res) => {
	const sql =
		"select username from auth1 where username = $1 and password = $2";
	const result = await pool.query(sql, [req.body.username, req.body.password]);

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
	const sql = "select username from auth1 where username = $1";
	const result = await pool.query(sql, [req.body.username]);

	// Sucess, user does not already exist, create it
	if (result.rowCount === 0) {
		await pool.query("insert into auth1 (username, password) values ($1, $2)", [
			req.body.username,
			req.body.password,
		]);
		res.send({ success: "User created successfully" });
	} else {
		res.send({ error: "User already exists" });
	}
});

module.exports = router;
