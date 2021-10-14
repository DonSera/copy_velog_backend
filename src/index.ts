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
        id: undefined,
        status: false,
        message: ""
    };

    function initially() {
        userInfo.email = undefined;
        userInfo.name = undefined;
        userInfo.id = undefined;
        userInfo.status = false;
    }

    function setInfo(object) {
        for (const key in object) {
            userInfo[key] = object[key];
        }
    }

    app.post('/newName', async (req, res) => {
        const message = {status: false, message: "Can not find User"};

        const inputId = req.body.id;
        const inputEmail = req.body.email;
        const inputPW = req.body.password;
        const inputNewName = req.body.name;

        if (await repository.findOne({email: inputEmail, password: inputPW})) {
            // 입력 이메일과 비밀번호가 존재함
            if (await repository.findOne({id: inputId})) {
                const userObj = await repository.findOne({id: inputId});
                userObj.name = inputNewName;
                await repository.save(userObj);
                message.status = true;
                message.message = "Name change success";
            }
        } else {
            message.message = "password miss match"
        }
        console.log(message.message);
        res.json(message);
    });

    app.post('/id', async (req, res) => {
        initially();

        const inputId = req.body.id;

        if (await repository.findOne({id: inputId})) {
            const userObj = await repository.findOne({id: inputId});
            setInfo({
                email: userObj.email,
                name: userObj.name,
                id: userObj.id,
                status: true,
                message: "Auto login success"
            });
        } else {
            setInfo({message: "Id miss match"});
        }
        console.log(userInfo.message);
        res.json(userInfo);
    });

    app.post('/login', async (req, res) => {
        initially();

        const inputEmail = req.body.email;
        const inputPassword = req.body.password;

        if (await repository.findOne({email: inputEmail})) {
            const userObj = await repository.findOne({email: inputEmail})
            if (userObj.password === inputPassword) {
                // 성공 했을 때만 이메일과 이름을 넣어 보낸다.
                setInfo({
                    email: userObj.email,
                    name: userObj.name,
                    id: userObj.id,
                    status: true,
                    message: "Login success"
                });
            } else {
                setInfo({message: "password miss match"});
            }
        } else {
            setInfo({message: "email miss match"});
        }
        console.log(userInfo.message);
        res.json(userInfo);
    });

    app.post('/signup', async (req, res) => {
        initially();

        const inputEmail = req.body.email;
        const inputPassword = req.body.password;

        if (await repository.findOne({email: inputEmail})) {
            setInfo({message: "this email already exist"});
        } else {
            // 이메일, 비밀번호, 기본이름 저장
            const user = new User();
            user.email = inputEmail;
            user.password = inputPassword;
            user.name = 'defaultName';
            await repository.save(user);
            const userObj = await repository.findOne({email: inputEmail});

            // 저장된 값으로 부르기
            setInfo({
                email: userObj.email,
                name: userObj.name,
                id: userObj.id,
                status: true,
                message: "Sign up success"
            });
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