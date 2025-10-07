import React from "react";

export type PageHeaderAction = {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
};

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: PageHeaderAction[];
  accessory?: React.ReactNode; // only shows on >= sm
  className?: string;
  /** Mobile actions layout: stack (default) or horizontal scroll */
  mobileLayout?: "stack" | "scroll";
}

/**
 * Responsive page header SIN dropdown
 * - Desktop: botones a la derecha
 * - Mobile: botones visibles (apilados por defecto o carrusel horizontal)
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions = [],
  accessory,
  className = "",
  mobileLayout = "stack",
}) => {
  const hasActions = actions.length > 0;

  return (
    <header className={`w-full mb-6 ${className}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Title block */}
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm sm:text-base text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>

        {/* Accessory (desktop only) */}
        {accessory && (
          <div className="hidden sm:flex shrink-0 items-center ml-4">
            {accessory}
          </div>
        )}

        {hasActions && (
          <div className="sm:ml-4 w-full sm:w-auto">
            {/* Desktop buttons */}
            <div className="hidden sm:flex sm:flex-wrap sm:items-center sm:justify-end gap-2">
              {actions.map((action, idx) => (
                <button
                  key={`${action.label}-${idx}`}
                  type="button"
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={
                    `inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ` +
                    `focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ` +
                    `disabled:opacity-50 disabled:cursor-not-allowed ` +
                    (action.variant === "secondary"
                      ? "bg-white/60 dark:bg-white/5 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-white/10 hover:bg-white/80"
                      : action.variant === "ghost"
                      ? "bg-transparent text-gray-700 dark:text-gray-200 hover:bg-gray-100/70 dark:hover:bg-white/5"
                      : "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500")
                  }
                  aria-label={action.label}
                >
                  {action.icon && (
                    <span className="shrink-0">{action.icon}</span>
                  )}
                  <span className="truncate">{action.label}</span>
                </button>
              ))}
            </div>

            {/* Mobile: visible actions, sin dropdown */}
            {mobileLayout === "stack" ? (
              <div className="sm:hidden flex flex-col gap-2 mt-1">
                {actions.map((action, idx) => (
                  <button
                    key={`m-${action.label}-${idx}`}
                    type="button"
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className={
                      `w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ` +
                      `focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ` +
                      `disabled:opacity-50 disabled:cursor-not-allowed ` +
                      (action.variant === "secondary"
                        ? "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 dark:bg-white/5 dark:text-gray-100 dark:border-white/10"
                        : action.variant === "ghost"
                        ? "bg-transparent text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-white/5"
                        : "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500")
                    }
                  >
                    {action.icon && (
                      <span className="shrink-0">{action.icon}</span>
                    )}
                    <span className="truncate">{action.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="sm:hidden -mx-4 px-4 overflow-x-auto">
                <div className="flex gap-2 py-1 w-max">
                  {actions.map((action, idx) => (
                    <button
                      key={`m-${action.label}-${idx}`}
                      type="button"
                      onClick={action.onClick}
                      disabled={action.disabled}
                      className={
                        `inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition whitespace-nowrap ` +
                        `focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ` +
                        `disabled:opacity-50 disabled:cursor-not-allowed ` +
                        (action.variant === "secondary"
                          ? "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 dark:bg-white/5 dark:text-gray-100 dark:border-white/10"
                          : action.variant === "ghost"
                          ? "bg-transparent text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-white/5"
                          : "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500")
                      }
                    >
                      {action.icon && (
                        <span className="shrink-0">{action.icon}</span>
                      )}
                      <span className="truncate">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="mt-4 h-px bg-gray-200 dark:bg-white/10" />
    </header>
  );
};

export default PageHeader;

/*
USAGE
-----
<PageHeader
  title="Torneos"
  subtitle="Gestión y administración"
  actions=[
    { label: "Nuevo", onClick: () => {}, variant: "primary" },
    { label: "Exportar", onClick: () => {}, variant: "secondary" },
  ]
  mobileLayout="stack" // o "scroll"
/>
*/
