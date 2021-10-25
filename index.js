var dbConn = require('./config');
var utilities = {
	timestamp: function(a, b) {
		console.log('Current Time in Unix Timestamp: ' + Math.floor(Date.now() / 1000));
        console.log(a);
        console.log(b);
	},
	currentDate: function(a, b) {
		console.log('Current Date is: ' + new Date().toISOString().slice(0, 10));
        console.log(a);
        console.log(b);
	},
    publicAddress: function(){
        pub_address_query = "select top 1 PUB_ADD from ummeed.public.pub_address where user_id is null;"
        console.log("address query");
        console.log(pub_address_query);
        var stmt = dbConn.execute({
            sqlText:  pub_address_query /*,
            complete: function(err, stmt, rows) {    
                if(err) {
                    console.error('Failed to execute statement due to the following error: ' + err.message);
                } else {
                    console.log("Hello inside");                    
                    return rows[0].PUB_ADD;
                }
            }*/
        });
        rows = [];
        stmt.streamRows().on('data', function(row) {
            rows.push(row);
            console.log("single row " + row);
        })
        .on('end', function() {
        console.log('Number of rows consumed: ' + rows.length);
        });
        console.log("rows" + rows[0]);
        return rows[0];
    }
};
module.exports = utilities;