# Docker
To use the SPAM docker development environment run `docker-compose up` from the projects root directory. It will start a `mysql` database, an `apache` instance serving the API (right from the projects `api` folder) and a `phpmyadmin` instance for you to view the local database. To get content into the database put the `*.sql` database dump into the `initdb.d` subfolder before starting the docker environment. On first initialization the environment will create the database from the dump.

To start fresh you can savely delete the `mysql` subfolder (if it exists). It will be recreated the next time you start the docker environment, but all prior data will be last.
