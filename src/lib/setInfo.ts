function setInfo(target, info) {
    for (const key in target) {
        if (info[key]) {
            target[key] = info[key];
        }
    }
}

export {setInfo};