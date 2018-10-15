/**
 * 
 */
function _bindActionCreator (actionCreator, dispatch) {
    return function () {
        return dispatch(actionCreatore.apply(this, arguments));
    }
}

export default function bindActionCreators (actionCreators, dispatch) {
    if (typeof actionCreators === 'function') {
        return _bindActionCreator(actionCreators, dispatch);
    }

    if (typeof actionCreators !== 'object' || actionCreators === null) {
        throw new Error();
    }

    // when it is an object whose props are action creator functions...
    // eg: doing import * as actionsCreators from 'myFnToCreateActions';
    const keys = Object.keys(actionCreators);
    const boundActionCreators = {};

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const actionCreator = actionCreators[key];
        // iterates through object props, and after ensure each one is a function, 
        // pass to the binder and store the result before returning the whole function
        if (typeof actionCreator === 'function') {
            boundActionCreators[key] = _bindActionCreator(actionCreator, dispatch);
        }
    }

    return boundActionCreators;
}