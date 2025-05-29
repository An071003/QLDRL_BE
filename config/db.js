const { Sequelize } = require('sequelize');
const fs = require('fs');
require('dotenv').config();
console.log("🧪 DB_SSL_CA =", process.env.DB_SSL_CA);
console.log("🧪 DB_HOST =", process.env.DB_HOST);
console.log("🧪 DB_PORT =", process.env.DB_PORT);
console.log("🧪 DB_NAME =", process.env.DB_NAME);
console.log("🧪 DB_USER =", process.env.DB_USER);
console.log("🧪 DB_PASSWORD", process.env.DB_PASSWORD);

const sequelize = new Sequelize(
  process.env.DB_NAME,     
  process.env.DB_USER,     
  process.env.DB_PASSWORD, 
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: {
        ca: fs.readFileSync(process.env.DB_SSL_CA)
      }
    }
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