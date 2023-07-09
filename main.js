const express = require("express");
const cors = require("cors");

// const auth1 = require("./auth1.js");
const auth2 = require("./auth5.js");

const app = express();
app.use(cors());
const PORT = process.env.PORT || 8080;
// const __dirname = dirname(fileURLToPath(import.meta.URL));

app.use(express.json());
app.use("/auth", auth2);

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/login.html");
});

app.listen(PORT, () => {
	console.log(`Server is listening at http://localhost:${PORT}`);
});
