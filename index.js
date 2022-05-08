const cTable = require('console.table');
const inquirer = require('inquirer');
const db = require('./config/connection');

function mainPrompt() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'mainMenu',
            message: 'What would you like to do?',
            choices: [
                'View ...',
                'Add ...',
                'Update ...',
                'Delete ...',
                'Quit'
            ]
        }
    ]).then(answers => {
        const { mainMenu } = answers;
        switch(mainMenu) {
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

function showDepartments() {
    const sql = `SELECT * FROM departments`;
    db.then(conn => conn.query(sql))
        .then(([rows, fields]) => console.table(rows))
        .then(closeApp);
}

function showRoles() {
    const sql = `SELECT * FROM roles`;
    db.then(conn => conn.query(sql))
        .then(([rows, fields]) => console.table(rows))
        .then(closeApp);
}

function showEmployees() {
    const sql = `SELECT * FROM employees`;
    db.then(conn => conn.query(sql))
        .then(([rows, fields]) => console.table(rows))
        .then(closeApp);
}

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
                let { department_id } = data;
                data.department_id = departmentList.indexOf(department_id) + 1;
                const sql = `SELECT employees.id, employees.first_name, employees.last_name, roles.title, employees.manager_id, departments.name
                            FROM employees
                            CROSS JOIN roles ON employees.role_id = roles.id
                            LEFT JOIN departments ON roles.department_id = department_id
                            WHERE departments.id = ?`;
                const params = [data.department_id];
                db.then(conn => conn.query(sql, params))
                    .then(([rows, fields]) => {
                        if (rows.length === 0) {
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

function addDepartment() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'departmentName',
            message: 'What is the name of the department you would like to add?'
        }
    ]).then(data => {
        const sql = `INSERT INTO departments (name) VALUES (?)`;
        const params = Object.values(data);
        db.then(conn => conn.query(sql, params))
            .then(() => {
                console.log(`Successfully added ${params}!`);
                closeApp();
            });
    });
}

function addRole() {
    let departmentList = [];
    const sql = `SELECT * FROM departments`;
    db.then(conn => conn.query(sql))
        .then(([rows, fields]) => departmentList = rows.map(({ name }) => name)).then(() => {
            inquirer.prompt([
                {
                    type: 'input',
                    name: 'title',
                    message: 'What is the name of the role you would like to add?'
                },
                {
                    type: 'number',
                    name: 'salary',
                    message: 'What is the salary of the role?'
                },
                {
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

function addEmployee() {
    let roleList = [];
    const sql = `SELECT * FROM roles`;
    db.then(conn => conn.query(sql))
        .then(([rows, fields]) => roleList = rows.map(({ title }) => title)).then(() => {
            inquirer.prompt([
                {
                    type: 'input',
                    name: 'first_name',
                    message: "What is the employee's first name?"
                },
                {
                    type: 'input',
                    name: 'last_name',
                    message: "What is the employee's last name?"
                },
                {
                    type: 'list', 
                    name: 'role_id',
                    message: "What is the employee's role?",
                    choices: roleList
                },
                {
                    type: 'number',
                    name: 'manager_id',
                    message: "What is the employee's manager's ID? (Leave blank if adding manager)"
                }
            ]).then(data => {
                let { role_id } = data;
                const sql = `SELECT id FROM roles WHERE title = ?`;
                const params = role_id;
                db.then(conn => conn.query(sql, params))
                    .then(([rows, fields]) => data.role_id = rows[0].id)
                    .then(() => {
                        const sql = `INSERT INTO employees (first_name, last_name, role_id, manager_id)
                                     VALUES (?, ?, ?, ?)`;
                        const params = Object.values(data);
                        db.then(conn => conn.query(sql, params))
                            .then(() => {
                                console.log(`Successfully added ${params[0]} ${params[1]}`);
                                closeApp();
                            });
                    })
            });
        });
}

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

function updateEmployeeRole() {
    let roleList = [];
    let employeeList = [];
    const sql = `SELECT * FROM roles`;
    const sql2 = `SELECT first_name, last_name FROM employees`;
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
                        const params = [data.role_id, data.employee_id];
                        db.then(conn => conn.query(sql, params))
                            .then(() => {
                                console.log(`Successfully updated ${employee_id}'s role to ${role_id}!`);
                                closeApp();
                            });
                    })
            });
        });
}

function updateEmployeeManager() {
    let employeeList = [];
    const sql = `SELECT first_name, last_name FROM employees`;
    db.then(conn => conn.query(sql))
        .then(([rows, fields]) => employeeList = rows.map(({ first_name, last_name }) => first_name + " " + last_name))
        .then(() => {
            inquirer.prompt([
                {
                    type: 'list',
                    name: 'employee_id',
                    message: "Which employee would you like to change their manager?",
                    choices: employeeList
                },
                {
                    type: 'number',
                    name: 'manager_id',
                    message: "What is the employee's new manager's ID (Can be blank)"
                }
            ]).then(data => {
                let { employee_id, manager_id } = data;
                data.employee_id = employeeList.indexOf(employee_id) + 1;
                const sql = `UPDATE employees SET manager_id = ? WHERE id = ?`;
                const params = [data.manager_id, data.employee_id];
                db.then(conn => conn.query(sql, params))
                    .then(() => {
                        console.log(`Successfully updated ${employee_id}'s manager ID to ${manager_id}!`);
                        closeApp();
                    });
            });
        });
}

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
                let { department_id } = departmentList.indexOf(department_id) + 1;
                const sql = `DELETE FROM departments WHERE id = ?`;
                const params = [data.department_id];
                db.then(conn => conn.query(sql, params))
                    .then(() => {
                        console.log(`Successfully deleted ${department_id}!`);
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
                let { role_id } = data;
                data.role_id = roleList.indexOf(role_id) + 1;
                const sql = `DELETE FROM roles WHERE id = ?`;
                const params = [data.role_id];
                db.then(conn => conn.query(sql, params))
                    .then(() => {
                        console.log(`Successfully deleted ${role_id}!`);
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
                let { employee_id } = data;
                const sql = `SELECT id FROM employees WHERE first_name = ? AND last_name = ?`;
                const params = employee_id.split(" ");
                db.then(conn => conn.query(sql, params))
                    .then(([rows, fields]) => data.employee_id = rows[0].id)
                    .then(() => {
                        const sql = `DELETE FROM employees WHERE id = ?`;
                        const params = data.employee_id;
                        db.then(conn => conn.query(sql, params))
                            .then(() => {
                                console.log(`Successfully deleted ${employee_id}!`);
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