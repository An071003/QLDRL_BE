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

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

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

app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
});
