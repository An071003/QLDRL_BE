const express = require('express')
const app = express()
const cors = require('cors')
const moviesRoutes = require("./api/movies.route");

app.use(cors());
app.use(express.json());


module.exports = app;