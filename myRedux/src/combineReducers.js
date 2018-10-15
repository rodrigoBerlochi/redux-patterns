import ActionTypes from './utils/actionTypes'
import isPlainObject from './utils/isPlainObject'

function getUndefinedStateErrorMessage(key, action) {}

function getUnexpectedStateShapeWarningMessage(
    inputState,
    reducers,
    action,
    unexpectedKeyCache
  ) {}

function assertReducerShape(reducers) {}
/**
 * 
 * @param {Object} reducers Each object prop is a reducer function
 * @returns {Function} A single reducer function, that invokes every reducer-function passed as argument
 * That single reducer function returns an object with the same shape of the objects returned for each fn 
 */
export default function combineReducers(reducers) {
    /**
     * Each reducer is a fn(state, action). We have as many reducers as logically we organized our application
     * But Redux then receives only 1 sinlge reducer
     * This fn combineReducers({}) expects an object where each key match a reducer:
     * combineReducers({
     *    login: (state, action) => {},
     *    filters: (state, action) => {}
     * })
     * The names of the properties are the one we will use then to access each set of properties
     */
    // get the names of each of the reducers
    const reducerKeys = Object.keys(reducers);
    const finalReducer = {};

    for (let i = 0; i < reducerKeys.length; i++) {
        // use keys to iterate object-reducers and ensure only function values are included
        if (typeof reducers[key] === 'function'){
            finalReducer[key] = reducers[key];
        }
    }

    // now get the keys of the finalReducer, which the actual object we will use
    const finalReducerKeys = Object.keys(finalReducer);

    let unexpectedKeyCache;
    if (process.env.NODE_ENV !== 'production') {
        unexpectedKeyCache = {};
    }

    // some validations
    let shapeAssertionError;
    try {
        assertReducerShape(finalReducer);
    } catch (e) {
        shapeAssertionError = e;
    }

    /**
     * What combineReducers() returns is this function that acts over each minor reducer
     * This fn is what we will pass to createStore(), and is the actual reducer executed on
     * each action dispatching
     * 
     * When the Store calls to currentReducer it pass to it state & action
     * state here is the whole state
     */
    return function combination(state = {}, action) {
       if (shapeAssertionError) {
           throw shapeAssertionError;
       } 

       // copied from orig
       if (process.env.NODE_ENV !== 'production') {
        const warningMessage = getUnexpectedStateShapeWarningMessage(
          state,
          finalReducers,
          action,
          unexpectedKeyCache
        )
        if (warningMessage) {
          warning(warningMessage)
        }
      }

      // flag
      let hasChanged = false;
      const nextState = {};

      // this loop will iterate through each prop of the reducer,
      // and add the next state for each prop on each cycle to nextState
      for(let i = 0; i < finalReducerKeys.length; i++) {
        // iterates over finalReducer using finalReducerKeys
        const key = finalReducerKeys[i]; // get this key
        const reducer = finalReducer[key]; // use it to get the specific reducer 
        // extract the state fragment for this key
        // observe than the key names both the state fragment as well as the reducer
        const previousStateForKey = state[key];

        // now the reducer corresponding to this key is invoked passing to it just
        // the slice of the state that match the key
        const nextStateForKey = reducer(previousStateForKey, action);

        // a validation to ensure the new state isn't undefined, that isn't allowed
        // reducers we implement must always returns a new state or the default one
        if (typeof nextStateForKey === 'undefined') {
            // copied from orig
            const errorMessage = getUndefinedStateErrorMessage(key, action);
            throw new Error(errorMessage);
        }

        nextState[key] = nextStateForKey;
        // is prev state is diff than new state, hasChanged becomes true
        hasChanged = hasChanged || nextStateForKey !== previousStateForKey
      }
      // returns the new state of the original one
      return hasChanged ? nextState : state;
    }
}
