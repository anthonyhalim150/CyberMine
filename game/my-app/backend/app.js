const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const logger = require("./middleware/loggerMiddleware");
const { authenticateToken } = require("./middleware/authMiddleware");
const errorHandler = require("./middleware/errorHandlerMiddleware");
const userRoutes = require("./routes/userRoutes");
const upgradeRoutes = require("./routes/upgradeRoutes");
const equipmentRoutes = require("./routes/equipmentRoutes.js");
const luckyBoxRoutes = require("./routes/luckyBoxRoutes.js");
const cookieParser = require("cookie-parser");

const app = express();
app.use(cookieParser());

// Apply middleware
app.use(bodyParser.json()); // Parse JSON requests
app.use(logger); // Log requests


const allowedOrigins = [
  "http://127.0.0.1:5500",
  "https://cybermall.netlify.app",
  "https://cybermine.netlify.app", 
  "https://anthony-halim-portfolio.netlify.app",
  "http://localhost:3000",
];


app.use(cors({
  origin: (origin, callback) => {
      if (!origin || allowedOrigins.some((allowed) => {
          return typeof allowed === "string"
              ? allowed === origin
              : allowed.test(origin); // Check regex match
      })) {
          callback(null, true); // Allow the request
      } else {
          callback(new Error("Not allowed by CORS")); // Block the request
      }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed HTTP methods
  credentials: true, // Allow cookies and credentials
}));

app.use(authenticateToken);


app.get("/", (req, res) => {
    res.send("Welcome to the API!");
  });
  
// Routes
app.use("/api", userRoutes); // Add authentication middleware if needed
// app.use("/api", authenticateToken, userRoutes);
app.use("/api", upgradeRoutes);
app.use("/api", equipmentRoutes);
app.use("/api", luckyBoxRoutes);

// Error handling middleware (should come last)
app.use(errorHandler);

module.exports = app;
