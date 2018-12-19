// a regular action creator
function Any (data) {
    return {
        type: 'ANY',
        payload: data
    }
}

// a thunk action
function myThunk (data) {
    return function (dispatch, getState, { API, DICTIONARY }) {
        return fetch('url').then((val) => {

            return dispatch(actionM());

        }).then((val) => {
            // dispatch returns the value of the action, 
            // so chaining promises like this is possible if needed
            // for that scenario of course our thunk should return promises
            return dispatch(actionD(val));
        })
    }
}

// thunks work on the server side too

// thunks include an optional 3rd argument, which will be available inside of thunks
// it could be an API or a special data store
const store = createStore(reducer, applyMiddleware(thunk.withExtraArgument({API, DICTIONARY})));

// we pass there an object, but it can be composed of several objects and then we use destructuring to access the one we need   