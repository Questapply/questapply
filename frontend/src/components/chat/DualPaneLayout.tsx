import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

type LayoutOptions = {
  separateBoxes?: boolean; // default: true -> each column inside its own card-like box
  boxGap?: "4" | "6" | "8" | "10"; // horizontal gap between boxes (maps to Tailwind gap-x-*)
  chatRatio?: number; // default: 0.333 (1/3 : 2/3)
  resizable?: boolean; // keep current resizable behavior if used

  // Independent chat height controls:
  chatHeightMode?: "vh" | "px" | "auto"; // default: 'vh'
  chatHeight?: number; // default: 94 (means 94vh if mode='vh')
  stickyChat?: boolean; // default: true
  stickyOffset?: number; // default: 0 (px), to offset a fixed header
};

type ResultsGridOptions = {
  minCardWidth?: number; // default: 360 (px) -> used in auto-fit grid
  gap?: "4" | "6" | "8" | "10"; // default: '6'
  fill?: "auto-fit" | "auto-fill"; // default: 'auto-fit'
  densePacking?: boolean; // default: true -> grid-auto-flow: dense
  equalizeCardHeight?: boolean; // default: true -> cards use h-full
  distributeCardWhitespace?: boolean; // default: true -> internal sections use flex-1/justify-between
};

type DualPaneLayoutProps = {
  chat: React.ReactNode;
  results: React.ReactNode;
  layout?: LayoutOptions;
  resultsGrid?: ResultsGridOptions; // applies to the right column
};

const DualPaneLayout = ({
  chat,
  results,
  layout = {},
  resultsGrid = {},
}: DualPaneLayoutProps) => {
  // Layout options with defaults
  const {
    separateBoxes = true,
    boxGap = "6",
    chatRatio = 0.333,
    resizable = false,
    chatHeightMode = "vh",
    chatHeight = 94,
    stickyChat = true,
    stickyOffset = 0,
  } = layout;

  // Results grid options with defaults
  const {
    minCardWidth = 360,
    gap = "6",
    fill = "auto-fit",
    densePacking = true,
    equalizeCardHeight = true,
    distributeCardWhitespace = true,
  } = resultsGrid;

  // Calculate chat height based on mode
  const getChatHeight = () => {
    if (chatHeightMode === "vh") return `${chatHeight}vh`;
    if (chatHeightMode === "px") return `${chatHeight}px`;
    return "auto";
  };

  // Get grid classes
  const getGridClasses = () => {
    const gapClass =
      gap === "4"
        ? "gap-4"
        : gap === "6"
        ? "gap-6"
        : gap === "8"
        ? "gap-8"
        : "gap-10";
    const gridTemplate = `repeat(${fill}, minmax(min(${minCardWidth}px, 100%), 1fr))`;

    return {
      className: cn(
        "grid w-full",
        gapClass,
        densePacking && "auto-rows-auto",
        equalizeCardHeight && "auto-rows-fr"
      ),
      style: {
        gridTemplateColumns: gridTemplate,
        ...(densePacking && { gridAutoFlow: "dense" }),
      },
    };
  };
  const gridProps = getGridClasses(); // دوبار صدا نزن
  const isArray = Array.isArray(results);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Main Content - Dual Pane */}
      <div className="flex-1 overflow-hidden">
        {separateBoxes ? (
          // Separate boxes layout with gap
          <div
            className={cn(
              "flex flex-col md:flex-row h-full  bg-muted/30",
              boxGap === "4" && "md:gap-x-4",
              boxGap === "6" && "md:gap-x-6",
              boxGap === "8" && "md:gap-x-8",
              boxGap === "10" && "md:gap-x-10",
              "gap-y-4"
            )}
          >
            {/* Chat Box */}
            <motion.div
              className={cn(
                "flex flex-col rounded-lg border shadow-sm bg-card border-border min-h-0 min-w-0 w-full ",
                stickyChat ? "md:sticky" : "",
                "basis-full md:basis-[var(--chat-basis)] md:max-w-[var(--chat-basis)]"
              )}
              style={{
                ["--chat-basis" as any]: `${chatRatio * 100}%`,
                height: getChatHeight(),
                ...(stickyChat ? { top: `${stickyOffset}px` } : {}),
              }}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {chat}
            </motion.div>

            {/* Results Box */}
            <motion.div
              className="w-full flex-1 rounded-lg border  shadow-sm overflow-hidden bg-card border-border min-h-0 min-w-0"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="h-full overflow-auto overflow-x-hidden ">
                {Array.isArray(results) ? (
                  <div
                    {...getGridClasses()}
                    style={{
                      ...getGridClasses().style,
                      ...(distributeCardWhitespace && {
                        alignItems: "stretch",
                      }),
                    }}
                  >
                    {(results as React.ReactNode[]).map((node, i) =>
                      (node as any)?.key ? (
                        node
                      ) : (
                        <div key={`result-${i}`}>{node}</div>
                      )
                    )}
                  </div>
                ) : results ? (
                  <>{results}</>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No results to display
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        ) : (
          // Simple flex layout (no resizing)
          <div className="flex h-full bg-background">
            {/* Chat Column */}
            <div
              style={{ width: `${chatRatio * 100}%`, height: getChatHeight() }}
            >
              <motion.div
                className="h-full flex flex-col border-r border-border bg-card"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {chat}
              </motion.div>
            </div>

            {/* Results Column */}
            <div style={{ width: `${(1 - chatRatio) * 100}%` }}>
              <motion.div
                className="h-full bg-background"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="h-full overflow-auto p-6">
                  {Array.isArray(results) ? (
                    <div
                      {...getGridClasses()}
                      style={{
                        ...getGridClasses().style,
                        ...(distributeCardWhitespace && {
                          alignItems: "stretch",
                        }),
                      }}
                    >
                      {(results as React.ReactNode[]).map((node, i) =>
                        (node as any)?.key ? (
                          node
                        ) : (
                          <div key={`result-${i}`}>{node}</div>
                        )
                      )}
                    </div>
                  ) : results ? (
                    <>{results}</>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No results to display
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export {
  DualPaneLayout as default,
  type LayoutOptions,
  type ResultsGridOptions,
};
