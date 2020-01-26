import { connect as connectX } from 'react-redux';
import { RootStore } from './config';
import { valueExtractor } from './depth';

const errors = {
    xSetState: 'Provided state is not an object',
    getStateForKey: 'getStateForKey: Giving key must be string!',
    connectWrapped: 'WrappedComponent is required',
    requiredKeysArray: 'required keys is not an Array',
    requiredKeysStrings: 'all required keys should be strings',
    requiredKeyNF: (key: string) => `required key "${key}" not found`,
};

/**
 * Reset State - Clears stored state tree.
 */
const xResetState = () => setStateForKey(null, 'xResetState');
/**
 * X Set State
 * @param {object} state
 */
const xSetState = (state: object) => {
    if (typeof state !== 'object') { throw Error(errors.xSetState); }
    for (const key in state) { setStateForKey(state[key], key); }
};

/**
    * Get State for Keys and subkeys ("key.subkey")
    * @example
    * // Get userData Object (key)
    * const userData = getStateForKey('userData')
    *
    * // Get user's name from userData Object (Subkey)
    * const userName = getStateForKey('userData.name')
    * @param {string} key Key for required state
 */
const getStateForKey = (key: string) => {
    if (typeof key !== 'string') { throw Error(errors.getStateForKey); }
    const { RN } = RootStore.getState();
    return valueExtractor(RN, key)
};

/**
 * Similar to xSetState, plus it can be used to set deep state
 */
const setStateForKey = (state: any, key: string) => {
    RootStore.dispatch({ type: key, payload: state });
};

/**
 * React Component Connector
 * @param WrappedComponent Class Component
 * @param {Array<string>} requiredKeys Array Of required keys to be connected.
 */
const connect = (WrappedComponent, requiredKeys: Array<string> = []) => {

    if (typeof WrappedComponent === 'undefined') { throw Error(errors.connectWrapped); }

    const errorTemplate = (reason: string) =>
        `ReactNativeRedux.connect\nFailed to connect "${WrappedComponent.name}"\nReason: ${reason}`;

    if (!Array.isArray(requiredKeys)) { throw Error(errorTemplate(errors.requiredKeysArray)); }

    const allStrings = requiredKeys.every((key) => typeof key === 'string');
    if (!allStrings) {
        throw Error(errorTemplate(errors.requiredKeysStrings));
    }
    const mapStateToProps = ({ RN }) => {
        const propsToConnect = {};
        if (requiredKeys.length === 0) {
            for (const key in RN) {
                if (key === 'didInit') { return; }
                propsToConnect[key] = RN[key];
            }
            return propsToConnect;
        }
        for (const key of requiredKeys) {
            propsToConnect[key] = valueExtractor(RN, key);
        }
        return propsToConnect;
    };
    return connectX(mapStateToProps, {})(WrappedComponent);
};


export {
    connect,
    xSetState, xResetState,
    setStateForKey, getStateForKey,
};
