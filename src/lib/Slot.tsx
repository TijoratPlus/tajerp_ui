import * as React from "react";

/**
 * Minimal `asChild` Slot — merges the component's props/className/handlers onto
 * its single child element (à la Radix Slot) without pulling in an extra
 * dependency. Used by primitives that accept `asChild` (e.g. Button) so a
 * consumer can render a Link/anchor while keeping the component's styling.
 */

function mergeSlotProps(
  slotProps: Record<string, unknown>,
  childProps: Record<string, unknown>,
) {
  const overrideProps = { ...childProps };
  for (const propName of Object.keys(childProps)) {
    const slotPropValue = slotProps[propName as keyof typeof slotProps];
    const childPropValue = childProps[propName];
    const isHandler = /^on[A-Z]/.test(propName);
    if (isHandler) {
      if (slotPropValue && childPropValue) {
        overrideProps[propName] = (...args: unknown[]) => {
          const result = (childPropValue as (...a: unknown[]) => unknown)(
            ...args,
          );
          (slotPropValue as (...a: unknown[]) => void)(...args);
          return result;
        };
      } else if (slotPropValue) {
        overrideProps[propName] = slotPropValue;
      }
    } else if (propName === "style") {
      overrideProps[propName] = {
        ...(slotPropValue as object),
        ...(childPropValue as object),
      };
    } else if (propName === "className") {
      overrideProps[propName] = [slotPropValue, childPropValue]
        .filter(Boolean)
        .join(" ");
    }
  }
  return { ...slotProps, ...overrideProps };
}

function getElementRef(element: React.ReactElement) {
  const legacy = element as React.ReactElement & { ref?: React.Ref<unknown> };
  let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get;
  let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return legacy.ref;
  }
  getter = Object.getOwnPropertyDescriptor(legacy, "ref")?.get;
  mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return (element.props as { ref?: React.Ref<unknown> }).ref;
  }
  return (element.props as { ref?: React.Ref<unknown> }).ref || legacy.ref;
}

function composeRefs<T>(...refs: (React.Ref<T> | undefined | null)[]) {
  return (instance: T | null) => {
    for (const ref of refs) {
      if (ref == null) continue;
      if (typeof ref === "function") {
        ref(instance);
      } else {
        (ref as React.MutableRefObject<T | null>).current = instance;
      }
    }
  };
}

export const Slot = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }
>(function Slot({ children, ...slotProps }, forwardedRef) {
  if (React.isValidElement(children)) {
    const childRef = getElementRef(children);
    const props = mergeSlotProps(
      slotProps as Record<string, unknown>,
      children.props as Record<string, unknown>,
    ) as Record<string, unknown> & { ref?: React.Ref<HTMLElement> };
    if (children.type !== React.Fragment) {
      props.ref =
        forwardedRef != null || childRef != null
          ? composeRefs(
              forwardedRef as React.Ref<HTMLElement>,
              childRef as React.Ref<HTMLElement>,
            )
          : childRef;
    }
    return React.cloneElement(children, props);
  }
  return React.Children.count(children) > 1 ? React.Children.only(null) : null;
});

Slot.displayName = "Slot";
