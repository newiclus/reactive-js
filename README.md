# ReactiveJS

A minimal and efficient reactivity system inspired by Vue.js's reactivity system. This library provides core reactivity features including reactive objects, effects, refs, computed properties, and watchers.

## Features

- 🔄 **Reactive Objects**: Convert plain objects into reactive ones
- ⚡ **Effects**: Automatically track and re-run functions when dependencies change
- 📦 **Refs**: Create reactive references for primitive values
- 🧮 **Computed Properties**: Create cached, reactive computed values
- 👀 **Watchers**: Watch for changes in reactive sources
- 🔒 **Readonly Objects**: Create immutable versions of reactive objects
- 🎯 **Shallow Reactivity**: Optimize performance with shallow reactive objects
- 🛠️ **Utility Functions**: Various helpers for working with reactive objects

## Installation

### NPM

```bash
npm install reactive-js
```

### CDN

```html
<!-- UMD build (uncompressed) -->
<script src="https://unpkg.com/reactive-js/dist/reactive.umd.js"></script>

<!-- UMD build (minified) -->
<script src="https://unpkg.com/reactive-js/dist/reactive.min.js"></script>

<!-- ES Module build -->
<script type="module">
  import {
    reactive,
    effect,
  } from "https://unpkg.com/reactive-js/dist/reactive.esm.js";
</script>
```

## Usage

### ES Modules (Modern Browsers)

```javascript
import { reactive, effect } from "reactive-js";

const state = reactive({ count: 0 });
effect(() => {
  console.log(`Count is: ${state.count}`);
});
state.count++;
```

### UMD (Traditional Script Tag)

```html
<script src="https://unpkg.com/reactive-js/dist/reactive.min.js"></script>
<script>
  const { reactive, effect } = ReactiveJS;

  const state = reactive({ count: 0 });
  effect(() => {
    console.log(`Count is: ${state.count}`);
  });
  state.count++;
</script>
```

### CommonJS (Node.js)

```javascript
const { reactive, effect } = require("reactive-js");

const state = reactive({ count: 0 });
effect(() => {
  console.log(`Count is: ${state.count}`);
});
state.count++;
```

### More Examples

### Basic Reactivity

```javascript
import { reactive, effect } from "reactive-js";

const state = reactive({ count: 0 });

effect(() => {
  console.log(`Count is: ${state.count}`);
});

state.count++; // Logs: "Count is: 1"
```

### Refs

```javascript
import { ref, effect } from "reactive-js";

const count = ref(0);

effect(() => {
  console.log(`Count is: ${count.value}`);
});

count.value++; // Logs: "Count is: 1"
```

### Computed Properties

```javascript
import { ref, computed } from "reactive-js";

const count = ref(0);
const double = computed(() => count.value * 2);

console.log(double.value); // 0
count.value++;
console.log(double.value); // 2
```

### Watchers

```javascript
import { ref, watch } from "reactive-js";

const count = ref(0);

watch(count, (newValue, oldValue) => {
  console.log(`Count changed from ${oldValue} to ${newValue}`);
});

count.value++; // Logs: "Count changed from 0 to 1"
```

### Readonly Objects

```javascript
import { reactive, readonly } from "reactive-js";

const state = reactive({ count: 0 });
const readonlyState = readonly(state);

readonlyState.count = 1; // Warning: Cannot modify readonly object
console.log(readonlyState.count); // 0
```

### Shallow Reactivity

```javascript
import { shallowReactive, effect } from "reactive-js";

const state = shallowReactive({ nested: { count: 0 } });

effect(() => {
  console.log(`Count is: ${state.nested.count}`);
});

state.nested.count++; // No effect triggered
state.nested = { count: 1 }; // Effect triggered
```

## Build

The library is built using Rollup and provides multiple output formats:

- `dist/reactive.esm.js`: ES Module format (modern browsers)
- `dist/reactive.umd.js`: UMD format (traditional script tags)
- `dist/reactive.cjs.js`: CommonJS format (Node.js)
- `dist/reactive.min.js`: Minified UMD format (production)

To build the library locally:

```bash
# Install dependencies
npm install

# Build all formats
npm run build

# Build and watch for changes
npm run build:watch
```

## API Reference

### Core Functions

- `reactive(obj)`: Creates a reactive proxy of an object
- `effect(fn)`: Runs a function and tracks its dependencies
- `ref(value)`: Creates a reactive reference
- `computed(getter)`: Creates a computed property
- `watch(source, callback)`: Watches for changes in a reactive source
- `readonly(obj)`: Creates a readonly version of an object
- `shallowReactive(obj)`: Creates a shallow reactive proxy

### Utility Functions

- `toRaw(obj)`: Returns the original object from a reactive proxy
- `isReactive(obj)`: Checks if an object is reactive
- `isRef(value)`: Checks if a value is a ref
- `unref(value)`: Returns the inner value if the argument is a ref

## Error Handling

The library includes built-in error handling for common issues:

- Maximum recursion depth exceeded
- Maximum effect stack size exceeded
- Circular references
- Invalid types for reactivity
- Attempts to modify readonly objects

## Performance Considerations

- Use `shallowReactive` for large objects where deep reactivity isn't needed
- Be mindful of effect nesting to avoid stack overflow
- Consider using `computed` for expensive calculations
- Use `readonly` for objects that shouldn't be modified

## Testing

The library uses Vitest for testing, which provides fast and efficient test running with excellent TypeScript support.

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

The test suite includes:

- Unit tests for all core functionality
- Coverage reports with HTML output
- Watch mode for development
- CI/CD integration support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
