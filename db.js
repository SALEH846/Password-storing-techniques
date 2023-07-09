const pg = require("pg");

const pool = new pg.Pool({
	host: "localhost",
	port: 5432,
	user: "postgres",
	password: "lahore321",
	database: "auth",
	max: 20,
	connectionTimeoutMillis: 0,
	idleTimeoutMillis: 0,
});

module.exports = { pool };
