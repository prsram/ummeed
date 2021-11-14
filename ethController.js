var express = require('express');
var app = express();
var router = express.Router();

var dbConn = require('./config');

const Web3 = require('web3');
web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
var myContract = new web3.eth.Contract([
  {
    "constant": false,
    "inputs": [
      {
        "name": "_borrower",
        "type": "address"
      },
      {
        "name": "_retaillender",
        "type": "address"
      },
      {
        "name": "_LoanAmount",
        "type": "uint256"
      },
      {
        "name": "_rate",
        "type": "uint256"
      },
      {
        "name": "_status",
        "type": "string"
      },
      {
        "name": "_nosofEMIs",
        "type": "uint256"
      },
      {
        "name": "_tenure",
        "type": "uint256"
      },
      {
        "name": "_EMIsleft",
        "type": "uint256"
      },
      {
        "name": "_EMIspaid",
        "type": "uint256"
      },
      {
        "name": "_LoanBalance",
        "type": "uint256"
      },
      {
        "name": "_LoanID",
        "type": "string"
      },
      {
        "name": "_EMIAmount",
        "type": "uint256"
      }
    ],
    "name": "setLoan",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "retaillenderAccounts",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_address",
        "type": "address"
      },
      {
        "name": "_type",
        "type": "bool"
      },
      {
        "name": "_fName",
        "type": "string"
      },
      {
        "name": "_lName",
        "type": "string"
      },
      {
        "name": "_adharNumber",
        "type": "string"
      },
      {
        "name": "_userID",
        "type": "string"
      }
    ],
    "name": "setBorrower",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "borrowerAccounts",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_address",
        "type": "address"
      },
      {
        "name": "_fName",
        "type": "string"
      },
      {
        "name": "_lName",
        "type": "string"
      },
      {
        "name": "_adharNumber",
        "type": "string"
      },
      {
        "name": "_userID",
        "type": "string"
      }
    ],
    "name": "setRetailLender",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_borrower",
        "type": "address"
      },
      {
        "name": "_retaillender",
        "type": "address"
      },
      {
        "name": "_loanbalance",
        "type": "uint256"
      }
    ],
    "name": "repayLoanoneEMI",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_address",
        "type": "address"
      }
    ],
    "name": "getRetailLender",
    "outputs": [
      {
        "name": "",
        "type": "string"
      },
      {
        "name": "",
        "type": "string"
      },
      {
        "name": "",
        "type": "string"
      },
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_borrower",
        "type": "address"
      },
      {
        "name": "_retaillender",
        "type": "address"
      }
    ],
    "name": "getLoan",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      },
      {
        "name": "",
        "type": "uint256"
      },
      {
        "name": "",
        "type": "string"
      },
      {
        "name": "",
        "type": "uint256"
      },
      {
        "name": "",
        "type": "uint256"
      },
      {
        "name": "",
        "type": "uint256"
      },
      {
        "name": "",
        "type": "uint256"
      },
      {
        "name": "",
        "type": "uint256"
      },
      {
        "name": "",
        "type": "string"
      },
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_address",
        "type": "address"
      }
    ],
    "name": "getBorrower",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      },
      {
        "name": "",
        "type": "string"
      },
      {
        "name": "",
        "type": "string"
      },
      {
        "name": "",
        "type": "string"
      },
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
], '0x2F91133Bb5f3404F265380E8657a32b788EdA3E8', {
    from: '0xa4F690396599c8Eb19c57EC97Cc39941f098a56a', // default from address
    gasPrice: '20000000000'

});

var eth = {
    borrowers: function(borr_addr) {
        var result = myContract.methods.getBorrower(borr_addr).call();
        return result;
    },      
    register_borrower: function(borr_type, first_name, last_name, adhar, uid ) {
      try {                            
        dbConn.execute({
          sqlText:  "select pub_add from ummeed.public.borrower where user_id = " + uid + ";",
          complete: function(err, stmt, rows) {            
                  if(err) {
                      console.error('Failed to update the public address: ' + err.message);
                  } else {
                      var borr_address = rows[0].PUB_ADD;
                      var result = myContract.methods.setBorrower(borr_address, borr_type, first_name, 
                        last_name, adhar, uid).send({ from: borr_address, gas: 3000000 });
                    
                        console.log(result);
                        return ({msg :"New Borrower has been added to Ethereum!"});                     

                  }
                  
              }
          });
        
      }catch(err){
        console.error("Error occurred while adding borrower to Ethereum");
      }
    },
    register_lender: function(first_name, last_name, adhar, uid ) {
      try {
        dbConn.execute({
          sqlText:  "select pub_add from ummeed.public.retail_lender where user_id = " + uid + ";",
          complete: function(err, stmt, rows) {            
                  if(err) {
                      console.error('Failed to update the public address: ' + err.message);
                  } else {
                      var lender_address = rows[0].PUB_ADD;
                      console.log(lender_address);
                      console.log(first_name);
                      console.log(last_name);
                      console.log(adhar);
                      console.log(uid);
                      var result = myContract.methods.setRetailLender(lender_address, first_name, 
                          last_name, adhar, uid).send({ from: lender_address, gas: 3000000 });
                    
                        console.log(result);
                        return ({msg :"New Lender has been added to Ethereum!"});                     

                  }
                  
              }
          });

      }catch(err){
        console.error("Error occurred while adding lender to Ethereum");
      }
    },

    register_loan: function(borr_addr, lend_addr, int_rate, loan_amt, status, no_of_emi, tenure, 
                            emi_left, emi_paid, loan_bal, loan_id, emi_amt) {

      var result = myContract.methods.setLoan(borr_addr, lend_addr, loan_amt, 
              int_rate, status, no_of_emi, tenure, emi_left, emi_paid, loan_bal,
            loan_id, emi_amt ).send({ from: borr_addr, gas: 3000000 });;
          
    },
    
    repay_loan: function(borr_addr, lend_addr, loan_amt) {

      var result = myContract.methods.repayLoanoneEMI(borr_addr, lend_addr, 
                  loan_amt ).send({ from: borr_addr, gas: 3000000 });;

}
  };
   /* });
    router.post('/lender',async (req,res)=>{   
      try {        
        var borr_address = req.body.p_address;
        var first_name = req.body.fName;
        var last_name  = req.body.lName;
        var adhar = req.body.Aadhar;
        var uid = req.body.UID;
      
        console.log("Before Calling Contracts");        
        var result = await myContract.methods.setRetailLender(borr_address, first_name, 
                    last_name, adhar, uid).send({ from: borr_address, gas: 3000000 });
                
        console.log(result);
        res.send({status :"New Lender has been added !"});
      }catch(err){
        return res.status(422).send(err.message);
      }

    });
    
    router.post('/loan',async (req,res)=>{       
      console.log("inside add loan");
      var borr_addr = '0x2e66F79ca1d054213Fc1E6612Bf9941A993771fe';
      var lend_addr = '0xbE6578BE8A610Af716b135ff3c6F4a984625C382';
      var loan_amt = req.body.loan_amount;
      var int_rate = 10;
      var status = 'Approved';
      var tenure = 1;
      var no_of_emi = tenure * 12;
      console.log(100 + int_rate);
      console.log(loan_amt);
      console.log(loan_amt + (loan_amt * 10/100));
      var total_amt = Math.floor((loan_amt * (100 + int_rate)) /100);
      var emi_amt = Math.floor(total_amt / no_of_emi);      
      var emi_paid = 0;
      var loan_bal = total_amt;
      var emi_left = no_of_emi - emi_paid;
      console.log(total_amt);
      console.log(emi_amt);
      console.log(emi_left);
      loan_id = "LO1234";

      var result = await myContract.methods.setLoan(borr_addr, lend_addr, loan_amt, 
                          int_rate, status, no_of_emi, tenure, emi_left, emi_paid, loan_bal,
                          loan_id, emi_amt ).send({ from: borr_addr, gas: 3000000 });;
      return res.send({result});

  });
    return router;
    
}; */
module.exports = eth;