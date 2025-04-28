import { describe, test, expect, vi } from "vitest";
import {
  reactive,
  effect,
  ref,
  computed,
  watch,
  readonly,
  shallowReactive,
  toRaw,
  isReactive,
  isRef,
  unref,
  EFFECT_STACK_WARNING_THRESHOLD,
  MAX_EFFECT_STACK_SIZE,
  MAX_RECURSION_DEPTH,
  ERRORS,
} from "../index";

describe("Reactive System", () => {
  describe("reactive()", () => {
    test("should make an object reactive", () => {
      const obj = { count: 0 };
      const reactiveObj = reactive(obj);

      expect(reactiveObj).not.toBe(obj);
      expect(isReactive(reactiveObj)).toBe(true);
    });

    test("should track and trigger effects", () => {
      const obj = reactive({ count: 0 });
      let dummy;

      effect(() => {
        dummy = obj.count;
      });

      expect(dummy).toBe(0);
      obj.count++;
      expect(dummy).toBe(1);
    });

    test("should handle nested objects", () => {
      const obj = reactive({ nested: { count: 0 } });
      let dummy;

      effect(() => {
        dummy = obj.nested.count;
      });

      expect(dummy).toBe(0);
      obj.nested.count++;
      expect(dummy).toBe(1);
    });

    test("should handle arrays", () => {
      const arr = reactive([1, 2, 3]);
      let dummy;

      effect(() => {
        dummy = arr[0];
      });

      expect(dummy).toBe(1);
      arr[0] = 4;
      expect(dummy).toBe(4);
    });

    test("should handle circular references", () => {
      const obj = { a: 1 };
      obj.circular = obj;

      expect(() => reactive(obj)).toThrow("Circular reference detected");
    });

    test("should respect readonly objects", () => {
      const obj = reactive({ count: 0 });
      const readonlyObj = readonly(obj);

      const consoleSpy = vi.spyOn(console, "warn");

      readonlyObj.count = 1;
      expect(consoleSpy).toHaveBeenCalledWith("Cannot modify readonly object");
      expect(readonlyObj.count).toBe(0);

      consoleSpy.mockRestore();
    });
  });

  describe("ref()", () => {
    test("should create a reactive reference", () => {
      const count = ref(0);
      let dummy;

      effect(() => {
        dummy = count.value;
      });

      expect(dummy).toBe(0);
      count.value++;
      expect(dummy).toBe(1);
    });

    test("should handle nested refs", () => {
      const count = ref(ref(0));
      let dummy;

      effect(() => {
        dummy = count.value.value;
      });

      expect(dummy).toBe(0);
      count.value.value++;
      expect(dummy).toBe(1);
    });
  });

  describe("computed()", () => {
    test("should compute values reactively", () => {
      const count = ref(0);
      const double = computed(() => count.value * 2);

      expect(double.value).toBe(0);
      count.value++;
      expect(double.value).toBe(2);
    });

    test("should cache computed values", () => {
      const count = ref(0);
      let calls = 0;

      const double = computed(() => {
        calls++;
        return count.value * 2;
      });

      expect(calls).toBe(0);
      expect(double.value).toBe(0);
      expect(calls).toBe(1);
      expect(double.value).toBe(0);
      expect(calls).toBe(1);
    });
  });

  describe("watch()", () => {
    test("should watch reactive sources", () => {
      const count = ref(0);
      let dummy;

      watch(count, (newVal, oldVal) => {
        dummy = [newVal, oldVal];
      });

      count.value++;
      expect(dummy).toEqual([1, 0]);
    });

    test("should watch getter functions", () => {
      const count = ref(0);
      let dummy;

      watch(
        () => count.value,
        (newVal, oldVal) => {
          dummy = [newVal, oldVal];
        }
      );

      count.value++;
      expect(dummy).toEqual([1, 0]);
    });
  });

  describe("shallowReactive()", () => {
    test("should only make top-level properties reactive", () => {
      const obj = shallowReactive({ nested: { count: 0 } });
      let dummy;

      effect(() => {
        dummy = obj.nested.count;
      });

      expect(dummy).toBe(0);
      obj.nested.count++;
      expect(dummy).toBe(0); // Should not trigger effect
    });
  });

  describe("Utility Functions", () => {
    test("toRaw() should return original object", () => {
      const obj = { count: 0 };
      const reactiveObj = reactive(obj);

      expect(toRaw(reactiveObj)).toBe(obj);
    });

    test("isReactive() should detect reactive objects", () => {
      const obj = { count: 0 };
      const reactiveObj = reactive(obj);

      expect(isReactive(obj)).toBe(false);
      expect(isReactive(reactiveObj)).toBe(true);
    });

    test("isRef() should detect ref objects", () => {
      const count = ref(0);

      expect(isRef(count)).toBe(true);
      expect(isRef(0)).toBe(false);
    });

    test("unref() should unwrap refs", () => {
      const count = ref(0);

      expect(unref(count)).toBe(0);
      expect(unref(0)).toBe(0);
    });
  });

  describe("Error Handling", () => {
    test("should handle maximum recursion depth", () => {
      const createDeepObject = (depth) => {
        if (depth === 0) return { value: 0 };
        return { nested: createDeepObject(depth - 1) };
      };

      const deepObj = createDeepObject(MAX_RECURSION_DEPTH);

      expect(() => reactive(deepObj)).toThrow(
        "Maximum recursion depth exceeded"
      );

      //cleanup
      vi.clearAllMocks();
    });

    test("should handle effect stack size limits", () => {
      const obj = reactive({ count: 0 });

      function createNestedEffect(depth) {
        if (depth <= 0) return;
        console.log("depth", depth);

        effect(() => {
          obj.count; // Access reactive property
          createNestedEffect(depth - 1);
        });
      }

      // Verify that creating one more effect throws an error
      expect(() => createNestedEffect(MAX_EFFECT_STACK_SIZE + 1)).toThrow(
        ERRORS.MAX_STACK
      );
    });

    test("should warn when effect stack size approaches limit", () => {
      const consoleWarning = vi.spyOn(console, "warn");
      const obj = reactive({ count: 0 });

      // Create a function that will trigger nested effects
      function createNestedEffect(depth) {
        if (depth <= 0) return;

        effect(() => {
          obj.count; // Access reactive property
          createNestedEffect(depth - 1);
        });
      }

      // Create nested effects up to the warning threshold
      createNestedEffect(EFFECT_STACK_WARNING_THRESHOLD + 1);

      expect(consoleWarning).toHaveBeenCalledWith(ERRORS.STACK_WARNING);
      consoleWarning.mockRestore();
    });
  });
});
