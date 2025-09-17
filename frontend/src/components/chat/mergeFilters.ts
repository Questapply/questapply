// chat/mergeFilters.ts
import { FilterPatch, FilterSnapshot, MultiOp } from "./actions";

function applyMultiOp(current: string[] | undefined, op: MultiOp): string[] {
  let out = Array.isArray(current) ? [...current] : [];

  if (op.clear) return [];

  if (op.set) {
    return [...op.set];
  }

  if (op.toggle && op.toggle.length) {
    const set = new Set(out);
    for (const v of op.toggle) {
      if (set.has(v)) set.delete(v);
      else set.add(v);
    }
    out = Array.from(set);
  }
  return out;
}

export function mergeFilterPatch(
  current: FilterSnapshot,
  patch: FilterPatch
): FilterSnapshot {
  const next: FilterSnapshot = { ...current };

  // فیلدهای تک‌ارزشی
  if ("country" in patch) next.country = patch.country ?? undefined;
  if ("school" in patch) next.school = patch.school ?? undefined;
  if ("degreeLevel" in patch) next.degreeLevel = patch.degreeLevel ?? undefined;
  if ("orderBy" in patch) next.orderBy = patch.orderBy ?? undefined;
  if ("searchQuery" in patch) next.searchQuery = patch.searchQuery ?? undefined;

  // چندانتخابی‌ها
  if ("state" in patch) {
    const val = patch.state as any;
    next.state = Array.isArray(val)
      ? val
      : applyMultiOp(current.state, val as MultiOp);
  }
  if ("areaOfStudy" in patch) {
    const val = patch.areaOfStudy as any;
    next.areaOfStudy = Array.isArray(val)
      ? val
      : applyMultiOp(current.areaOfStudy, val as MultiOp);
  }
  if ("program" in patch) {
    const val = patch.program as any;
    next.program = Array.isArray(val)
      ? val
      : applyMultiOp(current.program, val as MultiOp);
  }

  return next;
}
