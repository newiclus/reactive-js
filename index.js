/**
 * ReactiveJS - A minimal reactivity system
 * This implementation provides core reactivity features similar to Vue.js
 * including reactive objects, effects, refs, computed properties, and watchers
 */

// Constants for configuration
export const MAX_RECURSION_DEPTH = 200;
export const MAX_EFFECT_STACK_SIZE = 1000;
export const EFFECT_STACK_WARNING_THRESHOLD = 750;

// Error messages
export const ERRORS = {
  MAX_RECURSION: "Maximum recursion depth exceeded",
  MAX_STACK: "Maximum effect stack size exceeded",
  INVALID_TYPE: "Invalid type for reactive conversion",
  CIRCULAR_REF: "Circular reference detected",
  READONLY: "Cannot modify readonly object",
  STACK_WARNING: "Effect stack size approaching limit",
};

// Global state for tracking effects and dependencies
const effectStack = []; // Stack to track currently running effects
const targetMap = new WeakMap(); // Maps objects to their dependency maps
const reactiveCache = new WeakMap(); // Cache for reactive proxies to prevent duplicate proxies
const RAW = Symbol("raw"); // Symbol to store the original object in proxies
const CIRCULAR_CHECK = Symbol("circular_check"); // Symbol for circular reference detection

/**
 * Validates if an object can be made reactive
 * @param {any} obj - The object to validate
 * @throws {Error} If the object is invalid for reactivity
 */
function validateReactiveTarget(obj, depth = 0) {
  if (depth >= MAX_RECURSION_DEPTH) {
    console.error(ERRORS.MAX_RECURSION);
    throw new Error(ERRORS.MAX_RECURSION);
  }

  if (obj === null || typeof obj !== "object") {
    console.error(ERRORS.INVALID_TYPE);
    throw new Error(ERRORS.INVALID_TYPE);
  }

  // Check for circular references
  if (obj[CIRCULAR_CHECK]) {
    console.error(ERRORS.CIRCULAR_REF);
    throw new Error(ERRORS.CIRCULAR_REF);
  }

  obj[CIRCULAR_CHECK] = true;

  try {
    if (Array.isArray(obj)) {
      obj.forEach((item) => {
        if (item && typeof item === "object") {
          validateReactiveTarget(item, depth + 1);
        }
      });
    } else {
      Object.values(obj).forEach((value) => {
        if (value && typeof value === "object") {
          validateReactiveTarget(value, depth + 1);
        }
      });
    }
  } finally {
    delete obj[CIRCULAR_CHECK];
  }
}

/**
 * Creates and runs a reactive effect
 * @param {Function} fn - The function to run reactively
 * @throws {Error} If the effect stack size is exceeded
 *
 * An effect is a function that automatically re-runs when its dependencies change.
 * Effects can be nested, and the stack ensures proper dependency tracking.
 */
export function effect(fn) {
  if (effectStack.length >= MAX_EFFECT_STACK_SIZE) {
    console.error(ERRORS.MAX_STACK);
    throw new Error(ERRORS.MAX_STACK);
  }

  const wrappedEffect = () => {
    try {
      cleanup(wrappedEffect);
      effectStack.push(wrappedEffect);

      // Add warning for deep effect stacks
      if (effectStack.length >= EFFECT_STACK_WARNING_THRESHOLD) {
        console.warn(ERRORS.STACK_WARNING);
      }

      const result = fn();
      return result;
    } catch (error) {
      console.error("Error in reactive effect:", error);
      throw error;
    } finally {
      effectStack.pop();
    }
  };

  wrappedEffect.deps = [];
  wrappedEffect(); // Execute the effect immediately
  return wrappedEffect; // Return the effect function for later use
}

/**
 * Cleans up dependencies for an effect
 * @param {Function} effectFn - The effect function to clean up
 *
 * Removes the effect from all its dependency sets and clears its deps array.
 * This prevents memory leaks and ensures clean dependency tracking.
 */
function cleanup(effectFn) {
  for (const dep of effectFn.deps) {
    dep.delete(effectFn);
  }
  effectFn.deps = [];
}

/**
 * Tracks property access for dependency collection
 * @param {Object} target - The reactive object
 * @param {string|symbol} key - The property being accessed
 *
 * Builds the dependency graph by linking effects to the properties they use.
 * This enables automatic re-running of effects when dependencies change.
 */
function track(target, key) {
  const effectFn = effectStack[effectStack.length - 1];
  if (!effectFn) return;

  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  let deps = depsMap.get(key);
  if (!deps) {
    deps = new Set();
    depsMap.set(key, deps);
  }

  if (!deps.has(effectFn)) {
    deps.add(effectFn);
    effectFn.deps.push(deps);
  }
}

/**
 * Triggers effects when a property changes
 * @param {Object} target - The reactive object
 * @param {string|symbol} key - The property that changed
 *
 * Notifies all effects that depend on the changed property,
 * causing them to re-run with the new value.
 */
function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  const effects = depsMap.get(key);
  if (effects) {
    // Create a new Set to avoid infinite loops
    const effectsToRun = new Set(effects);
    effectsToRun.forEach((effect) => effect());
  }
}

/**
 * Creates a reactive proxy for an object with depth control
 * @param {Object} obj - The object to make reactive
 * @param {number} depth - Current recursion depth
 * @returns {Proxy} - A reactive proxy of the object
 * @throws {Error} If maximum recursion depth is exceeded
 */
function createReactiveProxy(obj, depth = 0) {
  if (depth >= MAX_RECURSION_DEPTH) {
    console.error(ERRORS.MAX_RECURSION);
    throw new Error(ERRORS.MAX_RECURSION);
  }

  if (reactiveCache.has(obj)) {
    return reactiveCache.get(obj);
  }

  const proxy = new Proxy(obj, {
    get(target, key, receiver) {
      if (key === RAW) return target;
      const result = Reflect.get(target, key, receiver);
      track(target, key);
      return typeof result === "object" && result !== null
        ? createReactiveProxy(result, depth + 1)
        : result;
    },
    set(target, key, value, receiver) {
      if (Object.isFrozen(target)) {
        console.warn(ERRORS.READONLY);
        return true;
      }
      const oldValue = target[key];
      const newValue = value;
      const result = Reflect.set(target, key, newValue, receiver);
      if (oldValue !== newValue) {
        trigger(target, key);
      }
      return result;
    },
    deleteProperty(target, key) {
      if (Object.isFrozen(target)) {
        console.warn(ERRORS.READONLY);
        return true;
      }
      const hadKey = key in target;
      const result = Reflect.deleteProperty(target, key);
      if (hadKey) {
        trigger(target, key);
      }
      return result;
    },
  });

  reactiveCache.set(obj, proxy);
  return proxy;
}

/**
 * Creates a reactive proxy for an object
 * @param {Object} obj - The object to make reactive
 * @returns {Proxy} - A reactive proxy of the object
 *
 * Converts a plain object into a reactive one by wrapping it in a Proxy.
 * The proxy tracks property access and changes, enabling automatic updates.
 */
export function reactive(obj) {
  try {
    validateReactiveTarget(obj);
    return createReactiveProxy(obj);
  } catch (error) {
    console.error("Error creating reactive object:", error);
    throw error;
  }
}

/**
 * Creates a reactive reference
 * @param {any} value - The initial value
 * @returns {Object} - A reactive reference object
 *
 * Wraps a primitive value in a reactive object with a .value property.
 * Useful for making primitive values reactive.
 */
export function ref(value) {
  const wrapper = reactive({ value });
  return {
    get value() {
      return wrapper.value;
    },
    set value(newValue) {
      wrapper.value = newValue;
    },
  };
}

/**
 * Creates a computed property
 * @param {Function} getter - The function that computes the value
 * @returns {Object} - A computed reference object
 *
 * Creates a reactive value that is computed from other reactive values.
 * The computation is cached and only re-run when dependencies change.
 */
export function computed(getter) {
  let cachedValue;
  let dirty = true;
  let runner;

  const computedRef = {
    get value() {
      if (dirty) {
        if (!runner) {
          runner = effect(() => {
            cachedValue = getter();
            dirty = false;
          });
        } else {
          runner();
        }
      }
      return cachedValue;
    },
  };

  return computedRef;
}

/**
 * Watches for changes in a reactive source
 * @param {Function|Object} source - The source to watch
 * @param {Function} callback - The function to call when the source changes
 *
 * Executes a callback whenever the watched source changes.
 * Provides both new and old values to the callback.
 */
export function watch(source, callback) {
  let oldValue;
  const getter = typeof source === "function" ? source : () => unref(source);

  effect(() => {
    const newValue = getter();
    callback(newValue, oldValue);
    oldValue = newValue;
  });
}

/**
 * Creates a readonly version of an object
 * @param {Object} obj - The object to make readonly
 * @returns {Proxy} - A readonly proxy of the object
 *
 * Creates a proxy that prevents modifications to the object.
 * Useful for ensuring immutability of certain objects.
 */
export function readonly(obj) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      return Reflect.get(target, key, receiver);
    },
    set() {
      console.warn("Cannot modify readonly object");
      return true;
    },
  });
}

/**
 * Creates a shallow reactive proxy for an object
 * @param {Object} obj - The object to make shallow reactive
 * @returns {Proxy} - A shallow reactive proxy of the object
 *
 * Similar to reactive() but only makes the top-level properties reactive.
 * Nested objects remain non-reactive, which can be more performant in some cases.
 */
export function shallowReactive(obj) {
  if (typeof obj !== "object" || obj === null) return obj;

  if (reactiveCache.has(obj)) {
    return reactiveCache.get(obj);
  }

  const proxy = new Proxy(obj, {
    get(target, key, receiver) {
      if (key === RAW) return target;
      const result = Reflect.get(target, key, receiver);
      track(target, key);
      return result; // No recursive reactivity
    },

    set(target, key, value, receiver) {
      const oldValue = target[key];
      const newValue = value;
      const result = Reflect.set(target, key, newValue, receiver);
      if (oldValue !== newValue) {
        trigger(target, key);
      }
      return result;
    },
  });

  reactiveCache.set(obj, proxy);
  return proxy;
}

/**
 * Returns the raw, non-proxied object from a reactive proxy
 * @param {Object} obj - The reactive proxy
 * @returns {Object} - The original, non-reactive object
 *
 * Useful when you need to access the original object without triggering reactivity.
 */
export function toRaw(obj) {
  return obj?.[RAW] || obj;
}

/**
 * Checks if an object is a reactive proxy
 * @param {Object} obj - The object to check
 * @returns {boolean} - True if the object is reactive
 */
export function isReactive(obj) {
  return !!obj?.[RAW];
}

/**
 * Checks if a value is a ref object
 * @param {any} value - The value to check
 * @returns {boolean} - True if the value is a ref
 */
export function isRef(value) {
  return Boolean(
    value &&
      typeof value === "object" &&
      "value" in value &&
      Object.getOwnPropertyDescriptor(value, "value")?.get
  );
}

/**
 * Returns the inner value if the argument is a ref, otherwise returns the argument
 * @param {any} value - The value to unwrap
 * @returns {any} - The unwrapped value
 *
 * Useful when you need to work with either refs or raw values.
 */
export function unref(value) {
  return isRef(value) ? value.value : value;
}
