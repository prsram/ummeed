var express = require('express');
var app = express();
var router = express.Router();
var dbConn = require('./config');
var ethController = require('./ethController');
 

var lenders = function() {

router.route('/:id').get(function (req, res) {

    let lender_id = req.params.id;

    if(!lender_id) {
        return res.status(400).send({ status: false, message: 'Please provide lender id' });
    }
  
    query = "select * from ummeed.public.retail_lender where USER_ID = '" + lender_id + "'"    
    console.log("From Lender Controller");
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

router.route('/lender').post(function (req, res) {  

    var lender = {

        user_id: req.body.user_id,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        adhar_id: req.body.adhar_id,
        address: req.body.address,
        phone_number: req.body.phone_number,
        pin_code: req.body.pin_code,
        dob: req.body.dob
        }

    console.log(lender);

      if (!lender) {
          return res.status(400).send({ status:false, message: 'Please Provide Lender Data' });
      }

     
      lender_ins_query = "insert into ummeed.public.retail_lender " +
                        "(user_id, First_Name, Last_Name, adhar_id,address,phone_number, pincode,dob) " +
                        "Values ( '" + lender.user_id + "','" + lender.first_name + "','" + lender.last_name +
                        "','" + lender.adhar_id + "','" + lender.address + "','" + lender.phone_number +
                        "','" + lender.pin_code + "','" + lender.dob + "')"
    

      console.log(lender_ins_query);

      dbConn.execute({
        sqlText:  lender_ins_query,
        complete: function(err, stmt, rows) {
            if(err) {
                console.error('Failed to execute statement due to the following error: ' + err.message);
            } else {
                console.log(stmt.getSqlText());
                upd_pub_add_qry = "update ummeed.public.retail_lender set pub_add = " + 
                "(select top 1 PUB_ADD from ummeed.public.pub_address " + 
                "where user_id is null) where user_id = '" +  lender.user_id + "'";
                dbConn.execute({
                    sqlText:  upd_pub_add_qry,
                    complete: function(err, stmt, rows) {            
                            if(err) {
                                console.error('Failed to update the public address: ' + err.message);
                            } else {
                                
                                ethController.register_lender(lender.first_name, lender.last_name, lender.adhar_id, 
                                    lender.user_id );
                                dbConn.execute({
                                        sqlText:  "UPDATE ummeed.public.pub_address p " +
                                                  " SET p.user_id = rl.user_id FROM ummeed.public.retail_lender rl" +
                                                  " WHERE p.pub_add = rl.pub_add;",
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
                return res.send({ rows, message: 'New Lender has been created successfully.' });
            }

        }

    });

  });

    return router;

};

module.exports = lenders;


 