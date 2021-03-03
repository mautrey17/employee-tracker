use employee_trackerdb;
insert into employee (first_name, last_name, role_id, manager_id) values ("John", "Smith", 2, 3);
insert into employee (first_name, last_name, role_id, manager_id) values ("Sally", "Joe", 1, 3);
insert into employee (first_name, last_name, role_id, manager_id) values ("Hikaru", "Nakamura", 4, 2);
insert into employee (first_name, last_name, role_id, manager_id) values ("Beth", "Harmon", 2, 2);




insert into role (title, salary, department_id) values ("Sales person", 50000, 1);
insert into role (title, salary, department_id) values ("CEO", 100000, 4);
insert into role (title, salary, department_id) values ("Marketing Professional", 50000, 2);
insert into role (title, salary, department_id) values ("Network Engineer", 80000, 3);

insert into department (dept_name) values ("Sales");
insert into department (dept_name) values ("Marketing");
insert into department (dept_name) values ("IT");
insert into department (dept_name) values ("Admin");