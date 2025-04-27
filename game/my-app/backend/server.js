const express = require("express");
const dotenv = require("dotenv");
const app = require("./app"); // Import the main Express app

// Load environment variables
dotenv.config({ path: "../.env" });

const PORT = process.env.SERVER_PORT || 8080;


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
