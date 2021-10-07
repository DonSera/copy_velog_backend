import "reflect-metadata";
import {createConnection} from "typeorm";
import {User} from "./entity/User";
import * as console from "console";

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3001;

const corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
};

app.use(bodyParser.urlencoded({extended: false}));
app.use(cors(corsOptions));
app.use(bodyParser.json());

createConnection().then(async connection => {
    app.post('/login', async (req, res) => {
        const userInfo = {
            email: undefined,
            name: undefined,
            status: false,
            message: ""
        };

        const inputEmail = req.body.email;
        const inputPassword = req.body.password;

        try {
            const userObj = await User.findOne({email: inputEmail})
            if (userObj.password === inputPassword) {
                // 성공 했을 때만 이메일과 이름을 넣어 보낸다.
                userInfo.email = userObj.email
                userInfo.name = userObj.name;
                userInfo.status = true;
                userInfo.message = "Login success";
            } else {
                userInfo.message = "password miss match";
            }
        } catch (err) {
            userInfo.message = 'email miss match';
            console.log(err);
        }
        console.log(userInfo.message);
        res.json(userInfo);
    });

    app.get('/', async function (req, res) {
        res.send("get '/' server");
    });

    app.listen(port, () => {
        console.log('####Express listening on port####', port);
    });

}).catch(error => {
    console.log(error);
});