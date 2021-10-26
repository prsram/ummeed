var express = require('express');
var app = express();
var router = express.Router();
var dbConn = require('./config');
var ethController = require('./ethController');

var loans = function() {

    router.route('/applications/:id').get(function(req,res) {

        let lender_id = req.params.id;
        query = "select borr.first_name || ' ' || borr.last_name as Borrower_Name, " +
                " borr.type_of_borrower, borr.govt_id, borr.address, borr.phone_number, " +
                " borr.pin_code, borr.Date_of_Birth, borr.Gender, borr.shg_affiliation, "+
                " borr.affiliated_shg_name, app.* from ummeed.public.application app " +
                " inner join ummeed.public.borrower borr on app.borrower_id = borr.borrower_id "+
                " where app.lender_id = " + lender_id
        dbConn.execute({
            sqlText:  query,
            complete: function(err, stmt, rows) {
    
                if(err) {
                    console.error('Failed to execute statement due to the following error: ' + err.message);
                } else {
                    console.log(stmt.getSqlText());
                    return res.send({ rows });
                }
            }
        });

    
    });
router.route('/offerings/:type').get(function(req,res) {

        
        let type = req.params.type;
        query = "select * from ummeed.public.offering where offering_type = '"+ type + "';";
        dbConn.execute({
            sqlText:  query,
            complete: function(err, stmt, rows) {
    
                if(err) {
                    console.error('Failed to execute statement due to the following error: ' + err.message);
                } else {
                    console.log(stmt.getSqlText());
                    return res.send({ rows });
                }
            }
        });

    
    });
    
router.route('/apply').post(function (req,res){

     var borr_user_id = req.body.borrower_id;
     var lender_user_id = req.body.lender_id;
     var loan_amount = req.body.cap_amount;
     var interest = req.body.int_rate;
     var purpose = req.body.purpose;
     var apply_date = new Date().toISOString().slice(0, 10);
     var apply_status = 'Pending';

     loan_app_ins_query = "Insert into ummeed.public.application (BORROWER_ID, LENDER_ID, AMOUNT," +
                           "INTEREST_RATE, PURPOSE, APPLICATION_DATE, APPLICATION_STATUS) " +
                           "values ('" + borr_user_id + "','" + lender_user_id + "','" + loan_amount +
                           "','" + interest + "','" + purpose + "','" + apply_date + "','" + apply_status + "')";
            dbConn.execute({
            sqlText:  loan_app_ins_query,
            complete: function(err, stmt, rows) {
                if(err) {
                    console.error('Failed to execute statement due to the following error: ' + err.message);
                } else {
                    console.log(stmt.getSqlText());
                    return res.send({ rows });
                }
            }
        });

    });

router.route('/process').post(function (req,res){
    
    var app_id = req.body.app_id;
    var status = req.body.status;

    if (status == "Approved"){
        app_retrieve_query = "select app.borrower_id, br.pub_add as Borr_add, rl.user_id, rl.pub_add as lend_add," +
                            " app.amount, app.interest_rate from ummeed.public.application app inner join "+
                            " ummeed.public.borrower br on app.borrower_id = br.user_id " +
                            " inner join ummeed.public.retail_lender rl on app.lender_id = rl.user_id "+ 
                            " where app.app_id = " + app_id; 
        console.log(app_retrieve_query);
        dbConn.execute({
            sqlText:  app_retrieve_query,
            complete: function(err, stmt, rows) {
                if(err) {
                    console.error('Failed to execute statement due to the following error: ' + err.message);
                } else {
                    console.log(rows[0]);
                    var borr_address    = rows[0].BORR_ADD;
                    var borr_id         = rows[0].BORROWER_ID;
                    var lender_address  = rows[0].LEND_ADD;
                    var lender_id       = rows[0].USER_ID;
                    var loan_amount     = rows[0].AMOUNT;
                    var interest        = rows[0].INTEREST_RATE;
                    var tenure          = 1 
                    var no_of_emi       = tenure * 12;
                    var total_amt = Math.floor((loan_amount * (100 + interest)) /100);
                    var emi_amt = Math.floor(total_amt / no_of_emi);      
                    var emi_paid = 0;
                    var loan_bal = total_amt;
                    var emi_left = no_of_emi - emi_paid;
                    console.log(total_amt);
                    console.log(emi_amt);
                    console.log(emi_left);
                    console.log(borr_address);
                    console.log(lender_address);
                    loan_id = borr_id + "0" + lender_id;

                    ethController.register_loan(borr_address, lender_address, interest, loan_amount,
                                                    status, no_of_emi, tenure, emi_left,  emi_paid,
                                                    loan_bal, loan_id, emi_amt );

                    console.log(" Public address updated successfully !");    
                    facility_ins_query =  "insert into ummeed.public.facility LENDER_ID," + 	
                                    "BORROWER_ID, LOAN_AMOUNT, INTEREST_RATE, LOAN_STATUS, " +
                                    "NUMBER_OF_EMI, EMI_TO_BE_PAID, EMI_PAID, LOAN_BALANCE, "+
                                    "MATURITY_DATE, LOAN_ID, EMI_AMOUNT ) "+
                                    " values (   )"
                    return res.send({ rows, message: 'Loan registration has been created successfully.' });
                                        
                }
            }
        });
    }
});
return router;
};
module.exports = loans;