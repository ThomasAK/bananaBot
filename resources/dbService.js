const mysql = require("mysql2");
const date = new Date()
const today = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate()
const data = require("../data.json")

class dbService {

    async dbConnect(){
        const connection = mysql.createConnection({
            host: data.host,
            user: data.dbUser,
            password: data.dbPassword,
            database: data.database
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


    async getUser(userID) {
        const query = "SELECT * FROM users WHERE userID = '" + userID + "'";
        const user = await this.runQuery(query)
        return user[0];
    }


    async addUser(userID) {
        const query = "INSERT INTO users (userID, lastActivity, first, second, third, forth, fifth, sixth, week1, week2, week3, week4, week5, week6)"
            + " VALUES ('" + userID + "','" + today + "', '1' , '0', '0', '0', '0', '0','" + today + "','" + today + "','" + today + "','" + today + "','" + today + "','" + today + "')"
        await this.runQuery(query)
    }

    async updateUser(user) {
        const query = "UPDATE users SET "
            +"first = '" + user.first + "', second = '" + user.second + "', third = '" + user.third + "', forth = '" + user.forth + "', fifth = '" + user.fifth + "', sixth = '" + user.sixth
            +"', week1 = '" + user.week1 + "', week2 = '" + user.week2 + "', week3 = '" + user.week3 + "', week4 = '" + user.week4 + "', week5 = '" + user.week5 + "', week6 = '" + user.week6
            + "', lastActivity = '" + user.lastActivity + "' WHERE userID = '" + user.userID + "'"
        await this.runQuery(query)
    }

    async deleteUser(userID) {
        const query = "DELETE FROM users WHERE userID = '" + userID + "'"
        await this.runQuery(query)
    }


}

module.exports = dbService