use app;

create table users (
	id int auto_increment primary key,
	name varchar(255) not null unique,
	password varchar(255) not null
);

select * from users;

insert into users (name, password)
values ('kimoleg', 'kim20030101oleg');

-- добавить
alter table users
add column role varchar(255) not null;

-- добавить

