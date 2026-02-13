import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const InputField = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-white mb-2">
                        {label}
                    </label>
                )}
                <input
                    className={`
                        w-full px-4 py-3 bg-white/5 border rounded-xl outline-none transition-all
                        placeholder:text-zinc-500 text-white
                        ${error
                            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                            : 'border-white/10 hover:border-white/20 focus:border-accent focus:ring-1 focus:ring-accent'
                        }
                        ${className || ''}
                    `}
                    ref={ref}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-sm text-red-500">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

InputField.displayName = 'InputField';

export default InputField;
