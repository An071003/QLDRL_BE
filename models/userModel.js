const db = require("../config/db");

exports.findUserByUsername = (username) => {
    db.query("SELECT * FROM users WHERE username = ?", [username], (err, result) => {
        if (err) throw err;
        return result[0];
    });
};

exports.findUserById = (id) => {
   db.query("SELECT * FROM users WHERE id = ?", [id], (err, result) => {
        if (err) throw err;
        return result[0];
    });
};
