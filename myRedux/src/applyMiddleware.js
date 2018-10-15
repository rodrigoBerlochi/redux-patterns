import compose from './compose'

// the most outer function is executed by our implementation
// in our client code when creating the store 
export default function applyMiddleware(...middlewares) {
    //from client code: applyMiddleware( // from redux, needed to add Thunks
    //                      thunkMiddleware.withExtraArgument(_eStore) // add Thunks and use its support for extra argument
    //                  )
    // from createStore: enhancer(createStore)(reducer, preloadedState)
    // this inner function is called by the internal implementation of createStore()
    // and it injects to first call the createStore parameter and to the returned fn call, other args like reducer & preloadedState
    return createStore => (...args) => {
        // now applyMiddleware takes care of executing createStore and passing down the params
        const store = createStore(...args);
        // copied
        let dispatch = () => {
            throw new Error(
              `Dispatching while constructing your middleware is not allowed. ` +
                `Other middleware would not be applied to this dispatch.`
            )
        }

        const MiddlewareAPI = {
            getState: store.getState,
            dispatch: (...args) => dispatch(...args) // kind of disabling dispatch while middleware is beng processed
        }
        // pass getState and disabled dispatch for each middleware
        const chain = middlewares.map(middleware => middleware(MiddlewareAPI));
        // reduce array of fn to a single one and restore dispatch
        dispatch = compose(...chain)(store.dispatch);
        // returns an object with each prop of the store and the dispatch
        return {
            ...store,
            dispatch
        }
    }
}