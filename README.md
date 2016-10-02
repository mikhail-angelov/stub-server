# stub-server

[![Build Status](https://travis-ci.org/mikhail-angelov/stub-server.svg?branch=master)](https://travis-ci.org/mikhail-angelov/stub-server)

> This is stub server based on node.js. 
> It was inspired by [stubby4node](https://github.com/mrak/stubby4node) but it have minimum feature set, which are required to stub simple REST api for varios end 2 end test for UI applications

# Install

```
npm install stub-server --save-dev
```

# Basic Usage

This code will generate translation json files based on google spreadsheet:

```javascript
const stub= require('stub-server');
//to start
var options = {
	stubs:['<stub file 1>', '<stub file 2>']
};
stub.serve(options);

//to stop
stub.stop();
```

### Options

#### stubs **mandatory** 
Type: `Array of Strings`

List of json files with http schema, example:
```
{
  "request": {
    "url": "/api/test",
    "method": "POST"
  },
  "response": {
    "status": 200,
    "headers": {
      "Content-Type": "application/json"
    },
    "body": {
      "result": "ok"
    }
  }
}
```


#### port **optional**
Type: `Number`

default port is `8888`

