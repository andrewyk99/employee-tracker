const cTable = require('console.table');
const inquirer = require('inquirer');
const db = require('./config/connection');

// Main prompt that starts the application
function mainPrompt() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'mainMenu',
            message: 'What would you like to do?',
            choices: [ // All choices for the user to see
                'View ...',
                'Add ...',
                'Update ...',
                'Delete ...',
                'Quit'
            ]
        }
    ]).then(answers => {
        const { mainMenu } = answers;
        switch(mainMenu) { // Switch case that calls all the other functions
            case 'View ...':
                viewMenu();
                break;
            case 'Add ...':
                addMenu();
                break;
            case 'Update ...':
                updateMenu();
                break;
            case 'Delete ...':
                deleteMenu();
                break;
            case 'Quit':
                console.log('Goodbye!');
                db.then(conn => conn.end());
                break;
            default:
                console.log('Something broke');
                break;
        }
    })
}

// Function that shows all the options under the 'View...' choice
function viewMenu() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'viewList',
            message: 'What would you like to view?',
            choices: [
                'Departments',
                'Roles',
                'Employees',
                'View employees by manager',
                'View employees by department',
                'View total budget by department',
                'Go back'
            ]
        }
    ]).then(answers => {
        const { viewList } = answers;
        switch(viewList) {
            case 'Departments':
                showDepartments();
                break;
            case 'Roles':
                showRoles();
                break;
            case 'Employees':
                showEmployees();
                break;
            case 'View employees by manager':
                showEmployeeByManger();
                break;
            case 'View employees by department':
                showEmployeeByDepartment();
                break;
            case 'View total budget by department':
                showBudget();
                break;
            case 'Go back':
                mainPrompt();
                break;
            default:
                console.log('Something broke');
                break;
        }
    })
}

// Function that shows the departments table
function showDepartments() {
    const sql = `SELECT * FROM departments`;
    db.then(conn => conn.query(sql))
        .then(([rows, fields]) => console.table(rows))
        .then(closeApp);
}

// Function that shows the roles table
function showRoles() {
    const sql = `SELECT * FROM roles`;
    db.then(conn => conn.query(sql))
        .then(([rows, fields]) => console.table(rows))
        .then(closeApp);
}

// Function that shows the employees table
function showEmployees() {
    const sql = `SELECT * FROM employees`;
    db.then(conn => conn.query(sql))
        .then(([rows, fields]) => console.table(rows))
        .then(closeApp);
}

// Function that asks the user to provide a manager ID to show all the employees under that manager
function showEmployeeByManger() {
    inquirer.prompt([
        {
            type: 'number',
            name: 'manager_id',
            message: "Select a manger ID to see the rest of their team (Manager ID is a number).\nIf you wish to view a list of managers, leave blank."
        }
    ])
        .then(data => {
            if (!data.manager_id) {
                const sql = `SELECT * FROM employees WHERE manager_id IS NULL`;
                db.then(conn => conn.query(sql))
                .then(([rows, fields]) => {
                    if (rows.length  === 0) {
                        console.log('There are no employees without managers.');
                        closeApp();
                    }
                    else {
                        console.table(rows);
                        closeApp();
                    }
                });
            }
            else {
                const sql = `SELECT * FROM employees WHERE manager_id = ?`;
                const params = [data.manager_id];
                db.then(conn => conn.query(sql, params))
                    .then(([rows, fields]) => {
                        if (rows.length === 0) {
                            console.log('There are no employees under this manager ID.');
                            closeApp();
                        }
                        else {
                            console.table(rows);
                            closeApp();
                        }
                    })
            }
        })
}

// Asks the user what department they would like to see to show all the employees under that department
function showEmployeeByDepartment() {
    let departmentList = [];
    const sql = `SELECT * FROM departments`;
    db.then(conn => conn.query(sql))
        .then(([rows, fields]) => departmentList = rows.map(({ name }) => name)).then(() => {
            inquirer.prompt([
                {
                    type: 'list',
                    name: 'department_id',
                    message: "Which department's list of employees would you like to see?",
                    choices: departmentList
                }
            ]).then(data => {
                const sql = `SELECT employees.id, employees.first_name, employees.last_name, roles.title, employees.manager_id, departments.name
                            FROM employees
                            LEFT JOIN roles ON employees.role_id = roles.id
                            LEFT JOIN departments ON roles.department_id = departments.id
                            WHERE departments.name = ?`;
                const params = [data.department_id];
                db.then(conn => conn.query(sql, params))
                    .then(([rows, fields]) => {
                        if (rows.length === 0) { // Runs if there are no employees under that department
                            console.log('There are no employees under this department.');
                            closeApp();
                        }
                        else {
                            console.table(rows);
                            closeApp();
                        }
                    });
            });
        });
}

// Allows the user to select a department which the function will then display the total salary from all the employees in that department
function showBudget() {
    let departmentList = [];
    const sql = `SELECT * FROM departments`;
    db.then(conn => conn.query(sql))
        .then(([rows, fields]) => departmentList = rows.map(({ name }) => name)).then(() => {
            inquirer.prompt([
                {
                    type: 'list',
                    name: 'department_id',
                    message: "Which department's total budget would you like to see?",
                    choices: departmentList
                }
            ]).then(data => {
                let { department_id } = data;
                data.department_id = departmentList.indexOf(department_id) + 1;
                const sql = `SELECT roles.salary FROM employees
                             CROSS JOIN roles ON employees.role_id = roles.id
                             LEFT JOIN departments ON roles.department_id = department_id
                             WHERE departments.id = ?`;
                const params = [data.department_id];
                db.then(conn => conn.query(sql, params))
                    .then(([rows, fields]) => {
                        let budget = rows.map(({ salary }) => salary);
                        let totalBudget = 0;
                        budget.forEach(element => {
                            totalBudget += parseFloat(element);
                        });
                        console.log(`The total budget for ${department_id} is $${totalBudget}.`);
                        closeApp();
                    });
            });
        });
}

// Function that shows all the options under the main 'Add...' choice
function addMenu() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'addList',
            message: 'What would you like to add?',
            choices: [
                'Add a department',
                'Add a role',
                'Add an employee',
                'Go back'
            ]
        }
    ]).then(answers => {
        const { addList } = answers;
        switch(addList) {
            case 'Add a department':
                addDepartment();
                break;
            case 'Add a role':
                addRole();
                break;
            case 'Add an employee':
                addEmployee();
                break;
            case 'Go back':
                mainPrompt();
                break;
            default:
                console.log('Something broke');
                break;
        }
    })
}

// Function that allows the user to add an entirely new department
function addDepartment() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'departmentName',
            message: 'What is the name of the department you would like to add?'
        }
    ]).then(data => {
        const sql = `INSERT INTO departments (name) VALUES (?)`; // Inserts the new department with the given name into the the departments table
        const params = Object.values(data);
        db.then(conn => conn.query(sql, params))
            .then(() => {
                console.log(`Successfully added ${params}!`);
                closeApp();
            });
    });
}

// Function to add a new role and then places it into the roles table
function addRole() {
    let departmentList = [];
    const sql = `SELECT * FROM departments`;
    db.then(conn => conn.query(sql))
        .then(([rows, fields]) => departmentList = rows.map(({ name }) => name)).then(() => {
            inquirer.prompt([
                { // Asks the user what the title of the role would be
                    type: 'input',
                    name: 'title',
                    message: 'What is the name of the role you would like to add?'
                },
                { // Asks the user what the salary would be for the new role
                    type: 'number',
                    name: 'salary',
                    message: 'What is the salary of the role?'
                },
                { // Asks which department would hold this role
                    type: 'list',
                    name: 'department_id',
                    message: 'Which department is this role under?',
                    choices: departmentList
                }
            ]).then(data => {
                let { department_id } = data;
                data.department_id = departmentList.indexOf(department_id) + 1;
                const sql = `INSERT INTO roles (title, salary, department_id)
                             VALUES (?, ?, ?)`;
                const params = Object.values(data);
                db.then(conn => conn.query(sql, params))
                    .then(() => {
                        console.log(`Successfully added ${params[0]}!`);
                        closeApp();
                    });
        });
    });
}

// Function to add an employee
function addEmployee() {
    let roleList = []; // Creates an empty roleList array
    let employeeList = []; // Creates an empty employeeList array
    const sql = `SELECT * FROM roles`;
    db.then(conn => conn.query(sql))
        .then(([rows, fields]) => roleList = rows.map(({ title }) => title)).then(() => {
            const sql = `SELECT first_name, last_name FROM employees`;
            db.then(conn => conn.query(sql))
                .then(([rows, fields]) => employeeList = rows.map(({ first_name, last_name }) => first_name + " " + last_name))
                .then(() => {
                    employeeList.push('None');
                    inquirer.prompt([
                        { // Asks the user what the first name is for this employee
                            type: 'input',
                            name: 'first_name',
                            message: "What is the employee's first name?"
                        },
                        { // Asks for the employee's last name
                            type: 'input',
                            name: 'last_name',
                            message: "What is the employee's last name?"
                        },
                        { // Asks what their role would be
                            type: 'list', 
                            name: 'role_id',
                            message: "What is the employee's role?",
                            choices: roleList
                        },
                        { // Asks which manager this employee works for, if blank they would be a manager
                            type: 'list',
                            name: 'manager_id',
                            message: "What is the employee's manager's ID? (Select 'None' if adding manager)",
                            choices: employeeList
                        }
                    ]).then(data => {
                        let { role_id, manager_id } = data;
                        const sql = `SELECT id FROM roles WHERE title = ?`;
                        const params = role_id;
                        db.then(conn => conn.query(sql, params))
                            .then(([rows, fields]) => data.role_id = rows[0].id)
                            .then(() => {
                                if (manager_id === 'None') {
                                  const sql =  `INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, NULL)`;
                                  const params = [data.first_name, data.last_name, data.role_id];
                                  db.then(conn => conn.query(sql, params))
                                    .then(() => {
                                        console.log(`Successfully added ${params[0]} ${params[1]}!`);
                                        closeApp();
                                    });
                                }
                                else {
                                    const sql = `SELECT id FROM employees WHERE first_name = ? AND last_name = ?`;
                                    const params = manager_id.split(" ");
                                    db.then(conn => conn.query(sql, params))
                                        .then(([rows, fields]) => data.manager_id = rows[0].id)
                                        .then(() => {
                                            const sql = `INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES(?, ?, ?, ?)`;
                                            const params = Object.values(data);
                                            db.then(conn => conn.query(sql, params))
                                                .then(() => {
                                                    console.log(`Successfully added ${params[0]} ${params[1]}!`);
                                                    closeApp();
                                                });
                                        });
                                }
                            });
                        });    
        });
    });
}

// Displays the option that falls under the main 'Update...' choice
function updateMenu() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'updateList',
            message: 'What would you like to update?',
            choices: [
                "Update an employee's role",
                "Update an employee's manager",
                'Go back'
            ]
        }
    ]).then(answers => {
        const { updateList } = answers;
        switch(updateList) {
            case "Update an employee's role":
                updateEmployeeRole();
                break;
            case "Update an employee's manager":
                updateEmployeeManager();
                break;
            case 'Go back':
                mainPrompt();
                break;
            default:
                console.log('Something broke');
                break;
        }
    })
}

// Function to update/change an employee's role
function updateEmployeeRole() {
    let roleList = [];
    let employeeList = [];
    const sql = `SELECT * FROM roles`; // Shows the list of all the roles
    const sql2 = `SELECT first_name, last_name FROM employees`;  // Shows the list of employees with their first and last name
    db.then(conn => conn.query(sql))
        .then(([rows, fields]) => roleList = rows.map(({ title }) => title));
    db.then(conn => conn.query(sql2))
        .then(([rows, fields]) => employeeList = rows.map(({ first_name, last_name, }) => first_name + " " + last_name))
        .then(() => {
            inquirer.prompt([
                {
                    type: 'list',
                    name: 'employee_id',
                    message: "What is employee whose role you would like to change?",
                    choices: employeeList
                },
                {
                    type: 'list',
                    name: 'role_id',
                    message: "What is the employee's new role?",
                    choices: roleList
                }
            ]).then(data => {
                let { employee_id, role_id } = data;
                const sql = `SELECT id FROM employees WHERE first_name = ? AND last_name = ?`;
                const params = employee_id.split(" ");
                db.then(conn => conn.query(sql, params))
                    .then(([rows, fields]) => data.employee_id = rows[0].id)
                    .then(() => {
                        const sql = `SELECT id FROM roles WHERE title = ?`;
                        const params = role_id;
                        db.then(conn => conn.query(sql, params))
                            .then(([rows, fields]) => data.role_id = rows[0].id)
                            .then(() => {
                                const sql = `UPDATE employees SET role_id = ? WHERE id = ?`;
                                const params = [data.role_id, data.employee_id];
                                db.then(conn => conn.query(sql, params))
                                    .then(() => {
                                        console.log(`Successfully updated ${employee_id}'s role to ${role_id}!`);
                                        closeApp();
                                    });
                            });
                    });
            });
        });
}

// Update's which manager an employee has
function updateEmployeeManager() {
    let employeeList = [];
    let employeeIdList = [];
    const sql = `SELECT id, first_name, last_name FROM employees`;
    db.then(conn => conn.query(sql))
        .then(([rows, fields]) => {
            employeeList = rows.map(({ first_name, last_name }) => first_name + " " + last_name);
            employeeIdList = rows.map(({ id }) => id);
        }).then(() => {
            const managerList = [...employeeList];
            managerList.push('None'); // Creates a 'None' option in the managerList so that the user does not have to pick another employee to be their manager
            inquirer.prompt([
                {
                    type: 'list',
                    name: 'employee_id',
                    message: "Which employee would you like to change their manager?",
                    choices: employeeList
                },
                {
                    type: 'list',
                    name: 'manager_id',
                    message: "What is the employee's new manager's ID?(Can select none!)", // By selecting 'None', it makes that employee a manager
                    choices: managerList
                }
            ]).then(data => {
                if (data.manager_id === 'None') { // If statement that runs if user selects the pushed 'None' option
                    const sql = `UPDATE employees SET manager_id = NULL WHERE id = ?`;
                    const params = employeeIdList[employeeList.indexOf(data.employee_id)];
                    db.then(conn => conn.query(sql, params))
                        .then(() => {
                            console.log(`Successfully updated ${data.employee_id} as a manager!`);
                            closeApp();
                        });
                    }
                    else {
                        const sql = `UPDATE employees SET manager_id = ? WHERE id = ?`;
                        const params = [
                            employeeIdList[employeeList.indexOf(data.manager_id)],
                            employeeIdList[employeeList.indexOf(data.employee_id)]
                        ];
                        db.then(conn => conn.query(sql, params))
                            .then(() => {
                                console.log(`Successfully updated ${data.employee_id}'s manager to ${data.manager_id}!`);
                                closeApp();
                            });
                    }
                });
        });
}

// Function to display the available options under the main 'Delete...' choice
function deleteMenu() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'deleteList',
            message: 'What would you like to delete?',
            choices: [
                'Delete a department',
                'Delete a role',
                'Delete an employee',
                'Go back'
            ]
        }
    ]).then(answers => {
        const { deleteList } = answers;
        switch(deleteList) {
            case 'Delete a department':
                deleteDepartment();
                break;
            case 'Delete a role':
                deleteRole();
                break;
            case 'Delete an employee':
                deleteEmployee();
                break;
            case 'Go back':
                mainPrompt();
                break;
            default:
                console.log('Something broke');
                break;
        }
    })
}

// Function to delete an entire department
function deleteDepartment() {
    let departmentList = [];
    const sql = `SELECT * FROM departments`;
    db.then(conn => conn.query(sql))
        .then(([rows, fields]) => departmentList = rows.map(({ name }) => name)).then(() => {
            inquirer.prompt([
                {
                    type: 'list',
                    name: 'department_id',
                    message: "Which department would you like to delete?",
                    choices: departmentList
                }
            ]).then(data => {
                const sql = `DELETE FROM departments WHERE name = ?`;
                const params = [data.department_id];
                db.then(conn => conn.query(sql, params))
                    .then(() => {
                        console.log(`Successfully deleted ${data.department_id}!`);
                        closeApp();
                    });
            });
        });
}

function deleteRole() {
    let roleList = [];
    const sql = `SELECT * FROM roles`;
    db.then(conn => conn.query(sql))
        .then(([rows, fields]) => roleList = rows.map(({ title }) => title)).then(() => {
            inquirer.prompt([
                {
                    type: 'list',
                    name: 'role_id',
                    message: "Which role would you like to delete?",
                    choices: roleList
                }
            ]).then(data => {
                const sql = `DELETE FROM roles WHERE title = ?`;
                const params = [data.role_id];
                db.then(conn => conn.query(sql, params))
                    .then(() => {
                        console.log(`Successfully deleted ${data.role_id}!`);
                        closeApp();
                    });
            });
        });
}

function deleteEmployee() {
    let employeeList = [];
    const sql = `SELECT first_name, last_name FROM employees`;
    db.then(conn => conn.query(sql))
        .then(([rows, fields]) => employeeList = rows.map(({ first_name, last_name }) => first_name + " " + last_name))
        .then(() => {
            inquirer.prompt([
                {
                    type: 'list',
                    name: 'employee_id',
                    message: "Which employee would you like to delete?",
                    choices: employeeList
                }
            ]).then(data => {
                const sql = `SELECT id FROM employees WHERE first_name = ? AND last_name = ?`;
                const params = data.employee_id.split(" ");
                db.then(conn => conn.query(sql, params))
                    .then(([rows, fields]) => employee_id = rows[0].id)
                    .then(() => {
                        const sql = `DELETE FROM employees WHERE id = ?`;
                        const params = employee_id;
                        db.then(conn => conn.query(sql, params))
                            .then(() => {
                                console.log(`Successfully deleted ${data.employee_id}!`);
                                closeApp();
                            });
                    });
            });
        });
}

function closeApp() {
    inquirer.prompt([
        {
            type: 'confirm',
            name: 'goBack',
            message: 'Would you like to go back to the main menu?'
        }
    ]).then(data => {
        if (data.goBack) {
            mainPrompt();
        }
        else {
            console.log('Goodbye!');
            db.then(conn => conn.end());
        }
    });
}

mainPrompt();