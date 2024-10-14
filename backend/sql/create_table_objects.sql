create table objects (
	object_id int auto_increment primary key,
	object_name varchar(255) not null,
	link_to_image varchar(255),
	rating DECIMAL(10, 2) CHECK (rating >= 1 AND rating <= 10) not null,
	description text not null,
	reviews int
);