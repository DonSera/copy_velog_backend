import "reflect-metadata";
import {createConnection} from "typeorm";
import {User} from "./entity/User";
import {Post} from "./entity/Post";
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
    const userRepo = connection.getRepository(User);

    function initiallyUserInfo() {
        return {
            email: undefined,
            name: undefined,
            id: undefined,
            status: false,
            message: "Undefined user"
        };
    }

    function setInfo(originObj, newObj) {
        for (const key in newObj) {
            originObj[key] = newObj[key];
        }
    }


    app.post('/newName', async (req, res) => {
        const message = {
            status: false,
            message: ""
        };

        const inputId = req.body.id;
        const inputEmail = req.body.email;
        const inputPW = req.body.password;
        const inputNewName = req.body.name;

        if (await userRepo.findOne({email: inputEmail, password: inputPW})) {
            // 입력 이메일과 비밀번호가 존재함
            const userObjEmailPW = await userRepo.findOne({email: inputEmail, password: inputPW});
            if (userObjEmailPW.id === inputId && await userRepo.findOne({id: inputId})) {
                const userObjId = await userRepo.findOne({id: inputId});
                userObjId.name = inputNewName;
                await userRepo.save(userObjId);
                message.status = true;
                message.message = "Name change success";
            } else {
                message.message = "Can not find User"
            }
        } else {
            message.message = "password miss match"
        }
        console.log(message.message);
        res.json(message);
    });

    app.post('/id', async (req, res) => {
        const userInfo = initiallyUserInfo();

        const inputId = req.body.id;

        if (await userRepo.findOne({id: inputId})) {
            const userObj = await userRepo.findOne({id: inputId});
            setInfo(userInfo, {
                email: userObj.email,
                name: userObj.name,
                id: userObj.id,
                status: true,
                message: "Auto login success"
            });
        } else {
            setInfo(userInfo, {message: "Id miss match"});
        }
        console.log(userInfo.message);
        res.json(userInfo);
    });

    app.post('/login', async (req, res) => {
        const userInfo = initiallyUserInfo();

        const inputEmail = req.body.email;
        const inputPassword = req.body.password;

        if (await userRepo.findOne({email: inputEmail})) {
            const userObj = await userRepo.findOne({email: inputEmail})
            if (userObj.password === inputPassword) {
                // 성공 했을 때만 이메일과 이름을 넣어 보낸다.
                setInfo(userInfo, {
                    email: userObj.email,
                    name: userObj.name,
                    id: userObj.id,
                    status: true,
                    message: "Login success"
                });
            } else {
                setInfo(userInfo, {message: "password miss match"});
            }
        } else {
            setInfo(userInfo, {message: "email miss match"});
        }
        console.log(userInfo.message);
        res.json(userInfo);
    });

    app.post('/signup', async (req, res) => {
        const userInfo = initiallyUserInfo();

        const inputEmail = req.body.email;
        const inputPassword = req.body.password;

        if (await userRepo.findOne({email: inputEmail})) {
            setInfo(userInfo, {message: "this email already exist"});
        } else {
            // 이메일, 비밀번호, 기본이름 저장
            const user = new User();
            user.email = inputEmail;
            user.password = inputPassword;
            user.name = inputEmail.split('@')[0];
            await userRepo.save(user);
            const userObj = await userRepo.findOne({email: inputEmail});

            // 저장된 값으로 부르기
            setInfo(userInfo, {
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

    const postRepo = connection.getRepository(Post);

    app.post('/getPost', async (req, res) => {
            let postInfo;
            let message;
            if (req.body.id === '') {
                postInfo = await postRepo.find({order: {date: "DESC"}});
                let boardInfo = [];
                for (let index = 0; index < postInfo.length; index++) {
                    const post = postInfo[index];
                    const writerInfo = await userRepo.findOne({id: post.writerId});
                    boardInfo.push({
                        id: post.id,
                        title: post.title,
                        subTitle: post.subTitle,
                        img: "",
                        date: post.date,
                        writerInfo: {
                            id: writerInfo.id,
                            name: writerInfo.name,
                            thumbNail: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAAXNSR0IArs4c6QAAB0RJREFUeAHtnX1T6koMxhcEBRRBBL3X7/+5zh935pzRA0dQFFB8OXmY6XVFRQotSZpkpkMV7CZPft3uLm0s/fjv12twM6tA2WzkHvhCAQfAOAgOgANgXAHj4XsP4AAYV8B4+N4DOADGFTAevvcADoBxBYyH7z2AA2BcAePhew/gABhXwHj43gM4AMYVMB6+9wAOgHEFjIfvPYADYFwB4+F7D+AAGFfAePjeAxgHoGIp/mq1Eg7rtYDXyt7eYtvbK4fn55fw9Py82Obzp3A/nQW8WrDCA1Aul0PzsB6OGvWwv1/9NKeVCsFAW2InrWZ4fJyHu8k0jO+n4eXlJXmrcK+FBqB52Agn7WbYIwjSGmDp0NY6PgrD0ZhAmKQ9hIrPFxIAdPG9k1Y4ONjfOgmAp9tpLXqR/vCmcJeG9KfG1pLme4AaJf3i7DST5MeeAiYcF8cvkhUKgEbtIJz3OgHX/TwMx8Xx0U5RLB+lGNRp1A/CWfcklEulXFvH8dEO2iuCFQIATOm6nXYo5Zz8JOFoB+2hXe1WCAB6p+2NRvrbJA+DQ7Sr3dQD0KZpGtfADO2ifc2mGgAMylpN3gSg/bwGnbsASzUAreYhiZ/voO+7JKB9+KHV1AKA0fjxUUOE7vAj79lHXoGqBaAJ0XOa76cVG37AH42mFoAGfasnyaT5s642KgHAPPzgi2/21g0868/Bn12tQ2Tpu0oA6jT9kiY2/IFf2kwlADWha/FS/VoFpUoApC7BSvWrcADgNi6JJtWvVVrJVHKVx/SeVKGl+rVKTp0ACJn/Lwu7ya1ny8fY9c8qAdi1SEVuTyUAz0Lv0pXq1yqAdQJA9/FLNDxfoM0cgAwz5gBkKOaqQ+EpHokm1a9VWqnsAWazh1Uxsb0n1a9VgqgEYPrwGF5fZf2rI/gDv7SZSgAg9gM9uyfJ4I80KNfRRyUACGxCT/BKMmn+rKuNWgDGdxMxT+3i6WH4o9HUAvBCl4FbIaLDD/ij0dQCALFvxvfUC/AKj/bhh1ZTDQC63pvxHav2aF9zAQnVACDzo9u7MGOafqFdtK/Z1AMA8ft/RmHXX8SgPbSr3VQCgGfyUMcnMSzBDq5HO5uHY74/oOTHS7/S7lJOtPnuVVWJGNx736bHsJLSL0hAMv2aTB/C78Ew9HKuEYDRfp/amUTL0ahFhDIyD3RJGNIlYRq9910CuN8vafj38ftU8+eUav4sPwWMwdevq0GYP719OYTPnAOCHO4aQntXlPx4zFGl6mIX5713zyhiVXBA9YRQaUy6iQYA99p3qKvHY1dfPQcwf3paQBBPB7MsEpUkEGf3cpEoPBh6cdZd1B1MPpe84jKB9YHhzXhnl6ak7TSvYgHAWY9SLNXK91cpnJGX/esPQm9TJi4REYO9z8rEEZvhn973RaMAKC5Nj0ILT4oEAEUd0eWnefQbZ+jl4PrDwtDiwU0UiqRtv/p5ocgk2fHr45wKRVKRyM8KRcKv827nwyUp/vt4H73TYDgK9xNZ31/AR3EAoOBCh4o7bmI4y34TBPGYID5OFqVicc1H8nGstIbLgbR1A1EAoNBCp32cVtd3n8fZdn1z+//s4N2bW/6AsUindZyqZ1pu8np0K2rpOD3GyxFl9PNC3C2TD1fQPXfp8oHLCM64eMS+qavJusPyLGST4wFwTCWT6esmx8jyb0QAgLq8pxkkPxYGyfqXKntiTo46v/i+nnRf2zDIa9RqixlIPeOHURErpogSbmphBwDTuzMqt/bVNG/tjH3xQSQPG+bwgAGiY8MiEn6HSwbKu2CwiIrhWNHDhr/JYy0BbiJWlJj7eTn4MHP5Iozcfs0OAJZ015nqbasAknlIlwVsEgwxY43jD40JOI31uwA8TCml0BNHEjDu4X6glBUAFFnMq+vnSGjaNhF7m7nOISsAGKlbNyxQcRobAKink9cgi1PQtG1Dg3qNr7YQGwBay6qlTfA6n6/TdJPL2ADYZCmVS6S82+W8mYQNAI0FlfICgbOyCBsA3NOfvJK5yXE5tWADwAeAb6hwasEGwFv4vsepgAPAqb6Ath0AAUngdMEB4FRfQNsOgIAkcLrgAHCqL6BtB0BAEjhdcAA41RfQtgMgIAmcLjgAnOoLaNsBEJAEThccAE71BbTtAAhIAqcLDgCn+gLadgAEJIHTBQeAU30BbTsAApLA6YIDwKm+gLbZAIhLrAnQgdUFTi3YAJjN9P1zhbwo4dSCDQBU8dD4T5ayhgAaQAsuYwMAgf+86i8KMXF2gVzCI2YUoYIGnCcCa30ABN6nEq9ufAqw9QB8IXvLsQIOQKyGwX0HwGDS45AdgFgNg/sOgMGkxyE7ALEaBvcdAINJj0N2AGI1DO47AAaTHofsAMRqGNx3AAwmPQ7ZAYjVMLjvABhMehyyAxCrYXDfATCY9DhkByBWw+C+A2Aw6XHIDkCshsF9B8Bg0uOQHYBYDYP7DoDBpMchOwCxGgb3HQCDSY9D/gtF0hE0Gvyl1gAAAABJRU5ErkJggg=="
                        },
                        heartNum: 0,
                        commentNum: 0
                    })
                }
                message = "get post success";
                res.json(
                    {
                        status: true,
                        message: message,
                        board: boardInfo
                    })
            } else {
                postInfo = await postRepo.findOne({id: req.body.id});
                const writerInfo = await userRepo.findOne({id: postInfo.writerId});
                message = "get postInfo success";
                res.json(
                    {
                        status: true,
                        message: message,
                        info: {
                            id: postInfo.id,
                            title: postInfo.title,
                            subTitle: postInfo.subTitle,
                            content: postInfo.content,
                            date: postInfo.date,
                            writerInfo: {
                                id: writerInfo.id,
                                name: writerInfo.name,
                                thumbNail: "data:image/png;base64,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"
                            },
                            heart: [],
                            comment: []
                        }
                    })
            }
            console.log(message);
        }
    )

    app.post('/makePost', async (req, res) => {
        let message = '';
        try {
            const title = req.body.title;
            const subTitle = req.body.subTitle;
            const content = req.body.content;
            const writerId = req.body.writerId;
            const date = req.body.date;

            const post = new Post();
            post.date = date;
            post.writerId = writerId;
            post.title = title;
            post.subTitle = subTitle;
            post.content = content;
            await postRepo.save(post);

            message = "post success"

            res.json({status: true, message: message});
        } catch (e) {
            console.log(e);
            message = "post failed";
            res.json({status: false, message: message});
        }

        console.log(message);
    })

    app.get('/myPage', async (req, res) => {
        const json = {info: [], status: false, message: 'Can not find'};
        const userName = req.query.name;
        try {
            if (await userRepo.findOne({name: userName})) {
                const userInfo = await userRepo.findOne({name: userName});
                const userId = userInfo.id;
                json.info = await postRepo.find({where: {writerId: userId}, order: {date: "DESC"}});
                json.status = true;
                json.message = "get my page post info success";
                res.json(json);
            }
        } catch (e) {
            console.log(e);
            res.json(json);
        }
        console.log(json.message);
    })


    app.get('/', async function (req, res) {
        res.send("get '/' server");
    });

    app.listen(port, () => {
        console.log('####Express listening on port####', port);
    });

}).catch(error => {
    console.log(error);
});