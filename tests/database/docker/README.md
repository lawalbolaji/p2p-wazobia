```
docker run -d --name testdb --env-file .env.local.test -p 6603:3306 -v $(pwd)/.mysql/store/etc/mysql:/etc/mysql -v $(pwd)/.mysql/store/docker-entrypoint-initdb.d:/docker-entrypoint-initdb.d mysql/mysql-server:latest
```
