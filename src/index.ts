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
    const repository = connection.getRepository(User);
    const userInfo = {
        email: undefined,
        name: undefined,
        status: false,
        message: ""
    };

    app.post('/login', async (req, res) => {
        // 초기화
        userInfo.email = undefined;
        userInfo.name = undefined;
        userInfo.status = false;

        const inputEmail = req.body.email;
        const inputPassword = req.body.password;

        if (await repository.findOne({email: inputEmail})) {
            const userObj = await repository.findOne({email: inputEmail})
            if (userObj.password === inputPassword) {
                // 성공 했을 때만 이메일과 이름을 넣어 보낸다.
                userInfo.email = userObj.email
                userInfo.name = userObj.name;
                userInfo.status = true;
                userInfo.message = "Login success";
            } else {
                userInfo.message = "password miss match";
            }
        } else {
            userInfo.message = 'email miss match';
        }

        console.log(userInfo.message);
        res.json(userInfo);
    });

    app.post('/signup', async (req, res) => {
        // 초기화
        userInfo.email = undefined;
        userInfo.name = undefined;
        userInfo.status = false;

        const inputEmail = req.body.email;
        const inputPassword = req.body.password;가

        if (await repository.findOne({email: inputEmail})) {
            userInfo.message = "this email already exist"
        } else {
            // 이메일, 비밀번호, 기본이름 저장
            const user = new User();
            user.email = inputEmail;
            user.password = inputPassword;
            user.name = 'defaultName';
            await repository.save(user);
            const userObj = await repository.findOne({email: inputEmail})

            // 저장된 값으로 부르기
            userInfo.email = userObj.email;
            userInfo.name = userObj.name;
            userInfo.status = true;
            userInfo.message = "Sign up success"
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