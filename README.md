# express
Клиент-серверное приложение с использование Express.js и Angular&Flutter

# Инструментальные средства
- Node.js;
- git;
- XAMPP Control panel;
- DBeaver, либо другой любой СУБД для управления базой данных;
- Редактор кода (желательно Visual Studio Code. Данный редактор кода в реальном времени видит изменения git. Имеется удобное разрешение конфликтов)

# Инструкция к установке
__Node.js__:

__git__:

__XAMPP Control panel__:
Запуск клиентской части происходит через Apache. Для этого необходимо создать виртуальный хост:
1. В файле httpd.conf (обычно хранится в директории "C:\xampp\apache\conf\httpd.conf", либо через кнопку "Config - Apache (httpd.conf)") необходимо убрать символ "#" (комментарий) из строки "Include conf/extra/httpd-vhosts.conf".
2. Открыть файл httpd-vhosts.conf (обычно хранится в директории "C:\xampp\apache\conf\extra\httpd-vhosts.conf") и добавить конфигурацию нового виртуального хоста:
```conf
<VirtualHost *:80>
    DocumentRoot "C:/путь/к/директории/фронтенда"
    ServerName frontend.local

    <Directory "C:/путь/к/директории/фронтенда">
        Options Indexes FollowSymLinks Includes ExecCGI
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```
где DocumentRoot - это путь к директории, где находятся скомпилированные файлы фронтенда (например, build или dist), а ServerName - домен нашего нового виртуального хоста.
Обратите внимание на знак "/". Необходимо вводить знак такого характера: "/", а не "\"!
3. Нужно открыть файл "C:\Windows\System32\drivers\etc\hosts", и в нем добавить в конец такую строку
```
127.0.0.1  frontend.local
```
Теперь, когда перейдем по этому домену в браузере http://frontend.local, Apache будет обслуживать файлы из указанной директории.

__DBeaver__:

