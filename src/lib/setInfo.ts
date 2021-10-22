function setInfo(target, info) {
    for (const key in info) {
        target[key] = info[key];
    }
}

export {setInfo};