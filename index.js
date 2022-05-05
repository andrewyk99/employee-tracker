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
    console.table()
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

function updateMenu() {
    inquierer.prompt([
        {
            type: 'list',
            name: 'updateList',
            message: 'What would you like to update?',
            choices: [
                'Update a department',
                'Update a role',
                'Update an employee',
                'Go back'
            ]
        }
    ]).then(answers => {
        const { updateList } = answers;
        switch(updateList) {
            case 'Update a department':
                updateDepartment();
                break;
            case 'Update a role':
                updateRole();
                break;
            case 'Update an employee':
                updateEmployee();
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

mainPrompt();