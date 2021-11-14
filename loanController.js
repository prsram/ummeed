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
                " inner join ummeed.public.borrower borr on app.borrower_id = borr.user_id"+
                " where app.application_status = 'Pending' and app.lender_id = " + lender_id
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
router.route('/activeloans/:id').get(function (req,res){

    let borrower_id = req.params.id;
    query = "select rl.first_name  || ' ' || rl.last_name as \"Lender_Name\", fl.* " +
            " from ummeed.public.facility fl inner join ummeed.public.retail_lender rl " +
            " on fl.lender_id = rl.user_id where fl.borrower_id =" + borrower_id ;
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

router.route('/repayemi/:id').get(function (req,res){

    let loan_id = req.params.id;
    
    
    query = "select rl.pub_add as \"lender_address\" , br.pub_add as \"borr_address\",fl.* " +
    " from ummeed.public.facility fl " +
    " inner join ummeed.public.retail_lender rl on fl.lender_id = rl.user_id " +
    " inner join ummeed.public.borrower br on fl.borrower_id = br.user_id " +
    " where fl.loan_id = " + loan_id
    
    dbConn.execute({
        sqlText:  query,
        complete: function(err, stmt, rows) {

            if(err) {
                console.error('Failed to execute statement due to the following error: ' + err.message);
            } else {
                var borr_address    = rows[0].borr_address;
                var lender_address  = rows[0].lender_address;              
                var loan_amount     = rows[0].LOAN_AMOUNT;
                var emi        = rows[0].EMI_AMOUNT;

                loan_bal = loan_amount - emi;

                ethController.repay_loan(borr_address, lender_address,loan_bal);

                return res.send({ msg: "Loan balance updated in ethereum" });
            }
        }
    });
});
router.route('/process').post(function (req,res){
    
    console.log(req.body);
    var app_id = req.body.app_id;
    var status = req.body.status;
    var lender_type = req.body.lender_type;

    console.log(lender_type);
    var app_retrieve_query ="";
    if (status == "Approved"){
        
        if (lender_type == "MF Credit Provider") {
            console.log('Inside MF Credit Provider');
            app_retrieve_query = "select app.borrower_id, mfi.user_id, app.amount, app.interest_rate" +
                            " from ummeed.public.application app inner join "+
                            " ummeed.public.borrower br on app.borrower_id = br.user_id " +
                            " inner join ummeed.public.mfi mfi on app.lender_id = mfi.user_id "+ 
                            " where app.app_id = " + app_id; 

        } else if (lender_type == "Retail Lender") {
            console.log('Inside Retail Lender');
            app_retrieve_query = "select app.borrower_id, br.pub_add as Borr_add, rl.user_id, rl.pub_add as lend_add," +
                            " app.amount, app.interest_rate from ummeed.public.application app inner join "+
                            " ummeed.public.borrower br on app.borrower_id = br.user_id " +
                            " inner join ummeed.public.retail_lender rl on app.lender_id = rl.user_id "+ 
                            " where app.app_id = " + app_id; 
        }
        
        console.log(app_retrieve_query);
        dbConn.execute({
            sqlText:  app_retrieve_query,
            complete: function(err, stmt, rows) {
                if(err) {
                    console.error('Failed to execute statement due to the following error: ' + err.message);
                } else {                    
                    var borr_address    = rows[0].BORR_ADD;
                    var borr_id         = rows[0].BORROWER_ID;
                    var lender_address  = rows[0].LEND_ADD;
                    var lender_id       = rows[0].USER_ID;
                    var loan_amount     = rows[0].AMOUNT;
                    var interest        = rows[0].INTEREST_RATE;
                    var tenure          = 5 
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
                    loan_id =  "LX-" + Math.floor(Math.random() * 1000);
                                        
                    if (lender_type == "Retail Lender") {
                        ethController.register_loan(borr_address, lender_address, interest, loan_amount,
                                                    status, no_of_emi, tenure, emi_left,  emi_paid,
                                                    loan_bal, loan_id, emi_amt );
                    }

                    
                    facility_ins_query =  "insert into ummeed.public.facility (LENDER_ID," + 	
                                    "BORROWER_ID, LOAN_AMOUNT, INTEREST_RATE, LOAN_STATUS, " +
                                    "NUMBER_OF_EMI, EMI_TO_BE_PAID, EMI_PAID, LOAN_BALANCE, "+
                                    "LOAN_ID, EMI_AMOUNT ) "+
                                    " values ( " + lender_id + "," + borr_id + ",'" + loan_amount +
                                    "','" + interest + "', 'Approved', '" + no_of_emi + 
                                    "','" + emi_amt + "','" + emi_paid + "','" + loan_bal + 
                                    "','" + loan_id + "','" + emi_amt + "')"
                    console.log(facility_ins_query);
                    dbConn.execute({
                        sqlText:  facility_ins_query,
                        complete: function(err, stmt, rows) {
                            if(err) {
                                console.error('Failed to execute statement due to the following error: ' + err.message);
                            } else {
                                dbConn.execute({
                                    sqlText:  "update ummeed.public.application set application_status = '" + status + "' Where app_id = " + app_id,
                                    complete: function(err, stmt, rows) {
                                        if(err) {
                                            console.error('Failed to update application table due to the following error: ' + err.message);
                                        } else {
                                            console.log(stmt.getSqlText());
                                            return res.send({ rows, message: 'Loan registration has been created successfully.' });           
                                        }
                                    }
                                });
                                console.log(stmt.getSqlText());                                
                            }
                        }
                    });
            
                    
                                        
                }
            }
        });
    }else if (status == "Rejected") {
        dbConn.execute({
            sqlText:  "update ummeed.public.application set application_status = '" + status + "' Where app_id = " + app_id,
            complete: function(err, stmt, rows) {
                if(err) {
                    console.error('Failed to update application table due to the following error: ' + err.message);
                } else {
                    console.log(stmt.getSqlText());
                    return res.send({ rows });                
                }
            }
        });
    }
});
return router;
};
module.exports = loans;