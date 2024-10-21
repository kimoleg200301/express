create table objects (
	objects_id int auto_increment primary key,
	object_name varchar(255) not null,
	link_to_image varchar(255),
	rating DECIMAL(4, 2) CHECK (rating >= 1 AND rating <= 10) not null,
	description text not null
);

insert into objects (object_name, link_to_image, rating, description)
values ('Паста матовая "NISHMAN Matte Paste Hair Texturizing M3 Mess Up" для формирования беспорядочной фиксации 30мл', 'images/image1.png',
8.3, 'Укладка для волос предназначен для укладывания волос. Данный товар не оставит клиентов без внимания!');

insert into objects (object_name, link_to_image, rating, description)
values ('Участок 0.55 га, Коктал', 'images/image2.png', 9,
'Огорожен, ровный, все документы, удобно под коммерцию, госакт, выкуплен, удобный въезд. Отличное место для ведения бизнеса. Участок ровный, огорожен высоким забором с удобным въездом, первая линия. Установлено новое КТП с производственной мощностью 630 кВт. Частная собственность.')

