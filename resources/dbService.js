const mysql = require("mysql2");
const data = require("../data.json")

class dbService {

    async dbConnect(){
        const connection = mysql.createConnection({
            host: data.host,
            user: data.dbUser,
            password: data.dbPassword,
            database: 'discordbot'
        });
        connection.connect(function (err) {
            if (err) throw err;
        });

        return connection
    }

    async runQuery(query) {
        const connection = await this.dbConnect()
        const results = await connection.promise().query(query);
        return results[0]
    }

    async addUserActivity(userID){
        const date = new Date()
        const today = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate()
        const query = `INSERT INTO user_activity VALUES (${userID}, '${today}')`
        await this.runQuery(query)
    }

    async getActivityCount(userID, date){
        const query = `SELECT count(*) AS activityCount FROM user_activity WHERE user_id = ${userID} AND activity_date >= '${date}'`
        const count = await this.runQuery(query)
        return count[0].activityCount
    }



}


module.exports = dbService