
INSERT INTO departments (name)
VALUES
    ('Legal'),
    ('Sales'),
    ('Finance'),
    ('Engineering');

INSERT INTO roles (title, salary, department_id)
VALUES
    ('Attorney', 95000.00, 1),
    ('Lawyer', 120000.00, 1),
    ('Sales Rep', 60000.00, 2),
    ('Finance Advisor', 80000.00, 3),
    ('Accounting Manager', 100000.00, 3),
    ('Electrical Engineer', 90000.00, 4),
    ('Mech Engineer', 75000.00, 4);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES
    ('John', 'Doe', 4, NULL),
    ('Mark', 'Swanson', 3, 1),
    ('Joe', 'Chan', 2, 1),
    ('Ashley', 'Rodriguez', 3, 1),
    ('Sarah', 'Lourd', 2, NULL),
    ('Tom', 'Allen', 2, 5),
    ('Malia', 'Brown', 4, 5),
    ('Kunal', 'Singh', 3, 5);