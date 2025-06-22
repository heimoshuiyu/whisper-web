import { useState } from "react";
import {
  loadStringFromLocalStorageWithDefault,
  mockStringStateUpdater,
} from "../utils/helpers";

export const useLocalStorage = (key: string, defaultValue: string) => {
  const [value, setValue] = useState(() =>
    loadStringFromLocalStorageWithDefault(key, defaultValue),
  );

  const setValueWithStorage = mockStringStateUpdater(key, setValue);

  return [value, setValueWithStorage] as const;
};
