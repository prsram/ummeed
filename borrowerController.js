var express = require('express');
var app = express();
var router = express.Router();
var dbConn = require('./config');
var util = require('./index');
var ethController = require('./ethController');

 var borrowers = function() {

router.route('/:id').get(function (req, res) {

    let borrower_id = req.params.id;

    if(!borrower_id) {
        return res.status(400).send({ status: false, message: 'Please provide borrower id' });
    }
  
    query = "select * from ummeed.public.borrower where USER_ID = '" + borrower_id + "'"    
    console.log("From Borrower Controller");
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

router.route('/borrower').post(function (req, res) {  

    var borrower = {

        type_of_borrower: req.body.borrower_type,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        govt_id: req.body.govt_id,
        address: req.body.address,
        phone_number: req.body.phone_number,
        pin_code: req.body.pin_code,
        user_id: req.body.user_id,
        date_of_birth: req.body.date_of_birth,
        gender: req.body.gender,
        shg_affliation: req.body.shg_affliation,
        affiliated_shg_name: req.body.affiliated_shg_name
        }
    
    console.log(borrower);
    console.log(1);
    if (!borrower) {
          return res.status(400).send({ status:false, message: 'Please Provide Borrower Data' });
    }

    borrower_ins_query = "insert into ummeed.public.borrower " +
                        "(TYPE_OF_BORROWER, First_Name, Last_Name, govt_id,address,phone_number, pin_code, " +
                        "user_id, date_of_birth, gender, shg_affiliation, affiliated_shg_name) " +
                        "Values ( '" + borrower.type_of_borrower + "','" + borrower.first_name + "','" + borrower.last_name +
                        "','" + borrower.govt_id + "','" + borrower.address + "','" + borrower.phone_number +
                        "','" + borrower.pin_code + "','" + borrower.user_id + "','" + borrower.date_of_birth +
                        "','" + borrower.gender + "','" + borrower.shg_affliation + "','" + borrower.affiliated_shg_name +"')"
    
      console.log("borrower:"+borrower_ins_query);
      dbConn.execute({
        sqlText:  borrower_ins_query,
        complete: function(err, stmt, rows) {
            if(err) {
                console.error('Failed to execute statement due to the following error: ' + err.message);
            } else {
                console.log(stmt.getSqlText());
                upd_pub_add_qry = "update ummeed.public.borrower set pub_add = " + 
                "(select top 1 PUB_ADD from ummeed.public.pub_address " + 
                "where user_id is null) where user_id = '" +  borrower.user_id + "'";
                dbConn.execute({
                    sqlText:  upd_pub_add_qry,
                    complete: function(err, stmt, rows) {            
                            if(err) {
                                console.error('Failed to update the public address: ' + err.message);
                            } else {
                                
                                ethController.register_borrower(borrower.type_of_borrower, 
                                        borrower.first_name, borrower.last_name, borrower.govt_id, 
                                        borrower.user_id )
                                dbConn.execute({

                                    sqlText:  "UPDATE ummeed.public.pub_address p " +
                                                    " SET p.user_id = b.user_id FROM ummeed.public.borrower b" +
                                                    " WHERE p.pub_add = b.pub_add;",
                                    complete: function(err, stmt, rows) {
                            
                                        if(err) {
                                            console.error('Failed to execute statement due to the following error: ' + err.message);
                                        } else {
                                            console.log(stmt.getSqlText());
                                            console.log("assingned public address has been updated");
                                        }
                                    }
                                });
                                console.log(" Public address updated successfully !");

                            }
                            
                        }
                    });
                return res.send({ rows, message: 'New borrower has been created successfully.' });
                }
            }
            
            });
    });
    return router;
}
module.exports = borrowers;
