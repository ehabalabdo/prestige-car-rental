// Centralized numeric date formatter with null-safe guards
// Returns "—" for undefined/null/invalid values. Accepts string | Date.

import { safeDate } from "../utils";

export const formatDateNumeric = (value: any): string => {
  const dateIso = safeDate(value);
  if (!dateIso) return "—";
  try {
    const d = new Date(dateIso);
    if (isNaN(d.getTime())) return "—";
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return "—";
  }
};
