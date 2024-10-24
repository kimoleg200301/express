const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3000;
const ip = '192.168.31.245';

app.use(cors({
  origin: 'http://localhost', // клиентский домен
  credentials: true, // позволяет передавать cookies
}));
app.use(express.json());
app.use(cookieParser());

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'app',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0
});

function authenticateToken(req, res, next) {
  const token = req.cookies.jwt_token || req.headers['Authorization'];
  /*Логи*/
  console.log(token);
  /*--------*/
  if (!token) {
    return res.json({ message: 'Токен не предоставлен!', href_welcome: '../welcome.html' });
  }

  jwt.verify(token, 'qwerty', (err, decoded) => {
    if (err) {
      return res.json({ message: 'Токен не валидный, либо срок его действия истек!', href_welcome: '../welcome.html' });
    }
    req.user = decoded;
    next();
  });
}

app.post('/', authenticateToken, async function(req, res) { // index.html
  const [data] = await pool.query(`select * from objects`);
  const { name, role } = req.user;
  return res.json({
    data: data,
    name: name,
    role: role
  });
});

app.post('/add_object', authenticateToken, async function(req, res) {
  const { role } = req.user;
  if (role === 'admin') {
    return res.json({
      // придумать, как реализовать добавление объекта только админом. Есть идея сделать проверку на открытие страницы  
    });
  }
});

app.get('/content', authenticateToken, async function(req, res) { // content.html index.html
  const id_content = req.query.id;

  const flag_content = req.query.flag;
  if (!flag_content) {
    
    console.log(`id: ${id_content}`);
    //const [data] = await pool.query(`SELECT object_name, link_to_image, rating, description, users_id, grade, review FROM objects o INNER JOIN reviews r ON o.objects_id = r.objects_id`);
    const [data_object] = await pool.query(`SELECT * FROM objects WHERE objects_id = ?`, [id_content]); // objects
    if (Object.keys(data_object).length === 0) {
      return res.json({
        length_is_null: 'Объект не найден!'
      });
    }
    const [data_reviews] = await pool.query(`SELECT reviews_id, name, grade, review, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at FROM reviews r INNER JOIN users u on u.id = r.users_id WHERE r.objects_id = ? ORDER BY reviews_id DESC`, [data_object[0].objects_id]); // reviews
    // const [data_users] подумать, как отправлять отызывы клиентов
    console.log(`data_object: ${data_object[0]}`); // object log 
    console.log(`data_reviews: ${data_reviews[0]}`); // review log
    return res.json({
      object: data_object,
      reviews: data_reviews
    });
  }
  else {
    return res.json({
      href: `content.html?id=${id_content}`
    });
  }
});

app.post('/send_review', authenticateToken, async function (req, res) {
  console.log('Обработка /send_review...');
  const { data_grade, data_review, data_id_content } = req.body;
  const { id } = req.user;
  console.log(`data_grade, data_review: ${data_grade}; ${data_review}`);
  console.log('id: ' + id);
  try {
    if ((data_grade >= 1 && data_grade <= 10) && data_review.trim() !== '') { // если всё корректно
      await pool.query(`INSERT INTO reviews (objects_id, users_id, grade, review) VALUES (?, ?, ?, ?)`, [data_id_content, id, data_grade, data_review]);
      res.json({
        success: 'Отзыв опубликован!'
      });
    }
    else if ((data_grade >= 1 && data_grade <= 10) && data_review.trim() === '') { // если отзыв пустой
      res.json({
        error_null_review: 'Введите отзыв!'
      });
    }
    else if ((data_grade >= 1 && data_grade <= 10) == false && data_review.trim() !== '') { // если введенная оценка не соответствует указанному диапазону 
      res.json({
        error_grade: 'Диапазон оценки должно варьироваться от 1 до 10!'
      });
    }
    else {
      res.json({
        error_: 'Ошибка в одной из проверок!'
      });
    }
  } catch(error) {
    console.log('Ошибка в маршруте /send_review' + error);
    throw error;
  }
});

async function getUser() {
  try {
    app.post('/auth', async (req, res) => {
      const { login, password } = req.body;
      //const query_password = `select password from users where password = '${password}'`;
    
      // con.query(query_login, (error, result) => {
      //   if (error) return res.status(500).json({ error: 'Произошла ошибка.' });
      //   if (result.length > 0) {
      //     console.log(`Login: ${result}`);
      //   }
      // })

      const [data] = await pool.query(`select * from users where name = ?`, [login]);

      if (data.length > 0) {
        if (data[0].password === password) {
          const token = jwt.sign({id: data[0].id, name: data[0].name, role: data[0].role}, 'qwerty', { expiresIn: '1h' });
          console.log(`Token: ${token}`);

          if (req.headers['user-agent'] && req.headers['user-agent'].includes('Mozilla')) {
            res.cookie('jwt_token', token, { httpOnly: true, sameSite: 'Strict', path: '/' });
            return res.json({
              success: `Поздравляем! Вы успешно авторизованы!`,
              login: `Ваш логин: ${login}`,
              password: `Ваш пароль: ${password}`
            });
          }
          else {
            return res.json({token});
          }
        }
        else {
          res.json({
            error: `Неверный пароль!`
          });
        }
      }
      else {
        res.json({
          error: `Имя не найдено!`
        });
      }
    });
  } catch (error) {
    console.error('Ошибка при подключении к базе данных!', error);
    throw error;
  }
}

async function addUser() {
  try {
    app.post('/create_account', async (req, res) => {
      const { login, password, password_ } = req.body;
      const [data_check] = await pool.query(`select name from users where name = ?`, [login])

      if (password === password_ || data_check[0] !== login) {
        await pool.query(`insert into users (name, password, role) values (?, ?, ?)`, [login, password, 'client']);
        res.json({
          result: true,
          message: `Аккаунт создан. Авторизуйтесь под новым аккаунтом!`,
        });
      }
      else {
        res.json({
          message: 'Пароли не совпали, либо имя пользователя уже имеется',
        })
      }
    }); 
  } catch (error) {
    console.error('Ошибка при подключении к базе данных!', error);
    throw error;
  }
}

getUser();
addUser();

app.listen(port);

