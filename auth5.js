const express = require("express");
const router = express.Router();
const { pool } = require("./db.js");
const crypto = require("crypto");

// helper functions
function encryptAES(plainText, key) {
	const encrypt = crypto.createCipher("aes256", key);
	let encrypted = encrypt.update(plainText, "utf8", "hex");
	encrypted += encrypt.final("hex");
	return encrypted;
}
function decryptAES(encryptedText, key) {
	try {
		const decrypt = crypto.createDecipher("aes256", key);
		let decrypted = decrypt.update(encryptedText, "hex", "utf8");
		decrypted += decrypt.final();
		return decrypted;
	} catch (error) {
		return error;
	}
}

// register/signup POST request handler
router.post("/register", async (req, res, next) => {
	// check if user already exist
	const sql = "select * from auth5 where username = $1";
	const result = await pool.query(sql, [req.body.username]);

	// success, if user does not exist
	if (result.rowCount === 0) {
		const data = encryptAES(req.body.username, req.body.password);

		await pool.query("insert into auth5 (username, userdata) values ($1, $2)", [
			req.body.username,
			data,
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
	const sql = "select * from auth5 where username = $1";
	const result = await pool.query(sql, [req.body.username]);

	// fail, if user doesn't exist
	if (result.rowCount === 0) {
		return res
			.status(400)
			.json({ message: "The username or password is incorrect!" });
	} else {
		// if user exist in the DB with the same username the compare passwords
		const encryptedData = result.rows[0].userdata;

		const data = decryptAES(encryptedData, req.body.password);

		return res.status(200).json({ data: data });
	}
});

module.exports = router;
