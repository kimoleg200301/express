import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

void main() {
  runApp(
      MaterialApp(
        debugShowCheckedModeBanner: false,
        title: 'App for check',
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
          useMaterial3: true,
        ),
        home: DataDisplay(),
      )
  );
}

class DataDisplay extends StatefulWidget {
  @override
  _DataDisplayState createState() => _DataDisplayState();
}

class _DataDisplayState extends State<DataDisplay> {
  String dataDB = '';
  String data = '';  // Переменная для хранения данных
  bool isLoading = true;  // Показывает, загружаются ли данные

  @override
  void initState() {
    super.initState();
    fetchDataDB();
    fetchData();  // Запуск функции при инициализации виджета
  }
  Future<void> fetchDataDB() async {
    final response = await http.get(Uri.parse('http://192.168.31.245:3000/result_to_connect_db'));
    if (response.statusCode == 200) {
      setState(() {
        dataDB = jsonDecode(response.body)['message'];
        isLoading = false;
      });
    } else {
      throw Exception('Ошибка при обработке статуса подключения к БД!');
    }
  }

  // Функция для выполнения HTTP-запроса
  Future<void> fetchData() async {
    final response = await http.get(Uri.parse('http://192.168.31.245:3000/'));
    if (response.statusCode == 200) {
      try {
        setState(() {
          data = jsonDecode(response.body)['message'];  // Предположим, что на сервере Express.js возвращается JSON с ключом 'message'
          isLoading = false;  // Отключаем загрузку
        });
      }
      // Если ответ успешен, обновляем состояние
      catch (e) {
        setState(() {
          data = 'Произошла ошибка при декодировании сообщения!';
        });
      }
    } else {
      throw Exception('Failed to load data');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Express.js Data'),
        backgroundColor: Colors.amber,
      ),
      body: isLoading
          ? Center(child: CircularProgressIndicator())  // Показываем индикатор загрузки
          : SingleChildScrollView(
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                dataDB,
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              SizedBox(height: 20),
              Text(
                data,  // Отображаем данные
                style: TextStyle(fontSize: 26),
              ),
              SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}
