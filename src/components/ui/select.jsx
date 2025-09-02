import React, { useState, useRef, useEffect } from "react";
import { cn } from "../../lib/utils";

const Select = ({ defaultValue, value, onValueChange, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(defaultValue || value || "");
    const selectRef = useRef(null);

    useEffect(() => {
        if (value !== undefined) {
            setSelectedValue(value);
        }
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (value) => {
        setSelectedValue(value);
        setIsOpen(false);
        if (onValueChange) {
            onValueChange(value);
        }
    };

    const childrenArray = React.Children.toArray(children);
    const trigger = childrenArray.find(child => child.type === SelectTrigger);
    const content = childrenArray.find(child => child.type === SelectContent);

    // 提取所有选项数据
    const items = [];
    if (content && content.props && content.props.children) {
        React.Children.forEach(content.props.children, child => {
            if (child && child.type === SelectItem) {
                items.push({
                    value: child.props.value,
                    label: child.props.children
                });
            }
        });
    }

    return (
        <div className="relative" ref={selectRef}>
            {trigger && React.cloneElement(trigger, {
                onClick: () => setIsOpen(!isOpen),
                isOpen,
                selectedValue,
                items
            })}
            {isOpen && content && React.cloneElement(content, {
                onSelect: handleSelect,
                selectedValue
            })}
        </div>
    );
};

const SelectTrigger = React.forwardRef(({ className, children, onClick, isOpen, selectedValue, items, ...props }, ref) => (
    <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hover:border-gray-400 transition-all duration-200",
            className
        )}
        {...props}
    >
        {React.Children.map(children, child => 
            child && child.type === SelectValue 
                ? React.cloneElement(child, { selectedValue, items })
                : child
        )}
        <svg
            className={cn("h-4 w-4 opacity-50 transition-transform duration-200", isOpen && "rotate-180")}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
    </button>
));
SelectTrigger.displayName = "SelectTrigger";

const SelectContent = React.forwardRef(({ className, children, onSelect, selectedValue, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg animate-in fade-in-0 zoom-in-95",
            className
        )}
        {...props}
    >
        <div className="p-1">
            {React.Children.map(children, child => 
                child ? React.cloneElement(child, {
                    onSelect,
                    selectedValue
                }) : null
            )}
        </div>
    </div>
));
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef(({ className, children, value, onSelect, selectedValue, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "relative flex w-full cursor-pointer select-none items-center rounded-sm py-2.5 px-3 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors duration-150",
            selectedValue === value && "bg-blue-50 text-blue-600",
            className
        )}
        onClick={() => onSelect(value)}
        {...props}
    >
        {children}
    </div>
));
SelectItem.displayName = "SelectItem";

const SelectValue = ({ placeholder, selectedValue, children, items }) => {
    if (children) {
        return children;
    }
    
    // 如果有选中的值，显示对应的文字
    if (selectedValue && items) {
        const selectedItem = items.find(item => item.value === selectedValue);
        if (selectedItem) {
            return <span className="text-gray-900">{selectedItem.label}</span>;
        }
    }
    
    return <span className="text-gray-500">{placeholder}</span>;
};

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };