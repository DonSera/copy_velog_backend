import "reflect-metadata";
import {createConnection} from "typeorm";
import {User} from "./entity/User";
import * as console from "console";

const express = require('express');
const app = express();
const port = process.env.PORT || 3001;

createConnection().then(async connection => {
    connection.manager.find(User).then(user =>{
        console.log(user);
        }
    )

    // router.post("/", (req, res) => {
    //     const {id} = req.body;
    //     if (id.valid()) {
    //         res.json({message: "OK"})
    //     } else {
    //         res.json({message: "Not OK ..."})
    //     }
    // })

    app.get('/', async function (req, res) {
        res.send('hello~');
    })

    app.listen(port, () => {
        console.log('####Express listening on port####', port);
    });

}).catch(error => {
    console.log(error)
});