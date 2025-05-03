const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const authRoutes = require("./routers/authRoutes");
const userRoutes = require("./routers/userRoutes");
const criteriaRoutes = require("./routers/criteriaRoutes");
const semesterRoutes = require("./routers/semesterRoutes");
const campaignRoutes = require("./routers/campaignRoutes");
const activityRoutes = require("./routers/activityRoutes");
const studentActivityRoutes = require("./routers/studentActivityRoutes");

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use('/api/criteria', criteriaRoutes);
app.use('/api/semesters', semesterRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/student-activities', studentActivityRoutes);


app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
});
