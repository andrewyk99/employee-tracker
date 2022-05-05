INSERT INTO departments (name)
VALUES
    ('Legal'),
    ('Sales'),
    ('Finance'),
    ('Engineering');

INSERT INTO roles (title, salary, department_id)
VALUES
    ('Title1', 0.00, 1),
    ('Title2', 1.99, 3),
    ('Title3', 2.99, 3),
    ('Title4', 3.99, 4);

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