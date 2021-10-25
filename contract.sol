pragma solidity ^0.4.18;

 

contract ummeedapp {

   

    struct Loan {

        uint LoanAmount;

        uint Rate;

        string Status;

        uint NumberofEMIs;

        uint Tenure;

        uint EMIsleft;

        uint EMIspaid;

        uint LoanBalance;

        string LoanID;

        uint EMIAmount;

    }

   

    struct Borrower {

        bool Typeofborrower;

        string fName;

        string lName;

        string ADHAR;

        string UserID;

    }

   

    struct Retaillender {

        string fName;

        string lName;

        string ADHAR;

        string UserID;

    }

   

    

    mapping (bytes32 => Loan) loans;

    mapping (address => Borrower) borrowers;

    mapping (address => Retaillender) retaillenders;

   

    address[] public borrowerAccounts;

    address[] public retaillenderAccounts;

   

    function setBorrower(address _address, bool _type, string _fName, string _lName, string _adharNumber, string _userID) public {

        var borrower = borrowers[_address];

      

        borrower.Typeofborrower = _type;

        borrower.fName = _fName;

        borrower.lName = _lName;

        borrower.ADHAR = _adharNumber;

        borrower.UserID = _userID;

      

        borrowerAccounts.push(_address) -1;

    }

   

    

    function getBorrower(address _address) view public returns (bool,string, string, string, string) {

        return (borrowers[_address].Typeofborrower, borrowers[_address].fName, borrowers[_address].lName, borrowers[_address].ADHAR, borrowers[_address].UserID);

    }

   

    

    function setRetailLender(address _address, string _fName, string _lName, string _adharNumber, string _userID) public {

        var retaillender = retaillenders[_address];

      

        retaillender.fName = _fName;

        retaillender.lName = _lName;

        retaillender.ADHAR = _adharNumber;

        retaillender.UserID = _userID;

      

        retaillenderAccounts.push(_address) -1;

    }

   

    function getRetailLender(address _address) view public returns (string, string, string, string) {

        return (retaillenders[_address].fName, retaillenders[_address].lName, retaillenders[_address].ADHAR, retaillenders[_address].UserID);

    }

   

    function setLoan(address _borrower, address _retaillender, uint _LoanAmount, uint _rate, string _status, uint _nosofEMIs, uint _tenure, uint _EMIsleft, uint _EMIspaid, uint _LoanBalance, string _LoanID, uint _EMIAmount) public {

       

        var comb=sha256(_borrower,_retaillender);

       

        var loan = loans[comb];

      

        loan.LoanAmount = _LoanAmount;

        loan.Rate = _rate;

        loan.LoanAmount = _LoanAmount;

        loan.Status = _status;

        loan.NumberofEMIs = _nosofEMIs;

        loan.Tenure = _tenure;

        loan.EMIsleft = _EMIsleft;

        loan.EMIspaid = _EMIspaid;

        loan.LoanBalance = _LoanBalance;

        loan.LoanID = _LoanID;

        loan.EMIAmount = _EMIAmount;

       

    }

   

    function getLoan(address _borrower, address _retaillender) view public returns (uint, uint, string, uint, uint, uint, uint, uint, string, uint) {

       

        var comb=sha256(_borrower,_retaillender);

       

        return (loans[comb].LoanAmount, loans[comb].Rate, loans[comb].Status, loans[comb].NumberofEMIs, loans[comb].Tenure, loans[comb].EMIsleft, loans[comb].EMIspaid, loans[comb].LoanBalance, loans[comb].LoanID, loans[comb].EMIAmount);

       

    }

   

    function repayLoanoneEMI(address _borrower, address _retaillender, uint _loanbalance) public {

       

        var comb=sha256(_borrower,_retaillender);

       

        var loan = loans[comb];

       

        loan.EMIsleft = loan.EMIsleft-1;

        loan.EMIspaid = loan.EMIspaid+1;

        loan.LoanBalance = _loanbalance;

        

    }

      

} 