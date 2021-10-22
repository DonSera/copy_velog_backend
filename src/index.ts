import "reflect-metadata";
import {createConnection} from "typeorm";

import {User} from "./entity/User";
import {Post} from "./entity/Post";
import {Tag} from "./entity/Tag";
import {PostTag} from "./entity/PostTag";
import {BRIEF, DEFAULT, DETAIL, initially, RES, USER, WRITER} from "./lib/initial";
import {setInfo} from "./lib/setInfo";

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
    const postRepo = connection.getRepository(Post);
    const tagRepo = connection.getRepository(Tag);
    const postTagRepo = connection.getRepository(PostTag);

    app.post('/newName', async (req, res) => {
        // 이름 재 설정하기
        const resJson = initially(RES);

        const inputId = req.body.id;
        const inputEmail = req.body.email;
        const inputPW = req.body.password;
        const inputNewName = req.body.name;

        if (await userRepo.findOne({name: inputNewName})) {
            // 이미 다른 사용자가 이름을 사용하고 있는 경우
            resJson.message = "another user is already using it";
        } else {
            if (await userRepo.findOne({email: inputEmail, password: inputPW})) {
                // 입력 이메일과 비밀번호가 존재함 = 이름을 변경할 수 있음
                const userObjEmailPW = await userRepo.findOne({email: inputEmail, password: inputPW});
                if (userObjEmailPW.id === inputId && await userRepo.findOne({id: inputId})) {

                    const userObjId = await userRepo.findOne({id: inputId});
                    userObjId.name = inputNewName;
                    await userRepo.save(userObjId);

                    resJson.status = true;
                    resJson.message = "Name change success";
                } else {
                    resJson.message = "Can not find User"
                }
            } else {
                resJson.message = "password miss match"
            }
        }
        res.json(resJson);
        console.log(resJson.message);
    });

    app.post('/id', async (req, res) => {
        // 사용자 id로 사용자 정보를 넘긴다.
        const resJson = initially(RES);
        const userInfo = initially(USER);

        const inputId = req.body.id;

        if (await userRepo.findOne({id: inputId})) {
            const userObj = await userRepo.findOne({id: inputId});
            setInfo(userInfo, userObj);

            resJson.info = userInfo;
            resJson.status = true;
            resJson.message = "Auto login success";
        } else {
            setInfo(userInfo, {message: "Id miss match"});
        }
        res.json(userInfo);
        console.log(userInfo.message);
    });

    app.post('/login', async (req, res) => {
        // 이메일과 비밀번호로 로그인
        const resJson = initially(RES);
        const userInfo = initially(USER);

        const inputEmail = req.body.email;
        const inputPassword = req.body.password;

        if (await userRepo.findOne({email: inputEmail})) {
            const userObj = await userRepo.findOne({email: inputEmail})
            if (userObj.password === inputPassword) {
                // 성공 했을 때만 이메일과 이름을 넣어 보낸다.
                setInfo(userInfo, userObj);

                resJson.info = userInfo;
                resJson.status = true;
                resJson.message = "Login success";
            } else {
                resJson.message = "password miss match";
            }
        } else {
            resJson.message = "email miss match";
        }
        res.json(resJson);
        console.log(resJson.message);
    });

    app.post('/signup', async (req, res) => {
        // 이메일과 비밀번호로 회원가입 -> 로그인 완료
        const resJson = initially(RES);
        const userInfo = initially(USER);

        const inputEmail = req.body.email;
        const inputPassword = req.body.password;

        if (await userRepo.findOne({email: inputEmail})) {
            // 이미 해당 이메일이 존재하는 경우
            resJson.message = "this email already exist";
        } else {
            // 이메일, 비밀번호, 기본이름 저장
            const user = new User();
            user.email = inputEmail;
            user.password = inputPassword;
            user.name = inputEmail.split('@')[0];
            await userRepo.save(user);

            // 저장된 값 불러오기
            const userObj = await userRepo.findOne({email: inputEmail});
            setInfo(userInfo, userObj);

            resJson.info = userInfo;
            resJson.status = true;
            resJson.message = "sign up success";
        }
        res.json(resJson);
        console.log(resJson.message);
    });

    app.post('/getPost', async (req, res) => {
        // 게시물 정보를 반환
        const resJson = initially(RES);
        if (req.body.id === '') {
            // id가 넘어오지 않았으면 전체 게시물 정보를 넘긴다.
            let boards = [];
            const posts = await postRepo.find({order: {date: "DESC"}});
            for (let index = 0; index < posts.length; index++) {
                const postInfo = posts[index];
                const userInfo = await userRepo.findOne({id: postInfo.writerId});

                const postDefault = initially(DEFAULT);
                const boardInfo = initially(BRIEF);
                const writerInfo = initially(WRITER);

                // id, title, date, heartNum, writerInfo, tags
                setInfo(postDefault, postInfo);
                setInfo(writerInfo, userInfo);
                postDefault.heartNum = 0;
                postDefault.writerInfo = writerInfo;
                postDefault.tags = []


                // suTitle, commentNum, img
                setInfo(boardInfo, postInfo);
                boardInfo.commentNum = 0;
                boardInfo.subTitle = postInfo.subTitle === ''
                    ? postInfo.content.split('\n')[0]
                    : postInfo.subTitle;
                boardInfo.img = '';

                Object.assign(boardInfo, postDefault);

                boards.push(boardInfo);
            }
            resJson.info = boards;
            resJson.status = true;
            resJson.message = "get post success";
        } else {
            // postId 값에 맞는 세부 정보를 보내 준다.
            const postInfo = await postRepo.findOne({id: req.body.id});
            const userInfo = await userRepo.findOne({id: postInfo.writerId});

            const postTags = await postTagRepo.find({where: {postId: req.body.id}});
            const tagTexts = postTags.map(tag => tag.tagTag);

            const postDefault = initially(DEFAULT);
            const postDetail = initially(DETAIL);
            const writerInfo = initially(WRITER);

            // id, title, date, writerInfo, heartNum, tags
            setInfo(postDefault, postInfo);
            setInfo(writerInfo, userInfo);
            postDefault.heartNum = 0;
            postDefault.tags = tagTexts;
            postDefault.writerInfo = writerInfo;

            // subTitle, content, comment
            setInfo(postDetail, postInfo);
            postDetail.comment = []

            Object.assign(postDetail, postDefault);

            resJson.info = postDetail;
            resJson.status = true;
            resJson.message = "get postInfo success";
        }
        res.json(resJson);
        console.log(resJson.message);
    })


    app.post('/makePost', async (req, res) => {
        // 게시물 저장
        const resJson = initially(RES);

        try {
            const title = req.body.title;
            const subTitle = req.body.subTitle;
            const content = req.body.content;
            const writerId = req.body.writerId;
            const date = req.body.date;
            const tags = req.body.tags;

            const post = new Post();
            post.date = date;
            post.writerId = writerId;
            post.title = title;
            post.subTitle = subTitle;
            post.content = content;
            const getPost = await postRepo.save(post);

            // 저장한 게시물의 id 가져오기
            const postId = getPost.id;

            // 태그 저장 및 게시물과 연결
            for (let index = 0; index < tags.length; index++) {
                const tagText = tags[index];
                if (!await tagRepo.findOne({tag: tagText})) {
                    // 이미 저장된 태그가 아니라면 저장
                    const tag = new Tag();
                    tag.tag = tagText;
                    await tagRepo.save(tag);
                }
                // 태그와 게시물 연결
                const tag = await tagRepo.findOne({tag: tagText});
                const postTag = new PostTag();
                postTag.postId = postId;
                postTag.tagTag = tag.tag;
                await postTagRepo.save(postTag);
            }
            resJson.status = true;
            resJson.message = "post success";
        } catch (e) {
            console.log(e);
            resJson.message = "post failed";
        }
        res.json(resJson);
        console.log(resJson.message);
    })

    app.get('/myPage', async (req, res) => {
        // 사용자 이름으로 사용자가 작성한 게시물 정보를 반환
        const resJson = initially(RES);
        const userName = req.query.name;
        try {
            if (await userRepo.findOne({name: userName})) {
                const userInfo = await userRepo.findOne({name: userName});
                const userId = userInfo.id;

                resJson.info = await postRepo.find({
                    where: {writerId: userId},
                    order: {date: "DESC"}
                });
                resJson.status = true;
                resJson.message = "get my page post info success";

            }
        } catch (e) {
            console.log(e);
            resJson.message = "Can not find user post";
        }
        res.json(resJson);
        console.log(resJson.message);
    })

    app.get('/getTagPost', async (req, res) => {
        // tag 값을 가진 모든 게시물을 나타낸다.
        const resJson = initially(RES);
        const tagText = req.query.tag;
        try {
            const postTags = await postTagRepo.find({where: {tagTag: tagText}});
            const posts = [];
            for (let index = 0; index < postTags.length; index++) {
                const postTag = postTags[index];
                const postInfo = await postRepo.findOne({where: {id: postTag.postId}});
                posts.push(postInfo);
            }
            resJson.info = posts;
            resJson.status = true;
            resJson.message = "find posts by tags is success";
        } catch (e) {
            console.log(e)
            resJson.message = "can not find tag post"
        }
        res.json(resJson);
        console.log(resJson.message);
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