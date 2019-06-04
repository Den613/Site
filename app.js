const express = require("express"); // подключаем express
const bodyParser = require("body-parser");// подключаем парсер
const {Pool, Client} = require('pg');//подключаем database postgressql
const connectionString = 'postgressql://postgres:root@localhost:5432/node_hero' // указываем путь к database
// создаем парсер для данных
const urlencodedParser = bodyParser.urlencoded({extended: false});
const app = express();

var client = new Client({
  connectionString:connectionString
})

client.connect()

app.get("/register", urlencodedParser, function (request, response) {
  response.sendFile(__dirname + "/register.html"); //добавляем страницу для входа
});

function databaseReadUser(users,resS){
  client.query('SELECT * from users',(err, res) => { //читаем базу

    console.table(res.rows);

    var lang = res.rows.length
    var count = 0;
    for(var i = 0; i < lang; i++){
      if(res.rows[i]['email'] == users.body.email && res.rows[i]['pass'] == users.body.pass) //находим есть ли такой пользователь в базе
        return resS.sendFile(__dirname + "/main.html");
      else
        count ++;
      if(count == lang)
        return resS.status(400).send('<h1>Пользователь не найден!!!</h1><a href="/register">Назад</a>');
      }
      client.end()
})
}

function databaseWriteUser(users, resS){
  client.query('INSERT INTO users(email, pass) VALUES($1, $2)',[users.body.email, users.body.pass1],(err, res) => {//записываем пользователей в базу
    return resS.sendFile(__dirname + "/main.html"); //выходим на главную страницу
  })
}

app.use('/public', express.static('public')); //указываем путь для стат файлов

app.get("/main", urlencodedParser, function (request, response) {
  response.sendFile(__dirname + "/main.html"); // добавляем главную страницу
});

app.get("/PIRAT", urlencodedParser, function (request, response) {
  response.sendFile(__dirname + "/PIRAT.html"); // добавляем страницу первой статьи
});

app.get("/Radio80", urlencodedParser, function (request, response) {
  response.sendFile(__dirname + "/Radio80.html"); // добавляем страницу второй статьи
});

app.get("/test1", urlencodedParser, function (request, response) {
  response.sendFile(__dirname + "/test1.html"); // добавляем страницу для регистрации
});


app.post("/register", urlencodedParser, function (request, response) { //проверяем страницу входа
    // проверяем заполнил ли пользователь форму
    if (request.body.email =='' || request.body.pass =='' && request.body.test != 'ok') return response.status(400).send('<h1>Форма не заполнена</h1> <a href="/register">Назад</a>');
    databaseReadUser(request,response); //сверяем пользователя с базой
});


app.post("/test1", urlencodedParser, function (request, response) { //регистрация пользователя
    if (request.body.email =='' || request.body.pass1 =='' || request.body.pass2 =='' && request.body.test != 'ok') return response.status(400).send('<h1>Форма не заполнена</h1> <a href="/register">Назад</a>');
    if (request.body.pass1 != request.body.pass2) return response.status(400).send('<h1>Неправильный пороль</h1> <a href="/register">Назад</a>'); //проверяем один и тот же пароль ввел пользователь
    databaseWriteUser(request,response);//записываем пользователя в базу
});


app.listen(3000); //подключаем сервер на 3000 порт
