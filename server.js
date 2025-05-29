const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const authRoutes = require("./routers/auth.routes");
const roleRoutes = require("./routers/role.routes");
const userRoutes = require("./routers/user.routes");
const permissionRoutes = require("./routers/permission.routes");
const rolePermissionRoutes = require("./routers/rolePermission.routes");
const facultyRoutes = require("./routers/faculty.routes");
const advisorRoutes = require("./routers/advisor.routes");
const classRoutes = require("./routers/class.routes");
const departmentOfficerRoutes = require("./routers/departmentOfficer.routes");
const criteriaRoutes = require("./routers/criteria.routes");
const campaignRoutes = require("./routers/campaign.routes");
const activityRoutes = require("./routers/activity.routes");
const studentActivityRoutes = require("./routers/studentActivity.routes");
const studentRoutes = require("./routers/student.routes");
const studentScoreRoutes = require("./routers/studentScore.routes");

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-XSRF-TOKEN', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Handle preflight requests
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// Add security headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || "http://localhost:3000");
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-XSRF-TOKEN, Cookie');
  next();
});

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/roles", roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/role-permissions', rolePermissionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/faculties", facultyRoutes);
app.use("/api/advisors", advisorRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/department-officers", departmentOfficerRoutes);
app.use('/api/criteria', criteriaRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/student-activities', studentActivityRoutes);
app.use('/api/student-scores', studentScoreRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log("🌐 Allowed CORS origin:", process.env.FRONTEND_URL || "http://localhost:3000");
});
