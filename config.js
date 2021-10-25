var snowflake = require('snowflake-sdk');

var dbConn = snowflake.createConnection({
    account : 'uf36652.ap-south-1',
    username: 'db_user',
    password: 'F@ll2021'
});

dbConn.connect(
    function(err, conn) {
        if(err){
            console.error('unable to connect' + err.message);
        }
        else {
            console.log("snowflake connected successfully");
            connection_ID = conn.getId();
        }
    }

);
module.exports = dbConn;