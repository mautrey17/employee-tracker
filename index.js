const inquirer = require("inquirer");
const mysql = require("mysql");

const conn = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "1234",
  database: "employee_trackerdb",
});


function menu() {
    inquirer.prompt({
        type: 'list',
        message: 'What would you like to do?',
        choices: ['Add an employee', 'Add a department', 'Add a role', 'View departments', 'View roles', 'View employees', 'Update employee roles'],
        name: 'desiredAction'
    }).then(response => {
        switch (response.desiredAction){
            case 'Add an employee':
                addEmployee();
                break;
            case 'Add a department':
                addDepartment();
                break;
            case 'Add a role':
                addRole();
                break;
            case 'View a department':
                viewDepartment();
                break;
            case 'View an employee':
                viewEmployee();
                break;
            case 'View a role':
                viewRole();
                break;
            case 'Add a role':
                updateEmployeeRole();
                break;
            default:
                console.log('Goodbye!');
                conn.end();
        }
    })
}

conn.connect((err) => {
  if (err) throw err;
  console.log(`connect to db as id ${conn.threadId}`);
});
