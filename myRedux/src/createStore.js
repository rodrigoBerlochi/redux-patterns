
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

    // ...
    if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
        enhancer = preloadedState;
        preloadedState = undefined;
    }

    if (typeof enhancer !== 'undefined') {
        if (typeof enhancer !== 'function') {
            throw new Error('enhancer must be a fn');
        }
        return enhancer(createStore)(reducer, preloadedState);
    } 

    if (typeof reducer !== 'function') {
        throw new Error('reducer must be fn');
    }

    let currentReducer = reducer;
    let currentState = preloadedState;
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

    // API to read state, which is stored internally in currentState variable    
    function getState() {
         if (isDispatching) {
             throw new Error('state cannot be read while reducer is changing it');
         }

         return currentState;
    }

    /**
     * 
     * @param {Function} listener callback invoked each time the the state changes or dispatch is invoked
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
            if (!isSubscribed) {
                return;
            }

            isSubscribed = false;
            ensureCanMutateNextListeners();
            const idx = nextListeners.indexOf(listener); // closure retains this listener
            nextListeners.splice(idx, 1); // remove this only listener
        }
    }
}