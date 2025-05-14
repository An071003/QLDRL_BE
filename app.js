const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const authRoutes = require("./routers/auth.routes");
const roleRoutes = require("./routers/role.routes")
const userRoutes = require("./routers/user.routes");
const permissionRoutes = require("./routers/permission.routes");
const rolePermissionRoutes = require("./routers/rolePermission.routes")
// const criteriaRoutes = require("./routers/criteriaRoutes");
// const semesterRoutes = require("./routers/semesterRoutes");
// const campaignRoutes = require("./routers/campaignRoutes");
// const activityRoutes = require("./routers/activityRoutes");
// const studentActivityRoutes = require("./routers/studentActivityRoutes");
// const studentRoutes = require("./routers/studentRouter");

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/roles", roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/role-permissions', rolePermissionRoutes);
app.use("/api/users", userRoutes);
// app.use("/api/students", studentRoutes);
// app.use('/api/criteria', criteriaRoutes);
// app.use('/api/semesters', semesterRoutes);
// app.use("/api/campaigns", campaignRoutes);
// app.use('/api/activities', activityRoutes);
// app.use('/api/student-activities', studentActivityRoutes);


app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
});
