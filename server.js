var express = require('express');
var app = express();
var dbCon = require('./config');
var bodyParser = require('body-parser');
var dateTime = require('node-datetime');
var dt = dateTime.create();
var cors = require('cors');

app.use(bodyParser.json());
app.use(cors());
//var ethController = require('./ethController')();
var borrowController = require('./borrowerController')();
var lenderController = require('./lenderController')();
var loanController = require('./loanController')();
var securityController = require('./securityController')();

//app.use("/api/eth", ethController);
app.use("/api/borrower", borrowController);
app.use("/api/lender", lenderController);
app.use("/api/loan", loanController);
app.use("/api/securities", securityController);


app.listen(3000, function(){
    console.log('Server running at port 3000: http://127.0.0.1:3000');
});