import React, { useCallback, useRef, useState } from "react";

type SetStateAction<S> = (inp: S) => void;

/**
 * Combine useRef and useState. Return ref and state accessor, where the setter will set both state and the ref.
 */
export const useStateRef = <T>(
  initialState: T
): [T, SetStateAction<T>, React.MutableRefObject<T>] => {
  const ref = useRef(initialState);
  const [state, setState] = useState(initialState);
  const setter = useCallback((inp: T) => {
    setState(inp);
    ref.current = inp;
  }, []);
  return [state, setter, ref];
};
