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

//function to view all employees
function viewAll() {
    connection.query(
        `select 
            employee.first_name, 
            employee.last_name,
            employee.manager_id, 
            role.title, 
            role.salary, 
            department.dept_name 
        from employee 
        inner join 
            role on employee.role_id = role.id 
        inner join 
            department on role.department_id = department.id `, (error, dataFinal) => {
        if(error)throw error;
        console.table(dataFinal)
        menu();
    })
}

//function to view individual employee
function viewEmployee() {
    connection.query('select id, first_name as firstName, last_name as lastName from employee', (err, employees) => {
        if (err) throw err;
        //get employees from MySQL, put in array to use in inquirer prompt

        const currentEmployees = employees.map(({firstName, lastName}) => `${firstName} ${lastName}`)

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
                    employee.manager_id,
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
    //Get current roles and other employees
    connection.query(
        `select 
            title as roleTitle, 
            id as roleId 
        from role`, (err, roles) => {
        if (err) throw err;

        //get roles from MySQL, put in array of objects to combine with id
        const currentRoles = roles.map(({roleTitle, roleId}) => ({
            role: `${roleTitle}`,
            value: roleId
        }))
        //put roles into in array to use in inquirer prompt
        const roleChoices = currentRoles.map(({role}) => `${role}`)

        //get employee list information for manager
        connection.query(`
        select
            first_name as firstName, 
            last_name as lastName, 
            id as empId
        from employee`, (err2, emp) => {

            const currentEmployees = emp.map(({firstName, lastName, empId}) => ({
                name: `${firstName} ${lastName}`,
                value: empId
            }))
            const employeeChoices = currentEmployees.map(({name}) => `${name}`)

            //get necessary information for new role
            inquirer.prompt([
                {
                    name: 'newFirstName',
                    type: 'input',
                    message: "What is the employee's first name?",
                },
                {
                    name: 'newLastName',
                    type: 'input',
                    message: "What is the employee's last name?",
                },
                {
                    name: 'newRole',
                    type: 'list',
                    message: 'What is the role of the new employee?',
                    choices: roleChoices
                },
                {
                    name: 'newManager',
                    type: 'list',
                    message: 'Who is the manager of the new employee?',
                    choices: employeeChoices
                }
            ]).then(({newFirstName, newLastName, newRole, newManager}) => {
                let roleID;
                let indexOfRole;
                let managerId;
                let indexOfManager;
                //get the id of the desired department
                function findID(){
                    roleChoices.forEach(entry => {
                        if(entry === newRole){
                            indexOfRole = roleChoices.indexOf(entry);
                            roleID = currentRoles[indexOfRole].value;
                        }
                    })
                    employeeChoices.forEach(entry => {
                        if(entry === newManager){
                            indexOfManager = employeeChoices.indexOf(entry);
                            managerId = currentEmployees[indexOfManager].value;
                        }
                    })
                }
                findID();

                //insert into MySQL
                connection.query(
                    `insert into employee (first_name, last_name, role_id, manager_id)
                    values (?, ?, ?, ?)`, [newFirstName, newLastName, roleID, managerId], (error, dataFinal) => {
                    if(error)throw error;
                    console.log(`${newFirstName} ${newLastName} has been added to employees`)
                    menu();
                })
            })
        })   
    })
}

function addDepartment() {
    //get necessary information for new role
    inquirer.prompt([
        {
            name: 'newName',
            type: 'input',
            message: 'What is the new department called?',
        }
    ]).then(({newName}) => {

        //insert into MySQL
        connection.query(
            `insert into department (dept_name)
            value (?)`, [newName], (error, dataFinal) => {
            if(error)throw error;
            console.log(`${newName} has been added to departments`)
            menu();
        })
    })
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

function updateEmployeeRoles(){
    //Get current roles and other employees
    connection.query(
        `select 
            title as roleTitle, 
            id as roleId 
        from role`, (err, roles) => {
        if (err) throw err;

        //get roles from MySQL, put in array of objects to combine with id
        const currentRoles = roles.map(({roleTitle, roleId}) => ({
            role: `${roleTitle}`,
            value: roleId
        }))
        //put roles into in array to use in inquirer prompt
        const roleChoices = currentRoles.map(({role}) => `${role}`)

        //get employee list information for manager
        connection.query(`
        select
            first_name as firstName, 
            last_name as lastName, 
            id as empId
        from employee`, (err2, emp) => {

            const currentEmployees = emp.map(({firstName, lastName, empId}) => ({
                name: `${firstName} ${lastName}`,
                value: empId
            }))
            const employeeChoices = currentEmployees.map(({name}) => `${name}`)

            //get necessary information for new role
            inquirer.prompt([
                {
                    name: 'employeeToUpdate',
                    type: 'list',
                    message: "Which employee would you like to update?",
                    choices: employeeChoices
                },
                {
                    name: 'newRole',
                    type: 'list',
                    message: 'What is the role of the new employee?',
                    choices: roleChoices
                }
            ]).then(({employeeToUpdate, newRole}) => {
                let roleID;
                let indexOfRole;
                let employeeId;
                let indexOfEmployee;
                //get the id of the desired department
                function findID(){
                    roleChoices.forEach(entry => {
                        if(entry === newRole){
                            indexOfRole = roleChoices.indexOf(entry);
                            roleID = currentRoles[indexOfRole].value;
                        }
                    })
                    employeeChoices.forEach(entry => {
                        if(entry === employeeToUpdate){
                            indexOfEmployee = employeeChoices.indexOf(entry);
                            employeeId = currentEmployees[indexOfEmployee].value;
                        }
                    })
                }
                findID();

                //insert into MySQL
                connection.query(`
                    update employee 
                    set role_id = ?
                    where id = ?`, [roleID, employeeId], (error, dataFinal) => {
                    if(error)throw error;
                    console.log(`Employee updated`)
                    menu();
                })
            })
        })   
    })
}

function deleteEmployee() {

        //Get current roles and other employees


        // connection.query(
        //     `select 
        //         title as roleTitle, 
        //         id as roleId 
        //     from role`, (err, roles) => {
        //     if (err) throw err;
    
        //     //get roles from MySQL, put in array of objects to combine with id
        //     const currentRoles = roles.map(({roleTitle, roleId}) => ({
        //         role: `${roleTitle}`,
        //         value: roleId
        //     }))
        //     //put roles into in array to use in inquirer prompt
        //     const roleChoices = currentRoles.map(({role}) => `${role}`)

    
            //get employee list information for manager
            connection.query(`
            select
                first_name as firstName, 
                last_name as lastName, 
                id as empId
            from employee`, (err2, emp) => {
    
                const currentEmployees = emp.map(({firstName, lastName, empId}) => ({
                    name: `${firstName} ${lastName}`,
                    value: empId
                }))
                const employeeChoices = currentEmployees.map(({name}) => `${name}`)
    
                //get necessary information for new role
                inquirer.prompt([
                    {
                        name: 'deleteEmployee',
                        type: 'list',
                        message: 'Which employee would you like to delete?',
                        choices: employeeChoices
                    }
                ]).then(({deleteEmployee}) => {
                    let employeeId;
                    let indexOfEmployee;
                    //get the id of the desired department
                    function findID(){
                        employeeChoices.forEach(entry => {
                            if(entry === deleteEmployee){
                                indexOfEmployee = employeeChoices.indexOf(entry);
                                employeeId = currentEmployees[indexOfEmployee].value;
                            }
                        })
                    }
                    findID();
    
                    //insert into MySQL
                    connection.query(
                        `delete from employee 
                         where id = ?`, [employeeId], (error, dataFinal) => {
                        if(error)throw error;
                        console.log(`Employee has been deleted`)
                        menu();
                    })
                })
            })   
        
    
}

//Starter function that holds all options
function menu() {
    inquirer.prompt({
        type: 'list',
        message: 'What would you like to do?',
        choices: ['View all employees', 'View an employee', 'View employees by department', 'View employees by role', 'Add an employee', 'Add a department', 'Add a role', "Update an employee's role", 'Delete an employee', 'Quit'],
        name: 'desiredAction'
    }).then(response => {
        switch (response.desiredAction){
            case 'View all employees':
                viewAll();
                break;
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
            case "Update an employee's role":
                updateEmployeeRoles();
                break;
            case 'Delete an employee':
                deleteEmployee();
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