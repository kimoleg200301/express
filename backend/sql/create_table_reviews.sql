create table reviews (
	reviews_id int auto_increment primary key,
	objects_id int not null,
	users_id int not null,
	grade int not null,
	review text
);

insert into reviews (users_id, objects_id, grade, review)
values (1, 1, 9, 'Невероятная вещь! Советую всех для покупки и пользования! Единственный минус - быстро пропадает эффект действия данного геля');

insert into reviews (users_id, objects_id, grade, review)
values (1, 1, 9, 'Всем советую!');
