import React, { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";

export const AccordionItem: React.FC<{
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border">
      <button
        className="flex w-full items-center justify-between py-4 text-left font-semibold transition-all hover:underline"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        type="button"
      >
        {title}
        {open ? (
          <ChevronUpIcon className="w-4 h-4 ml-2 transition-transform duration-200" />
        ) : (
          <ChevronDownIcon className="w-4 h-4 ml-2 transition-transform duration-200" />
        )}
      </button>
      <div
        className={`overflow-hidden text-sm transition-all ${
          open ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0"
        }`}
        style={{ transitionProperty: "max-height, opacity" }}
      >
        <div className="pb-4 pt-0">{children}</div>
      </div>
    </div>
  );
};

export const Accordion: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <div>{children}</div>;
