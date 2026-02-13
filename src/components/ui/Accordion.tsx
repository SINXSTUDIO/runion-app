"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const AccordionContext = React.createContext<{
    openItem: string | undefined;
    setOpenItem: (value: string | undefined) => void;
} | null>(null);

const Accordion = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { type?: "single" | "multiple", collapsible?: boolean }>(({ className, children, ...props }, ref) => {
    const [openItem, setOpenItem] = React.useState<string | undefined>(undefined);

    const handleSetOpenItem = (value: string | undefined) => {
        setOpenItem(prev => prev === value ? undefined : value);
    };

    return (
        <AccordionContext.Provider value={{ openItem, setOpenItem: handleSetOpenItem }}>
            <div ref={ref} className={cn("space-y-1", className)} {...props}>
                {children}
            </div>
        </AccordionContext.Provider>
    );
});
Accordion.displayName = "Accordion"

const AccordionItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value: string }>(({ className, children, value, ...props }, ref) => {
    // Pass value to children via Context or cloning? 
    // Easier usually to let Trigger/Content use the context and require 'value' on them or Context propagation.
    // Radix does it nicely. Here we can just require 'value' on Item and pass it down via context? No. 
    // We can use a context for Item too.

    return (
        <AccordionItemContext.Provider value={value}>
            <div ref={ref} className={cn("border-b border-white/10", className)} {...props}>
                {children}
            </div>
        </AccordionItemContext.Provider>
    );
})
AccordionItem.displayName = "AccordionItem"

const AccordionItemContext = React.createContext<string | null>(null);

const AccordionTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(({ className, children, ...props }, ref) => {
    const context = React.useContext(AccordionContext);
    const itemValue = React.useContext(AccordionItemContext);

    if (!context || !itemValue) return null;

    const isOpen = context.openItem === itemValue;

    return (
        <button
            ref={ref}
            onClick={() => context.setOpenItem(itemValue)}
            className={cn(
                "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:text-accent text-left w-full",
                isOpen && "text-accent",
                className
            )}
            {...props}
        >
            {children}
            <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform duration-200 text-zinc-500", isOpen && "rotate-180")} />
        </button>
    )
})
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => {
    const context = React.useContext(AccordionContext);
    const itemValue = React.useContext(AccordionItemContext);

    if (!context || !itemValue) return null;

    const isOpen = context.openItem === itemValue;

    return (
        <div
            ref={ref}
            className={cn(
                "overflow-hidden text-sm transition-all duration-300 ease-in-out grid",
                isOpen ? "grid-rows-[1fr] pb-4 opacity-100" : "grid-rows-[0fr] opacity-0"
            )}
            {...props}
        >
            <div className={cn("min-h-0 pt-0 text-zinc-400 whitespace-pre-line", className)}>
                {children}
            </div>
        </div>
    )
})
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
