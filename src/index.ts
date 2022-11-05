const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = process.env.PORT;

app.get("/healthcheck", (req: any, res: any) => {
  res.send("wallet is up and running");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
