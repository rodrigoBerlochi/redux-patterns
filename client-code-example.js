//WIP
import React from 'react';
import {render} from 'react-dom';

import {Provider, connect} from 'react-redux';

import thunkMiddleware from 'redux-thunk';

import {createStore, applyMiddleware, combineReducers} from 'redux';

import reducerExample1 from 'reducerExample1';
import reducerExample2 from 'reducerExample2'; 

// try to summarize in a single file the usage of redux
// -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-
const reducer = combineReducers({
    reducerExample1,
    reducerExample2
});

// optional capability to store values across the application and get access to them from
// inside of thunks, but in a separate way of the State
let _eStore = {};

// probably you want redux dev tools...
// install the redux tools in your browser and then access them from the next line
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
// user composeEnhancers to construct the enhancers for this app, which will include tunkMiddleware for async actions
const store = createStore(
                        reducer, // already combined reducers
                        preloadedState, // hydrate initial state on load
                        composeEnhancers( // from redux tools
                            applyMiddleware( // from redux, needed to add Thunks
                                thunkMiddleware.withExtraArgument(_eStore) // add Thunks and use its support for extra argument
                            )
                        )
                );
// the when dispatch an action you will get: const doSubmit = (yourArgs) => (getState, dispatch, _eStore) => {}


// example of component using connect()
const _TheApp = (props) => {
    return (
        <h1>props.title</h1>
    );
};
// access State from components
const mapStateToProps = (state) => ({
    title: state.title
});
// give component the chance to trigger changes into the state
const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        onClickButton: () => {
            dispatch(actionCreator)
        }
    }
};

const TheApp = connect(mapStateToProps, mapDispatchToProps)(_TheApp);


// the final render of the whole tree to the html page
render(
    <Provider store={store}>
        <TheApp />
    </Provider>,
    document.getElementById('id')
);