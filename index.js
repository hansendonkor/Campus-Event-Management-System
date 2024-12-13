const express = require("express");
const cors = require("cors");
require("dotenv").config();
const User = require("./models/User");
const Ticket = require("./models/Ticket");
const Event = require("./models/Event");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const path = require("path");

const app = express();

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = process.env.JWT_SECRET || "your_jwt_secret";

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173", // Frontend origin
  })
);

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database connection via Sequelize
const sequelize = require("./config/database");
sequelize
  .authenticate()
  .then(() => console.log("Database connected..."))
  .catch((err) => console.error("Error connecting to database:", err));

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to file name
  },
});
const upload = multer({ storage });

// Helper Functions
const isAdmin = (user) => user && user.role === "admin";

// Create default admin user
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ where: { role: "admin" } });
    if (!adminExists) {
      await User.create({
        name: "Admin",
        email: "admin@example.com",
        password: bcrypt.hashSync("admin123", bcryptSalt),
        role: "admin",
      });
      console.log("Default admin created");
    }
  } catch (err) {
    console.error("Error creating default admin:", err);
  }
};
createDefaultAdmin();

// Routes
app.get("/test", (req, res) => res.json("test ok"));

app.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userRole = role || "user"; // Default role
    const user = await User.create({
      name,
      email,
      password: bcrypt.hashSync(password, bcryptSalt),
      role: userRole,
    });

    res.status(201).json({ message: "Registration successful", user });
  } catch (error) {
    console.error("Error during registration:", error);

    // Handle duplicate email error
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        error: "Duplicate entry",
        details: "This email is already registered. Please log in instead.",
      });
    }

    // Generic error response
    res.status(500).json({ error: "Registration failed", details: error.message });
  }
});


app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({
      where: { email },
      attributes: ["id", "name", "email", "password", "role"],
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const passOk = bcrypt.compareSync(password, user.password);
    if (!passOk) return res.status(401).json({ error: "Invalid password" });

    const token = jwt.sign(
      { email: user.email, id: user.id, role: user.role },
      jwtSecret,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, { httpOnly: true }).json({ user, token });
  } catch (e) {
    console.error("Error during login:", e);
    res.status(500).json({ error: "Login failed", details: e.message });
  }
});

app.get("/profile", async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findByPk(decoded.id, { attributes: ["id", "name", "email", "role"] });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("Error verifying token:", err);
    res.status(401).json({ error: "Failed to authenticate token" });
  }
});

app.post("/createEvent", upload.single("image"), async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findByPk(decoded.id);

    if (!isAdmin(user)) {
      return res.status(403).json({ error: "Only admins can create events" });
    }

    const { title, description, eventDate, eventTime, location } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : "";

    if (!title || !description || !eventDate || !eventTime || !location) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const eventData = { title, description, date: eventDate, time: eventTime, location, image };
    const event = await Event.create(eventData);

    res.status(201).json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Failed to create event", details: error.message });
  }
});

app.get("/events", async (req, res) => {
  try {
    const events = await Event.findAll();
    res.json(events);
  } catch (error) {
    console.error("Failed to fetch events:", error);
    res.status(500).json({ error: "Failed to fetch events", details: error.message });
  }
});


app.get("/event/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const event = await Event.findByPk(id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    res.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ error: "Failed to fetch event", details: error.message });
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
