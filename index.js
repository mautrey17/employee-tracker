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
    connection.query('select id, first_name as firstName, last_name as lastName from employee', (err, employees) => {
        if (err) throw err;
        //get employees from MySQL, put in array to use in inquirer prompt

        const currentEmployees = employees.map(({firstName, lastName}) => `${firstName} ${lastName}`)
        console.log(currentEmployees);

        inquirer.prompt({
            name: 'viewEmp',
            type: 'list',
            message: 'Which employee would you like to view?',
            choices: currentEmployees
        }).then(({viewEmp}) => {
            // let separateNames = viewEmp.split(' ');
            // let chosenEmployee = separateNames[1];
            const chosenEmployee = viewEmp.split(' ').pop();

            connection.query(
                `select 
                    employee.first_name, 
                    employee.last_name, 
                    role.title, 
                    role.salary, 
                    department.dept_name 
                from employee 
                inner join 
                    role on employee.role_id = role.id 
                inner join 
                    department on role.department_id = department.id 
                where employee.last_name = ?`, [chosenEmployee], (error, dataFinal) => {
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

function viewRole() {
    connection.query('select title as roleTitle from role', (err, roles) => {
        if (err) throw err;

        //get roles from MySQL, put in array to use in inquirer prompt
        const currentRoles = roles.map(({roleTitle}) => `${roleTitle}`)
        console.log(currentRoles);

        inquirer.prompt({
            name: 'viewRole',
            type: 'list',
            message: 'Which role would you like to view?',
            choices: currentRoles
        }).then(({viewRole}) => {
            const chosenRole = viewRole;

            connection.query(
                `select 
                    employee.first_name, 
                    employee.last_name, 
                    role.title, 
                    role.salary, 
                    department.dept_name 
                from employee 
                inner join 
                    role on employee.role_id = role.id 
                inner join 
                    department on role.department_id = department.id 
                where role.title = ?`, [chosenRole], (error, dataFinal) => {
                if(error)throw error;
                console.table(dataFinal)
                menu();
            })
        })
    })
}

function addEmployee() {

}

function addDepartment() {

}

function addRole() {
    //Get current departments
    connection.query('select id, dept_name as deptName from department', (err, depts) => {
        if (err) throw err;

        //get departments from MySQL, put in array of objects to combine with id
        const currentDepartments = depts.map(({id, deptName}) => ({
            department: `${deptName}`,
            value: id
        }))
        //put departments into in array to use in inquirer prompt
        const departmentChoices = currentDepartments.map(({department}) => `${department}`)

        //get necessary information for new role
        inquirer.prompt([
            {
                name: 'newTitle',
                type: 'input',
                message: 'What is the new role called?',
            },
            {
                name: 'newSalary',
                type: 'input',
                message: 'What is the new salary?',
            },
            {
                name: 'newDept',
                type: 'list',
                message: 'What is the department for the new role?',
                choices: departmentChoices
            },
        ]).then(({newTitle, newSalary, newDept}) => {
            let departmentID;
            let indexOfDept
            //get the id of the desired department
            function findID(){
                departmentChoices.forEach(entry => {
                    if(entry === newDept){
                        indexOfDept = departmentChoices.indexOf(entry);
                        departmentID = currentDepartments[indexOfDept].value;
                    }
                })
            }
            findID();

            //insert into MySQL
            connection.query(
                `insert into role (title, salary, department_id)
                values (?, ?, ?)`, [newTitle, newSalary, departmentID], (error, dataFinal) => {
                if(error)throw error;
                console.log(`${newTitle} has been added to roles`)
                menu();
            })
        })
    })
}

function menu() {
    inquirer.prompt({
        type: 'list',
        message: 'What would you like to do?',
        choices: ['View an employee', 'View employees by department', 'View employees by role', 'Add an employee', 'Add a department', 'Add a role', 'Update employee roles', 'Quit'],
        name: 'desiredAction'
    }).then(response => {
        switch (response.desiredAction){
            case 'View an employee':
                viewEmployee();
                break;
            case 'View employees by department':
                viewDepartment();
                break;
            case 'View employees by role':
                viewRole();
                break;
            case 'Add an employee':
                addEmployee();
                break;
            case 'Add a department':
                addDepartment();
                break;
            case 'Add a role':
                addRole();
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