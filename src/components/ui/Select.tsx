'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

// Simplified Select Implementation for this project context
// Using native select for robustness and accessibility, styled to match theme

interface SelectProps {
    onValueChange?: (value: string) => void;
    defaultValue?: string;
    children?: React.ReactNode;
}

export const Select = ({ onValueChange, defaultValue, children }: SelectProps) => {
    const [value, setValue] = React.useState(defaultValue || '');

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = e.target.value;
        setValue(newValue);
        if (onValueChange) onValueChange(newValue);
    };

    // Extract children to pass to the native select
    // This is a simplified adapter to make the API compatible with shadcn-like usage in this specific file
    // In a real scenario, we would use Radix UI or fully implement the context

    return (
        <div className="relative">
            <select
                className={cn(
                    "flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-zinc-900 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none text-white"
                )}
                value={value}
                onChange={handleChange}
            >
                {/* We need to render options here. 
                    Since the Usage in FeedbackModal uses SelectItem components, 
                    we'll hack it a bit for this specific instance or 
                    revisit FeedbackModal to use this simple Select.
                */}
                {React.Children.map(children, (child) => {
                    if (React.isValidElement(child) && child.type === SelectTrigger) {
                        return null; // Skip trigger, handled by select itself styling
                    }
                    if (React.isValidElement(child) && child.type === SelectContent) {
                        return React.Children.map((child.props as any).children, (item: any) => (
                            <option key={item.props.value} value={item.props.value} className="bg-zinc-900 text-white">
                                {item.props.children}
                            </option>
                        ));
                    }
                    return null;
                })}
            </select>
            <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
        </div>
    );
};

export const SelectTrigger = ({ children }: { children: React.ReactNode }) => null;
export const SelectValue = ({ placeholder }: { placeholder: string }) => null;
export const SelectContent = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => (
    <option value={value}>{children}</option>
);
