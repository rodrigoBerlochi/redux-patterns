function createThunkMiddleware (extraArgument) {
            // thunk fn              next fn  action fn
    return ({dispatch, getState}) => next => action => {
        // action which are thunks, are functions, so...
        if (typeof action === 'function') {
            // in those cases, execute them an pass as arguments dispatch, getState and the extraargument, if defined
            return action(dispatch, getState, extraArgument);
        }
        // if not, just pass the action object to next, which for a single middleware is store.dispatch
        // internally, together with redux, a middleware will save a reference to the store.dispatch in next()
        // and replace it with the action-creator function
        return next(action);
    }
}

// when using this module, what it is exported is the return value
// of crateThunkMiddleare fn, which is the inner function
// notice first call to it does not pass any argument
const thunk = createThunkMiddleware();
// that returned function gets a property that actually is a reference to
// the same function we already called
// this time is the client who will or not call it
thunk.withExtraArgument = createThunkMiddleware;

// recall how it is used:
// const store = createStore(reducer, applyMiddleware(thunk.withExtraArgument({API, DICTIONARY}));
// when we use withExtraArguments, we actually do not pass as middleware to the store the function returned from the 
// first internal invokation we called "thunk",
// we pass to the store the result of the second invokation of createThunkMiddleware
// it is the same returned function but in the closure it has access to the extra argument

export default thunk;