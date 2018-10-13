
const randomString = () => {
    Math.random()
        .toString(36)
        .substring(7)
        .split('')
        .join('.')
}

// reserved action types used by redux. We can see some of them in the redux dev tool 
// taking a look for example to the first actions when the app starts
const ActionTypes = {
    INIT: `@@redux/INIT${randomString()}`,
    REPLACE: `@@redux/REPLACE${randomString()}`,
    PROBE_UNKNOWN_ACTION: () => `@@redux/PROBE_UNKNOWN_ACTION${randomString()}`
}

export default ActionTypes;