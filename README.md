# FOREIGN CURRENCY EXCHANGE

Please read this document before using the API

## HOW TO RUN

```
docker-compose up -d

docker-compose exec web sequelize db:migrate

```

## API

### API endpoint 

> base_url : http://localhost:3000/api/v1

| Method | Endpoint | Purpose | Params | Params Data Type |
|--------|----------|---------|--------|------------------|
| POST   | {base_url}/forex/daily  | input daily exhange rate data | date | string (YYYY-MM-DD)|
|        |           |          | from       | string          |
|        |           |          | to         | string          |
|        |           |          | rate       | string          |
| POST   | {base_url}/forex  | get list all exhange rate and past 7-day average, based on date selected | date | string (YYYY-MM-DD|
| POST   | {base_url}/forex/trend  | see exhange rate trend based on id currency-pair | id | integer |
| POST   | {base_url}/forex/currency_pair  | add exchange rate (currency pair) to track | from | string |
|        |           |          | to         | string          |
| GET   | {base_url}/forex/currency_pair  | get all data exhange rate (currency pair)  |  |  |
| DELETE   | {base_url}/forex/currency_pair  | delete and exchange rate (currency pair) | id | integer |

> All Params are mandatory

### RESPONSE

Response format is shown below : 

|type | Description | Keys |
|-----|-------------|------|
|success |All went well, some data was returned|status, data|
|fail| There was a problem with the data submitted| status, data|
|error| An error occured in processing the request| status, message|

Example response :
```javascript
{
    "status": "success",
    "data": [
        {
            "id": 1,
            "currencyOrigin": "USD",
            "currencyDestination": "IDR"
        }
    ]
}
```


### Postman Collection 
There is a postman collection available 

> link : [postman collection](https://www.getpostman.com/collections/871d67c67ea161bd8c36)



### Usage and Output

1. input daily exchange rate data

use : `POST {base_url}/forex/daily` 

You have to send data to this endpoint as mentioned before 

example response success : 
```javascript
{
    "status": "success",
    "data": {
        "id": 1,
        "CurrencyPairId": 1,
        "date": "2018-10-10",
        "rate": "15850",
        "createdAt": "2018-10-14T05:01:05.000Z",
        "updatedAt": "2018-10-14T10:24:02.337Z"
    }
}
```

if you send invalid data or forgot to send some params, you will get fail response, for instance : 
```javascript
{
    "status": "fail",
    "data": {
        "reason": "Invalid data provided",
        "errors": [
            {
                "location": "body",
                "param": "from",
                "msg": "Field from is required and must be a string"
            },
            {
                "location": "body",
                "param": "rate",
                "msg": "Field rate is required and must be a string"
            }
        ]
    }
}
```

When an API call fails due to an error on the server, example error is shown below:
```javascript
{
    "status": "error",
    "message": {
        "name": "SequelizeConnectionRefusedError",
        "parent": {
            "errno": "ECONNREFUSED",
            "code": "ECONNREFUSED",
            "syscall": "connect",
            "address": "127.0.0.1",
            "port": 3306,
            "fatal": true
        },
        "original": {
            "errno": "ECONNREFUSED",
            "code": "ECONNREFUSED",
            "syscall": "connect",
            "address": "127.0.0.1",
            "port": 3306,
            "fatal": true
        }
    }
}
```
================================================================

2. Get list of exchange rates
use : `POST {base_url}/forex`

example response success : 
```javascript
{
    "status": "success",
    "data": [
        {
            "from": "USD",
            "to": "IDR",
            "rate": 15700,
            "sevenDayAverage": 13857.142857142857
        },
        {
            "from": "IDR",
            "to": "JPY",
            "rate": "insufficient data",
            "sevenDayAverage": "insufficient data"
        },
    ]
}
```

==================================================================

3. See exchange rate trend from the most recent 7 data points
use : `GET {base_url}/forex/currency_pair` , and you get the response including currency-pair id

```javascript
{
    "status": "success",
    "data": [
        {
            "id": 1,
            "currencyOrigin": "USD",
            "currencyDestination": "IDR"
        },
        {
            "id": 2,
            "currencyOrigin": "JPY",
            "currencyDestination": "IDR"
        },
        {
            "id": 3,
            "currencyOrigin": "IDR",
            "currencyDestination": "JPY"
        }
    ]
}
```
then, use the currency-pair id to get data from `POST {base_url}/forex/trend`

example response : 
```javascript
{
    "status": "success",
    "data": {
        "from": "USD",
        "to": "IDR",
        "average": 12685.714285714286,
        "variance": 2000,
        "trends": [
            {
                "date": "2018-10-10",
                "rate": 12850
            },
            {
                "date": "2018-10-09",
                "rate": 11850
            },
            {
                "date": "2018-10-08",
                "rate": 11800
            },
            {
                "date": "2018-10-07",
                "rate": 11700
            },
            {
                "date": "2018-10-06",
                "rate": 13700
            },
            {
                "date": "2018-10-05",
                "rate": 13500
            },
            {
                "date": "2018-10-04",
                "rate": 13400
            }
        ]
    }
}
```

================================================================

4. Add exchange rate (currency-pair)to the list 
use : `POST {base_url}/forex/currency_pair`

example response : 
```javascript
{
    "status": "success",
    "data": {
        "id": 8,
        "currencyOrigin": "AUD",
        "currencyDestination": "IDR",
        "updatedAt": "2018-10-14T10:55:44.562Z",
        "createdAt": "2018-10-14T10:55:44.562Z"
    }
}
```

> note : if you submit data that already exist in db, the response will be a fail response

================================================================

5. Remove exchange rate (currency-pair) 

use : `GET {base_url}/forex/currency_pair` , and you get the response including currency-pair id

the, use `DELETE {base_url}/forex/currency_pair`

example response : 
```javascript
{
    "status": "success",
    "data": {
        "deletedRow": 1,
        "id": 8
    }
}
```
