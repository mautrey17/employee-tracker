//dependencies
const inquirer = require("inquirer");
const mysql = require("mysql");

//establish connection with MySQL
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "1234",
  database: "employee_trackerdb",
});

//function to view individual employee
function viewEmployee() {
    const currentEmployeeArr = [];
    connection.query('select id, first_name, last_name from employee', (err, data) => {
        if (err) throw err;

        //get employees from MySQL, put in array to use in inquirer prompt
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

            connection.query('select employee.first_name, employee.last_name, role.title, role.salary, department.dept_name from employee inner join role on employee.role_id = role.id inner join department on role.department_id = department.id where employee.last_name = ?', [chosenEmployee], (error, dataFinal) => {
                if(error)throw error;
                console.table(dataFinal)
                menu();
            })
        })
    })
}

//function to view department 
function viewDepartment() {
    const currentDepartmentArr = [];
    connection.query('select dept_name from department', (err, data) => {
        if (err) throw err;

        //get employees from MySQL, put in array to use in inquirer prompt

        data.forEach(department => {
            currentDepartmentArr.push(department.dept_name)
        });

        inquirer.prompt({
            name: 'viewDept',
            type: 'list',
            message: 'Which department would you like to view?',
            choices: currentDepartmentArr
        })
        .then(response => {
            let chosenDepartment = response.viewDept;

            connection.query('select employee.first_name, employee.last_name, role.title, role.salary, department.dept_name from employee inner join role on employee.role_id = role.id inner join department on role.department_id = department.id where department.dept_name = ?', [chosenDepartment], (error, dataFinal) => {
                if(error)throw error;
                console.table(dataFinal)
                menu();
            })
        })
    })
}

function menu() {
    inquirer.prompt({
        type: 'list',
        message: 'What would you like to do?',
        choices: ['Add an employee', 'Add a department', 'Add a role', 'View a department', 'View roles', 'View an employee', 'Update employee roles', 'Quit'],
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