export const getDocumentCompletionPercentage = (
  documents: { status?: string }[] = []
) => {
  if (!documents?.length) return 0;
  const completed = documents.filter((d) => d.status === "completed").length;
  return Math.round((completed / documents.length) * 100);
};
