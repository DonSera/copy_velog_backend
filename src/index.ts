import "reflect-metadata";
import {createConnection, getConnection} from "typeorm";
import {User} from "./entity/User";

createConnection().then(async connection => {
    let user = new User();
    user.email = "TestEmail@gmail.com";
    user.password = "password";
    // user.name = "testName"

    return connection.manager
        .save(user)
        .then(user => {
            console.log(user.email + " : " + user.id)
        });
}).catch(error => {
    console.log(error)
});