# ProductManager
Project for managing product details

# Contents
GET api for fetching product details from DB. There are options for filtering data and highlighting words

# Steps to run application
1) Download code repository from github to user machine using below command:
git clone https://github.com/anilmk2001/ProductManager.git

2) Go to project root directory 'ProductManager'

3) Run 'npm install' to install dependencies

4) Run 'npm test' to execute unit tests

5) Run 'npm start' to make server running on port 8000

6) Access application server at below url:
http://localhost:8000/getProductDetail?maxprice=15&size=medium&highlight=red,green

# Query params in url
Query parameters are optional. If not provided, it will not filter results/highlight provided word in description

# Response fields description:
content - contains the filtered product list

filter.price - contains min and max price among all products in filtered product list

filter.sizes - contains the sizes among all products in filtered product list

filter.frequentWords - contains most occurred words(other than top 5) from description field of all products in filtered product list