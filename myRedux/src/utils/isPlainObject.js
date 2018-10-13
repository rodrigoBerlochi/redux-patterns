export default function isPlainObject (obj) {
    // first at all, it must be an object and not other kind of value nor null
    if (typeof obj !== 'object' || obj === null) {
        return false;
    }

    let proto = obj;
    /*
     A plain object is an object created by {} or new Object()
     It isn't an object created with a custom constructor, nor other built-ins 
     like Array(), String(), Error()
     A way to identify plain object therefore, is by checking its prototype
     a POJO will have in its prototype chain only 1 level of inheritance, directly to Object
     (all objects in JS are linked to Object in its prototype chain right before null)
     For non-POJO values, the while will more than 1 level until getting the very first value in
     the prototype chain, which will be !== than Object.getPrototypeOf(obj) applied over the evaluated
     value passed as argument
    */
    while (Object.getPrototypeOf(proto) !== null) {
        proto = Object.getPrototypeOf(proto);
    }

    return Object.getPrototypeOf(obj) === proto;
}