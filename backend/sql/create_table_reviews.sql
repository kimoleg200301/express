create table reviews (
	reviews_id int auto_increment primary key,
	users_id int not null,
	grade int not null,
	review text
);

insert into reviews (users_id, grade, review)
values (1, 9, 'Невероятная вещь! Советую всех для покупки и пользования! Единственный минус - быстро пропадает эффект действия данного геля');
