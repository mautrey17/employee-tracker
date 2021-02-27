const inquirer = require("inquirer");
const mysql = require("mysql");

const conn = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "1234",
  database: "employee_trackerdb",
});




conn.connect((err) => {
  if (err) throw err;
  console.log(`connect to db as id ${conn.threadId}`);
});
