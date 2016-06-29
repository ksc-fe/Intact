import Vdt from 'vdt';

export let extend = Vdt.utils.extend; 
export let isArray = Vdt.utils.isArray;

/**
 * inherit
 * @param Parent
 * @param prototype
 * @returns {Function}
 */
export function inherit(Parent, prototype) {
    let Child = function(...args) {
        if (!this || !(this instanceof Child || this.prototype instanceof Child)) {
            return Parent.apply(Child, args);
        }
        return Parent.apply(this, args);
    };

    Child.prototype = create(Parent.prototype);
    each(prototype, function(proto, name) {
        if (name === 'displayName') {
            return Child.displayName = proto;
        }
        if (!isFunction(proto) || name === 'template') {
            return Child.prototype[name] = proto;
        }
        Child.prototype[name] = (() => {
            let _super = function(...args) {
                    return Parent.prototype[name].apply(this, args);
                }, 
                _superApply = function(args) {
                    return Parent.prototype[name].apply(this, args);
                };
            return function(...args) {
                let self = this || {},
                    __super = self._super,
                    __superApply = self._superApply,
                    returnValue;

                self._super = _super;
                self._superApply = _superApply;

                returnValue = proto.apply(this, args);

                self._super = __super;
                self._superApply = __superApply;

                return returnValue;
            };
        })();
    });
    Child.__super = Parent.prototype;
    Child.prototype.constructor = Child;

    extend(Child, Parent);

    return Child;
}

let nativeCreate = Object.create;
export function create(object) {
    if (nativeCreate) {
        return nativeCreate(object);
    } else {
        let fn = () => {};
        fn.prototype = object;
        return new fn();
    }
}

let hasOwn = Object.prototype.hasOwnProperty;
export function each(obj, iter, thisArg) {
    if (isArray(obj)) {
        for (let i = 0, l = obj.length; i < l; i++) {
            iter.call(thisArg, obj[i], i, obj);
        } 
    } else if (isObject(obj)) {
        for (let key in obj) {
            if (hasOwn.call(obj, key)) {
                iter.call(thisArg, obj[key], key, obj);
            }
        }
    }
}

export function isFunction(obj) {
    return typeof obj === 'function';
}

export function isObject(obj) {
    let type = typeof obj;
    return type === 'function' || type === 'object' && !!obj; 
}

export function result(obj, property, fallback) {
    let value = obj == null ? undefined : obj[property];
    if (value === undefined) {
        value = fallback;
    }
    return isFunction(value) ? value.call(obj) : value;
}

let executeBound = (sourceFunc, boundFunc, context, callingContext, args) => {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    let self = create(sourceFunc.prototype);
    let result = sourceFunc.apply(self, args);
    if (isObject(result)) return result;
    return self;
};
let nativeBind = Function.prototype.bind;
export function bind(func, context, ...args) {
    if (nativeBind && func.bind === nativeBind) {
        return nativeBind.call(func, context, ...args);
    }
    if (!isFunction(func)) throw new TypeError('Bind must be called on a function');
    let bound = function(...args1) {
        return executeBound(func, bound, context, this, [...args, ...args1]);
    };
    return bound;
}

export function isEqual(a, b) {
    return a == b;
}

let idCounter = 0;
export function uniqueId(prefix) {
    let id = ++idCounter + '';
    return prefix ? prefix + id : id;
}