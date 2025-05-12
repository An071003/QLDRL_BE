// const mysql = require('mysql2');

// const db = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   multipleStatements: true
// });

// db.connect((err) => {
//   if (err) {
//     console.error("❌ Kết nối MySQL thất bại:", err);
//   } else {
//     console.log("✅ Kết nối MySQL thành công");
//   }
// });

// module.exports = db;


const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,     
  process.env.DB_USER,     
  process.env.DB_PASSWORD, 
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
  }
);

sequelize.authenticate()
  .then(() => {
    console.log("✅ Kết nối MySQL thành công");
  })
  .catch((err) => {
    console.error("❌ Kết nối MySQL thất bại:", err);
  });

module.exports = sequelize;