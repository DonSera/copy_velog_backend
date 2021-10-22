const RES = 'resJson';
const USER = 'userInfo';
const WRITER = 'writerInfo';
const LOGIN = 'loginInfo';
const DEFAULT = 'postDefaultInfo';
const BRIEF = 'postBriefInfo';
const DETAIL = 'postDetailInfo';

function initially(type = RES) {
    if (type === RES) {
        return {
            status: false,
            message: "Failed",
            info: {}
        }
    }
    if (type === WRITER) {
        return {
            name: null,
            thumbNail: null,
            intro: null
        }
    }
    if (type === USER) {
        return {
            id: null,
            name: null,
            email: null
        }
    }
    if (type === LOGIN) {
        return {
            id: null,
            email: null,
            name: null
        }
    }
    if (type === DEFAULT) {
        return {
            id: null,
            title: null,
            date: null,
            tags: [],
            heartNum: null,
            writerInfo: {}
        }
    }
    if (type === BRIEF) {
        return {
            subTitle: null,
            commentNum: null,
            img: null
        }
    }
    if (type === DETAIL) {
        return {
            subTitle: null,
            content: null,
            comment: null
        }
    }
}

export {
    initially,
    RES, USER, WRITER, LOGIN, DETAIL, DEFAULT, BRIEF
};

