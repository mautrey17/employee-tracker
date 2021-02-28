const inquirer = require("inquirer");
const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "1234",
  database: "employee_trackerdb",
});

function viewEmployee() {
    const currentEmployeeArr = [];
    connection.query('select id, first_name, last_name from employee', (err, data) => {
        if (err) throw err;

        data.forEach(employee => {
            let combineArr = [];
            let firstName = employee.first_name;
            let lastName = employee.last_name;
            combineArr.push(firstName, lastName);
            currentEmployeeArr.push(combineArr.join(' '))
        });

        inquirer.prompt({
            name: 'viewEmp',
            type: 'list',
            message: 'Which employee would you like to view?',
            choices: currentEmployeeArr
        }).then(response => {
            let separateNames = response.viewEmp.split(' ');
            let chosenEmployee = separateNames[1];

            connection.query('select * from employee where last_name = ?', [chosenEmployee], (error, dataFinal) => {
                if(error)throw error;
                console.table(dataFinal)
                menu();
            })
        })
    })
    
    // const query = conn.query('select * from employee', (err, data) => {
        // if (err) throw err;

    // })
}

function menu() {
    inquirer.prompt({
        type: 'list',
        message: 'What would you like to do?',
        choices: ['Add an employee', 'Add a department', 'Add a role', 'View departments', 'View roles', 'View an employee', 'Update employee roles'],
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
                connection.end();
        }
    })
}

connection.connect((err) => {
  if (err) throw err;
  console.log(`connect to db as id ${connection.threadId}`);
});

menu();