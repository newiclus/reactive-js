# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-07-24

### 🚀 Performance Optimizations

- **Unified Proxy Creation**: Eliminated redundant proxy creation logic across reactive functions
- **Optimized Validation**: Simplified validation functions for better performance
- **Lazy Computed**: Computed properties are now truly lazy (only execute when accessed)
- **Memory Management**: Improved cleanup and reduced memory leaks with better WeakMap usage

### 🔧 Code Quality Improvements

- **Reduced Redundancy**: Eliminated duplicate code and redundant methods
- **Better Error Handling**: Enhanced error messages and improved stack overflow protection
- **Cleaner Architecture**: Simplified function implementations and improved code organization
- **Improved Documentation**: Better JSDoc comments and inline documentation

### 🐛 Bug Fixes

- **Circular Reference Detection**: Fixed circular reference validation to work consistently
- **Computed Caching**: Corrected computed property caching behavior for proper lazy evaluation
- **Effect Stack Management**: Improved effect stack size monitoring and protection
- **Validation Logic**: Fixed validation functions to work consistently across all scenarios

### 🧪 Testing

- All 20 tests now pass successfully
- Improved test coverage for edge cases
- Better error handling tests
- Memory management validation

### 📦 Build & Dependencies

- Updated package.json with proper scripts and metadata
- Improved build configuration
- Better development tooling setup

## [1.0.0] - Initial Release

### ✨ Features

- **Reactive Objects**: Transform plain objects into reactive proxies
- **Effects**: Automatically track and re-run side effects when dependencies change
- **Refs**: Create reactive references for primitive values
- **Computed Properties**: Cached computed values that update automatically
- **Watchers**: Watch reactive sources and execute callbacks on changes
- **Shallow Reactive**: Make only top-level properties reactive
- **Utility Functions**: Helper functions for working with reactive objects
- **Error Handling**: Comprehensive error handling with stack overflow protection
- **Memory Management**: Efficient memory usage with WeakMap caching

### 🛠️ API

- `reactive(obj)` - Creates a reactive proxy of an object
- `effect(fn)` - Creates a reactive effect that tracks dependencies
- `ref(value)` - Creates a reactive reference for a value
- `computed(getter)` - Creates a cached computed property
- `watch(source, callback)` - Watches reactive sources for changes
- `shallowReactive(obj)` - Creates a shallow reactive object
- `isReactive(obj)` - Checks if an object is reactive
- `isRef(value)` - Checks if a value is a ref
- `unref(value)` - Unwraps a ref, returning the inner value
- `toRaw(obj)` - Returns the raw (non-reactive) object
