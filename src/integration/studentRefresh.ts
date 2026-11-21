import { createContext, useContext } from "react";
export const RefreshStudentData = createContext<(() => void) | undefined>(
  undefined,
);
export function useRefreshStudentData() {
  return useContext(RefreshStudentData);
}
