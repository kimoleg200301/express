create table objects (
	objects_id int auto_increment primary key,
	object_name varchar(255) not null,
	link_to_image varchar(255),
	rating DECIMAL(2, 2) CHECK (rating >= 1 AND rating <= 10) not null,
	description text not null,
	reviews_id int
);

insert into objects (object_name, link_to_image, rating, description, reviews_id)
values ('Паста матовая "NISHMAN Matte Paste Hair Texturizing M3 Mess Up" для формирования беспорядочной фиксации 30мл', 'images/image1.png',
8.3, 'Укладка для волос предназначен для укладывания волос. Данный товар не оставит клиентов без внимания!', 1);