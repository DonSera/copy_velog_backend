import "reflect-metadata";
import {createConnection} from "typeorm";
import {User} from "./entity/User";

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
}

app.use(bodyParser.urlencoded({extended: false}));
app.use(cors(corsOptions));
app.use(bodyParser.json());

createConnection().then(async connection => {
    let userEmail = '';
    let userId = 0;

    app.get('/button', (req, res) => {
        userId = req.query.id;
        User.findOne({id: userId})
            .then(userObj => {
                userEmail = userObj.email
                res.json({email: userEmail, message: "Get email success"})
            })
            .catch(err => {
                console.log('Can not find email by id')
                console.log(err)
                res.json({email: undefined, message: "Can not find email by id"})
            });
    });

    app.get('/', async function (req, res) {
        res.send("get '/' server");
    })

    app.listen(port, () => {
        console.log('####Express listening on port####', port);
    });

}).catch(error => {
    console.log(error)
});