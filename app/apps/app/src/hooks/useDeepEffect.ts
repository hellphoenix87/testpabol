import { isEqual } from "lodash";
import { useEffect, useRef } from "react";

/* 
 This hook is the same as useEffect, but it uses deep comparison to check if the dependencies have changed.
 useEffect does a shallow comparison, so if you pass an object or array as a dependency, it will always re-run the effect. 
 This is useful when you want to avoid unnecessary re-renders, but the dependencies are objects or arrays that need to be compared deeply.
*/
function useDeepEffect(callback: () => (() => void) | void, dependencies: any[]) {
  const previousDependenciesRef = useRef<any[]>([]);

  useEffect(() => {
    if (!isEqual(previousDependenciesRef.current, dependencies)) {
      const returnFunction = callback();
      if (returnFunction) {
        return returnFunction;
      }
    }

    previousDependenciesRef.current = dependencies;
  }, [dependencies, callback]);
}

export default useDeepEffect;
