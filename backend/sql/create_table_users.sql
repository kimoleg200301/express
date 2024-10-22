use app;

create table users (
	id int auto_increment primary key,
	name varchar(255) not null unique,
	password varchar(255) not null,
	role varchar(255) not null
);

select * from users;

insert into users (name, password, role)
values ('kimoleg', 'kim20030101oleg', 'admin');


git config --system http.sslcainfo "C:\Git\mingw64\etc\ssl\certs\ca-bundle.crt"

