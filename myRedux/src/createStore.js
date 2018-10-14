
import $$observable from 'symbol-observable'

import ActionTypes from './utils/actionTypes'
import isPlainObject from './utils/isPlainObject'

/**
 * 
 * @param {Function} reducer pure function that returns next state as a fn of currentState and action
 * @param {any} preloadedState Optional. Set initial state when the app starts. Great to preload serialized state (must match keys)
 * @param {Function} enhancer usually middleware, persistance, etc. It MUST BE a single function, never more than one
 * @returns {Object} Store (read state, dispatch actions, subscribe to changes)
 */
export default function createStore(reducer, preloadedState, enhancer) {

    // actually no preloadedState was passed in, but an enhancer function was defined
    if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
        enhancer = preloadedState; //2nd param was an enhancer, correct that
        preloadedState = undefined; //and hence there is no preloadedState
    }

    // if enhancer is passed in, it must be a function
    if (typeof enhancer !== 'undefined') {
        if (typeof enhancer !== 'function') {
            throw new Error('enhancer must be a fn');
        }
        // enhancer will take care of store creation
        // let's follow this story later when we study enhancers
        return enhancer(createStore)(reducer, preloadedState);
    } 
    // redux rule: a reducer is a function 
    if (typeof reducer !== 'function') {
        throw new Error('reducer must be fn');
    }
    // rename some values for internal usage
    let currentReducer = reducer;
    let currentState = preloadedState;
    // couple of arrays to store observer callbacks
    let currentListeners = [];
    let nextListeners = currentListeners;
    let isDispatching = false;

    function ensureCanMutateNextListeners() {
        if (nextListeners === currentListeners) {
            // .slice() makes a copy by value of the original array,
            // allowing that changes on the listeners array are made in an actual
            // new array, avoiding mutations of the original
            nextListeners = currentListeners.slice();
        }
    }

    // now the fun parts...

    /**
     * API to read state, which is stored internally in currentState variable
     * @returns {Object} state
     */    
    function getState() {
         if (isDispatching) {
             throw new Error('state cannot be read while reducer is changing it');
         }

         return currentState; // this variable keep track internally of the whole State
                              // it's stored privately to this fn createStore, and hence it can't be changed
                              // except by the mechanism that redux provides: reducers
    }

    /**
     * 
     * @param {Function} listener callback invoked each time the the state changes or dispatch is invoked
     * @returns {Function}
     */
    function subscribe(listener) {
        if (isDispatching) {
            throw new Error('do not call subscribe while reducer is being executed');
        }

        let isSubscribed = true;

        ensureCanMutateNextListeners(); // created a new array of listeners (inmutable)
        nextListeners.push(listener); // save the callback, later every of them will be called when dispatching
                                      // to let them know when the state changed

        // doing const myModUnsubscribe = store.subscribe(callback) we can store a reference to this saved listerner
        // and later unsubscribe it simply calling myModUnsubscribe();
        return function unsubscribe() {
            // access via closure to several values inside this function
            if (!isSubscribed) { 
                return;
            }

            isSubscribed = false;
            ensureCanMutateNextListeners();
            const idx = nextListeners.indexOf(listener); // closure retains this listener
            nextListeners.splice(idx, 1); // remove this only listener
        }
    }

    /**
     * The last method of the Store API, only way to change the state
     * @param {Object} action
     * @returns {Object} action The same action passed in as a para
     */
    function dispatch(action) {
        if (!isPlainObject(action)) {
            throw new Error('Redux rule: action is a plain object. Use a middleware to handle thunks, promises, etc');
        }

        if (typeof action.type === 'undefined') {
            throw new Error('Redux rule: action must have at least a TYPE property and must not be undefined');
        }

        if (isDispatching) {
            // ...
            throw new Error('Reducers may not dispatch actions');
        }

        try {
            isDispatching = true;
            // key step: here is when the "combined-reducer" we passed in as argument is called, given it access to the State
            currentState = currentReducer(currentState, action);
        } finally {
            isDispatching = false;
        }

        // now that we updated the State, it's time to let all the observers know it
        const listeners = (currentListeners = nextListeners);
        for (var i = 0; i < listeners.length; i++) {
            const listener = listeners[i];
            listener();
        }

        return action;
    }

    /**
     * Use this function for hot reloading or code splitting
     * Replace the current reducer for a new one
     * @param {Function} nextReducer
     * @returns {undefined}
     */
    function replaceReducer(nextReducer) {
        if (typeof nextReducer === 'undefined') {
            throw new Error('required param');
        }

        currentReducer = nextReducer;
        dispatch({type: ActionTypes.REPLACE});
    }

    /**
     * TODO: further investigation
     * Interoperability point for observable/reactive libraries.
     * @returns {observable} A minimal observable of state changes.
     * For more information, see the observable proposal:
     * https://github.com/tc39/proposal-observable
     */
    function observable() {
        const outerSubscribe = subscribe;
        return {
             /**
             * The minimal observable subscription method.
             * @param {Object} observer Any object that can be used as an observer.
             * The observer object should have a `next` method.
             * @returns {subscription} An object with an `unsubscribe` method that can
             * be used to unsubscribe the observable from the store, and prevent further
             * emission of values from the observable.
             */
            subscribe(observer) {
                if (typeof observer !== 'object' || observer === null) {
                    throw new Error('observer must be an object');
                }

                function observeState() {
                    if (observer.next) {
                        observer.next(getState());
                    }
                }
                observeState();

                const unsubscribe = outerSubscribe(observeState);
                return unsubscribe;
            },

            [$$observable](){
                return this;
            }
        }
    }

    // this internal action dispatched just 1 time by redux, 
    // populate with the initial state
    dispatch({type: ActionTypes.INIT});

    // make the API public
    return {
        getState,
        dispatch,
        subscribe,
        replaceReducer,
        observable
    }
}