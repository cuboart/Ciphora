import * as React from "react";

// 简单的工具函数来合并CSS类名
const cn = (...classes) => classes.filter(Boolean).join(' ');

// 简单的点击外部hook
const useOnClickOutside = (ref, handler) => {
    React.useEffect(() => {
        const listener = (event) => {
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }
            handler(event);
        };
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);
        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
};

export function ExpandableTabs({
    tabs,
    className,
    activeColor = "text-blue-600",
    onChange,
}) {
    const [selected, setSelected] = React.useState(null);
    const outsideClickRef = React.useRef(null);

    useOnClickOutside(outsideClickRef, () => {
        setSelected(null);
        onChange?.(null);
    });

    const handleSelect = (index) => {
        setSelected(index);
        onChange?.(index);
    };

    const Separator = () => (
        <div className="mx-1 h-[24px] w-[1.2px] bg-gray-300" aria-hidden="true" />
    );

    return (
        <div
            ref={outsideClickRef}
            className={cn(
                "flex flex-wrap items-center gap-2 rounded-2xl border border-gray-200 bg-white p-1 shadow-sm",
                className
            )}
        >
            {tabs.map((tab, index) => {
                if (tab.type === "separator") {
                    return <Separator key={`separator-${index}`} />;
                }

                const Icon = tab.icon;
                const isSelected = selected === index;

                return (
                    <button
                        key={tab.title}
                        onClick={() => handleSelect(index)}
                        className={cn(
                            "relative flex items-center rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300",
                            isSelected
                                ? cn("bg-blue-50", activeColor)
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                    >
                        <Icon className="w-5 h-5" />
                        <span
                            className={cn(
                                "ml-2 overflow-hidden transition-all duration-300",
                                isSelected ? "w-auto opacity-100" : "w-0 opacity-0"
                            )}
                        >
                            {tab.title}
                        </span>
                    </button>
                );
            })}
        </div>
    );
} 