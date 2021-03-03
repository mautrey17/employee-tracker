drop database if exists employee_trackerdb;
create database employee_trackerdb;

use employee_trackerdb;

create table employee(
	id int auto_increment not null,
    first_name varchar(30),
    last_name varchar(30),
    role_id int,
    manager_id int,
    primary key (id)
);

create table role(
	id int auto_increment,
    title varchar(30),
    salary decimal(9,2),
    department_id int,
    primary key (id)
);

create table department(
	id int auto_increment,
    name varchar(30),
    primary key (id)
);