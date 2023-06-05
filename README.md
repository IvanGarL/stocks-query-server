# stocks-query-server
Stocks query backend server.  

Instructions to run the server

- Deploy on local machine.  

    1.1 Connect your local machine to a postgres db-server.  
    1.2 Create a new connection in localhost that follows the ```./ormconfig.ts``` configuration.  
    1.3 Create a new database with name ```db```.   
    1.4 Install the dependencies and devDependencies and start the server, run:    
        ```
        npm install 
        ```. 
        ```
        npm run start 
        ```. 

- Deploy with docker.  
    just run ```docker-compose up -d``` in terminal in the root directory

- Docs:  
    To visualize the swagger api documentation please open the project in VSCode and install the extension 'Swagger Viewer' then right-click on ```swagger-api-docs.yaml``` and click the option 'Preview Swagger'.  

    Also theres the option of exploring the services using the Postman collection available in the root directory. Import the file 'StocksQueryServer.postman_collection.json' to postman and create a new env variable called ```basicUrl``` with the value of 'http://localhost:8080'.
    


