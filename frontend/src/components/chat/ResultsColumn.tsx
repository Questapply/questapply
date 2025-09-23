import React from "react";

type ResultsColumnProps = {
  children?: React.ReactNode;
  title?: string;
  padded?: boolean;
  emptyState?: React.ReactNode;
  className?: string;
  toolbar?: React.ReactNode;
};

export default function ResultsColumn({
  children,
  title,
  padded = true,
  emptyState,
  className = "",
  toolbar,
}: ResultsColumnProps) {
  // تعداد واقعی نودها (حتی اگر Fragment/شرطی باشند)
  const count = React.Children.count(children);

  // بعضی وقت‌ها children می‌تونه false/null باشه؛ اینو هم هندل می‌کنیم
  let hasRenderableChild = false;
  React.Children.forEach(children, (child) => {
    if (child !== null && child !== undefined && child !== false) {
      hasRenderableChild = true;
    }
  });

  const hasContent = count > 0 && hasRenderableChild;

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {title || toolbar ? (
        <div className="border-b px-4 py-3 rounded-t-lg border-border bg-muted/30 flex items-center justify-between sticky top-0 z-10">
          <h3 className="font-semibold">{title}</h3>
          <div>{toolbar}</div>
        </div>
      ) : null}

      <div className={`flex-1 overflow-auto ${padded ? "p-4" : ""}`}>
        {hasContent ? (
          children
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
            {emptyState ?? "No results to display"}
          </div>
        )}
      </div>
    </div>
  );
}
