import React from 'react';

/*
const mapStateToProps = (state, ownProps) => {
    return {
        prop: state.prop
    }
}
const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        dispatch1: () => {
            dispatch(actionCreator)
        }
    }
}
*/

/**
 * 
 * The goal of this method is:
 * - linking a component to the store
 * - passing the component just te props it needs
 * - ensuring the component updates each time the state changes
 * - ensure the component have access to dispatch to change the state
 * - ensure the component is unsubscribed when is unmounted 
 * 
 * Missing things: update only if something changed, optimizations, acces to Store (Provider)
 */
function connect (mapStateToProps, mapDispatchToProps) {
    // use this pattern to allow using as a decorator for the component object
    return function (WrappedComponent) {
        // the inner fn returns a new component that actually render the original component
        // with its props
        return class extends React.Component {
            // return the original component with the full set of properties
            // also spread the pairs prop-value read from the state 
            // and the action-triggering methods with access to dispacth

            // each render execution invokes getState to get current state, and read fro it props needed by this comp
            render () {
                return (
                    <WrappedComponent 
                        {...this.props}
                        {...mapStateToProps(store.getState(), this.props)}
                        {...mapDispatchToProps(store.dispatch, this.props)}
                    />
                )
            }
            // Add a set of lifecycle methods to listen state changes so you dont need take care of it
            // every component in a redux environment needs it

            // subscribe this component to the store. send a method to the store that will be executed on each state change
            componentDidMount () {
                this.unsubscribe = store.subscribe(this.handleChange.bind(this));
            }
            // when the component unmounts, we must unsubscribe from the store
            componentWillUnmount () {
                this.unsubscribe();
            }
            // this is a generic method that is executed by the store each time the state changes
            // what is does, is using React.forceUpdate to trigger a render
            handleChange () {
                this.forceUpdate();
            }
        }
    }
}

// redux first makes a reference comparison between prevstate object and currentstate object, since redux expects
// state to be immutable, every actual update must return a full new object
// not the old object with a a new prop or new value for a prop.
// if we just return the same object modified, the first fast way to chechk if something has changed
// will fail, since the === will tells us it is the same object, hence no change
// if previous check was positive, then react-redux will execute mapState and get new possible values for this component
// it will compare those values against the previous one, and it those are diff, so the subscribed callaeck will be executed