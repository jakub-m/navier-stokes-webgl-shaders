import { useSearchParams } from "react-router-dom";

/**
 * Code from https://blog.logrocket.com/use-state-url-persist-state-usesearchparams/
 */
export const useSearchParamsState = (
  searchParamName: string,
  defaultValue: string
): readonly [
  searchParamsState: string,
  setSearchParamsState: (newState: string) => void
] => {
  const [searchParams, setSearchParams] = useSearchParams();

  const acquiredSearchParam = searchParams.get(searchParamName);
  const searchParamsState = acquiredSearchParam ?? defaultValue;

  const setSearchParamsState = (newState: string) => {
    const next = Object.assign(
      {},
      [...searchParams.entries()].reduce(
        (o, [key, value]) => ({ ...o, [key]: value }),
        {}
      ),
      { [searchParamName]: newState }
    );
    setSearchParams(next);
  };
  return [searchParamsState, setSearchParamsState];
};

export const useSearchParamsValue = (
  searchParamName: string,
  defaultValue: string
): string => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchParams, ignore] = useSearchParams();

  const acquiredSearchParam = searchParams.get(searchParamName);
  const searchParamsState = acquiredSearchParam ?? defaultValue;

  return searchParamsState;
};
