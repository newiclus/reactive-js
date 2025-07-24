# ReactiveJS

A minimal and efficient reactivity system inspired by Vue.js, providing core reactivity features including reactive objects, effects, refs, computed properties, and watchers.

## ✨ Features

- 🔄 **Reactive Objects**: Transform plain objects into reactive proxies
- ⚡ **Effects**: Automatically track and re-run side effects when dependencies change
- 📦 **Refs**: Create reactive references for primitive values
- 🧮 **Computed Properties**: Cached computed values that update automatically
- 👀 **Watchers**: Watch reactive sources and execute callbacks on changes
- 🔒 **Readonly Objects**: Create immutable versions of reactive objects
- 🎯 **Shallow Reactivity**: Make only top-level properties reactive
- 🛠️ **Utility Functions**: Helper functions for working with reactive objects
- ❌ **Error Handling**: Comprehensive error handling with stack overflow protection
- 🤹 **Memory Management**: Efficient memory usage with WeakMap caching

## 📦 Installation

```bash
npm install reactive-js
```

## 🔧 Usage

### Basic Reactivity

```javascript
import { reactive, effect, ref, computed, watch } from "reactive-js";

// Create a reactive object
const state = reactive({
  count: 0,
  name: "John",
});

// Create an effect that automatically re-runs when dependencies change
effect(() => {
  console.log(`Count is: ${state.count}`);
});

// Modify the reactive object
state.count++; // Automatically triggers the effect
```

### Refs

```javascript
import { ref, unref } from "reactive-js";

// Create a reactive reference
const count = ref(0);

// Access the value
console.log(count.value); // 0

// Modify the value
count.value++;

// Unwrap refs
const unwrapped = unref(count); // 1
```

### Computed Properties

```javascript
import { ref, computed } from "reactive-js";

const count = ref(0);

// Create a computed property
const double = computed(() => count.value * 2);

console.log(double.value); // 0
count.value = 5;
console.log(double.value); // 10 (automatically updated)
```

### Watchers

```javascript
import { ref, watch } from "reactive-js";

const count = ref(0);

// Watch for changes
watch(count, (newValue, oldValue) => {
  console.log(`Count changed from ${oldValue} to ${newValue}`);
});

count.value++; // Triggers the watcher
```

### Shallow Reactive

```javascript
import { shallowReactive, effect } from "reactive-js";

const obj = shallowReactive({
  nested: { count: 0 },
});

effect(() => {
  console.log(obj.nested.count);
});

obj.nested.count++; // Won't trigger the effect (shallow)
obj.nested = { count: 1 }; // Will trigger the effect
```

## 🛠️ API Reference

### Core Functions

#### `reactive(obj)`

Creates a reactive proxy of an object.

#### `effect(fn)`

Creates a reactive effect that automatically tracks dependencies and re-runs when they change.

#### `ref(value)`

Creates a reactive reference for a value.

#### `computed(getter)`

Creates a computed property that caches its value and only re-computes when dependencies change.

#### `watch(source, callback)`

Watches a reactive source and executes a callback when it changes.

#### `shallowReactive(obj)`

Creates a shallow reactive object where only top-level properties are reactive.

### Utility Functions

#### `isReactive(obj)`

Checks if an object is reactive.

#### `isRef(value)`

Checks if a value is a ref.

#### `unref(value)`

Unwraps a ref, returning the inner value.

#### `toRaw(obj)`

Returns the raw (non-reactive) object.

## 🧪 Testing

```bash
npm test
```

## 📈 Performance

The library is optimized for:

- **Minimal overhead**: Efficient proxy creation and caching
- **Lazy evaluation**: Computed properties only execute when needed
- **Memory efficiency**: Proper cleanup and WeakMap usage
- **Stack safety**: Protection against infinite recursion

## 🤝 Contributing

Contributions are welcome! Please ensure all tests pass before submitting a pull request.

## 📄 License

MIT License - see LICENSE file for details.

## 📋 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed list of changes and improvements.
