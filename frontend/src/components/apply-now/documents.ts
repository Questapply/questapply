export type DocStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "applied"
  | "pending";
export type SimpleDocument = { status: DocStatus };

export const getDocumentCompletionPercentage = (
  documents: SimpleDocument[]
) => {
  if (!documents || documents.length === 0) return 0;
  const completed = documents.filter(
    (doc) => doc.status === "completed"
  ).length;
  return Math.round((completed / documents.length) * 100);
};
