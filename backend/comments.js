const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const port = 3000;
const ip = '192.168.31.245';

app.use(cors());
app.use(express.json());

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
  const token = req.cookies.jwt_token || req.headers('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Токен не предоставлен!' });
  }

  jwt.verify(token, 'mother', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Токен не валидный!' });
    }
    req.user = decoded; 
    next();
  });

}

// con.connect((err) => {  
//   if (err) { //'Ошибка поключения к базе данных: ', err.stack
//     console.error(
//       app.get("/result_to_connect_db", function(request, response) {
//         const result = {
//           message: `Ошибка подключения к базе данных: ${err.stack}`,
//         }
//         response.json(result);
//       })
//     );
//     return; 
//   }
//   app.get("/result_to_connect_db", function(request, response) {
//     const result = {
//       message: 'Успешное подключение к базе данных!',
//     }
//     response.json(result);
//   })
// });

// app.get("/", function(request, response) {
//   const data = {
//     message: 'Hello World!',
//     status: 'success',
//   }
//   response.json(data);
// }); 

// app.get('/', authenticateToken, function(req, res) {

// });

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
          res.json({
            success: `Поздравляем! Вы успешно авторизованы!`,
            login: `Ваш логин: ${login}`,
            password: `Ваш пароль: ${password}`
          });
          // начало генерации токена

          const token = jwt.sign({name: data[0].name}, 'mother', { expiresIn: '1h' });
          
          if (req.headers['user-agent'].includes('Mozilla')) {
            res.cookie('jwt_token', token, { httpOnly: true, sameSite: 'Strict' });
          }
          else {
            res.json({token});
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
    
      // con.query(query_data, (error, result) => {
      //   if (error) throw error;
      //   if (result.length > 0) {
      //     con.query(query_password, async (error, result) => {
      //       if (error) throw error;
      //       if (result.length > 0) {
      //         const [data_user] = await con.execute('select * from users where name = ?', [login]);
    
      //         res.json({
      //           success: `Поздравляем! Вы успешно авторизованы!`,
      //           login: `Ваш логин: ${login}`,
      //           password: `Ваш пароль: ${password}`
      //         });
      //         // начало генерации токена
      //         const token = jwt.sign({name: data_user.name}, 'mother');
              
      //         if (req.headers['user-agent'].includes('Mozilla')) {
      //           res.cookie('jwt_token', token, { httpOnly: true, sameSite: 'Strict' });
      //         }
      //         else {
      //           res.json({token});
      //         }
      //       }
      //       else {
      //         res.json({
      //           error: `Неверный пароль!`
      //         });
      //       }
      //     });
      //   }
      //   else {
      //     res.json({
      //       error: `Введенное имя не найдено!`
      //     });
      //   }
      // });
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
        const [data] = await pool.query(`insert into users (name, password) values (?, ?)`, [login, password]);
        res.json({
          result: true,
          message: `Аккаунт создан. Авторизуйтесь под новым аккаунтом! ${data[0]}`,
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

