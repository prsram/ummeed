var express = require('express');
var app = express();
var router = express.Router();
var dbConn = require('./config');

var securities = function() {

    router.route('/approvedloans/').get(function(req,res) {

        
        query = "SELECT MFI.NAME AS MFI_NAME, MFI.ADDRESS AS MFI_ADDRESS, BRR.FIRST_NAME || ' ' || BRR.LAST_NAME " +
                " AS BORROWER_NAME, BRR.ADDRESS AS BORROWER_ADDRESS, FL.LOAN_AMOUNT, FL.INTEREST_RATE," + 
                " FL.NUMBER_OF_EMI - FL.EMI_PAID AS BALANCE_EMI, FL.LOAN_ID FROM UMMEED.PUBLIC.FACILITY FL" +
                " INNER JOIN UMMEED.PUBLIC.MFI MFI  ON FL.LENDER_ID = MFI.USER_ID " +
                " INNER JOIN UMMEED.PUBLIC.BORROWER BRR ON FL.BORROWER_ID = FL.BORROWER_ID " +
                " WHERE FL.LOAN_STATUS = 'Approved'; "
        dbConn.execute({
            sqlText:  query,
            complete: function(err, stmt, rows) {
    
                if(err) {
                    console.error('Failed to execute statement due to the following error: ' + err.message);
                } else {
                    console.log(stmt.getSqlText());
                    console.log(rows);
                    return res.send({ rows });
                }
            }
        });

    
    });

    router.route('/security').post(function(req,res){

        var owner_id = req.body.mfi_lender;
        var block_amount = req.body.block_amount;
        var loan_amount = req.body.loan_amount;
        var loan_id = req.body.loan_id;
        console.log(block_amount);
        console.log(block_or_amt);
        
        no_of_blocks = loan_amount / block_amount;
            
        console.log(req.body);
        console.log(no_of_blocks);
        for (var i = 0; i < no_of_blocks; i++) {
                var security_id = loan_id + '-' + String(i+1);
                security_ins_query = "Insert into ummeed.public.security (LOAN_ID, SECURITY_ID, OWNER_ID, " +
                            " AMOUNT)" +
                            "values ('" + loan_id + "','" + security_id + "','" + owner_id +
                            "','" + block_amount  + "')";
                console.log(security_ins_query);
                dbConn.execute({
                sqlText:  security_ins_query,
                complete: function(err, stmt, rows) {
                    if(err) {
                        console.error('Failed to execute statement due to the following error: ' + err.message);
                    } else {
                        console.log(stmt.getSqlText());
                        console.log('Loan Securities have been added successfully!' );           
                    }
                }
            });
        }
        console.log("Securitization has been completed successfully!");
        return res.send({ msg : "Securitization has been completed successfully!" });
       
    });

    router.route('/currentSecurities/').get(function(req,res) {
        
        query = "SELECT FL.LOAN_ID, FL.LOAN_AMOUNT, MFI.NAME AS MFI_LENDER, MFI.ADDRESS AS MFI_LOCATION, " +
        "BRR.FIRST_NAME || ' ' || BRR.LAST_NAME AS BORROWER_NAME, BRR.ADDRESS AS BORROWER_ADDRESS, "+
        "FL.INTEREST_RATE,FL.NUMBER_OF_EMI, MAX(AMOUNT) AS SECURITY_AMOUNT, COUNT(SECURITY_ID) AS AVL_SEC_COUNT " +
        "FROM UMMEED.PUBLIC.FACILITY FL INNER JOIN UMMEED.PUBLIC.SECURITY SEC ON FL.LOAN_ID = SEC.LOAN_ID " +
        "INNER JOIN UMMEED.PUBLIC.BORROWER BRR ON FL.BORROWER_ID = BRR.USER_ID " +
        "INNER JOIN UMMEED.PUBLIC.MFI MFI ON FL.LENDER_ID = MFI.USER_ID " +
        "WHERE SEC.RETAIL_LENDER_ID IS NULL " +
        "GROUP BY FL.LOAN_ID, FL.LOAN_AMOUNT, FL.INTEREST_RATE, FL.NUMBER_OF_EMI, " +
        "MFI.NAME, MFI.ADDRESS, BRR.FIRST_NAME || ' ' || BRR.LAST_NAME, BRR.ADDRESS "
                
        dbConn.execute({
            sqlText:  query,
            complete: function(err, stmt, rows) {
    
                if(err) {
                    console.error('Failed to execute statement due to the following error: ' + err.message);
                } else {
                    console.log(stmt.getSqlText());
                    console.log(rows);
                    return res.send({ rows });
                }
            }
        });

    
    });

    router.route('/buy').post(function(req,res){

        var loan_id = req.body.loan_id;
        var sec_count = req.body.sec_count;
        var lender_id = req.body.lender_id;
        
        while (sec_count > 0){

            update_query = " UPDATE UMMEED.PUBLIC.SECURITY SET RETAIL_LENDER_ID = " + lender_id
                        + " WHERE SECURITY_ID IN (SELECT TOP 1 SECURITY_ID  FROM UMMEED.PUBLIC.SECURITY "
                        +  " WHERE LOAN_ID = '"+ loan_id +"' AND RETAIL_LENDER_ID IS NULL); "
                        
                        console.log(update_query);
                        dbConn.execute({
                            sqlText:  update_query,
                            complete: function(err, stmt, rows) {
                                if(err) {
                                    
                                    console.error('Failed to execute statement due to the following error: ' + err.message);
                                } else {
                                    console.log(stmt.getSqlText());
                                    console.log('Loan Securities have been purchased successfully!' );           
                                }
                            }
                        });
            sec_count = sec_count - 1;

        }
        return res.send({ msg : "Securities purchase has been completed successfully!" });
    });

    return router;
};
module.exports = securities;