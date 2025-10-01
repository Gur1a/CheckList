import React, { useState, useRef, useEffect } from "react";
import "./separator.scss";

interface ResizableContainerProps {
    children: React.ReactNode[];
    orientation?: "horizontal" | "vertical";
    minSize?: number;
    defaultSizes?: number[];
    onResize?: (sizes: number[]) => void;
    storageKey?: string; // 用于在localStorage中标识不同实例的key
}

const ResizableContainer: React.FC<ResizableContainerProps> = ({
    children,
    orientation = "horizontal",
    minSize = 200,
    defaultSizes,
    onResize,
    storageKey,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isResizing, setIsResizing] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [sizes, setSizes] = useState<number[]>([]);
    const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

    // 从localStorage读取保存的尺寸
    const getStoredSizes = (): number[] | null => {
        if (!storageKey) return null;
        try {
            const stored = localStorage.getItem(`resizable-container-${storageKey}`);
            if (stored) {
                const parsed = JSON.parse(stored);
                // 验证读取的数据是否有效且与子元素数量匹配
                if (Array.isArray(parsed) && parsed.length === children.length) {
                    return parsed;
                }
            }
        } catch (error) {
            console.error('Failed to load stored sizes:', error);
        }
        return null;
    };

    // 保存尺寸到localStorage
    const saveSizesToStorage = (newSizes: number[]) => {
        if (!storageKey) return;
        try {
            localStorage.setItem(`resizable-container-${storageKey}`, JSON.stringify(newSizes));
        } catch (error) {
            console.error('Failed to save sizes to storage:', error);
        }
    };

    // 初始化尺寸
    useEffect(() => {
        if (containerRef.current && children.length > 0) {
            // 1. 优先从localStorage读取保存的尺寸
            const storedSizes = getStoredSizes();
            if (storedSizes) {
                setSizes(storedSizes);
                return;
            }

            const containerSize = 
                orientation === "horizontal"
                    ? containerRef.current.offsetWidth
                    : containerRef.current.offsetHeight;

            // 2. 使用默认尺寸或均分尺寸
            let initialSizes: number[] = [];
            if (defaultSizes && defaultSizes.length === children.length) {
                initialSizes = defaultSizes;
            } else {
                const equalSize = containerSize / children.length;
                initialSizes = Array(children.length).fill(equalSize);
            }

            setSizes(initialSizes);
        }
    }, [children, orientation, defaultSizes, storageKey]);

    // 处理分割线按下事件
    const handleSeparatorDown = (
        index: number,
        e: React.MouseEvent | React.TouchEvent
    ) => {
        e.preventDefault();
        setIsResizing(true);
        setActiveIndex(index);
    };

    // 处理鼠标/触摸移动事件
    useEffect(() => {
        if (!isResizing || activeIndex === -1 || !containerRef.current) return;

        const getClientPos = (e: MouseEvent | TouchEvent): number => {
            if ("touches" in e) {
                return orientation === "horizontal"
                    ? e.touches[0].clientX
                    : e.touches[0].clientY;
            }
            return orientation === "horizontal" ? e.clientX : e.clientY;
        };

        const handleMove = (e: MouseEvent | TouchEvent) => {
            e.preventDefault();

            const containerRect = containerRef.current!.getBoundingClientRect();
            const clientPos = getClientPos(e);
            const containerPos =
                orientation === "horizontal"
                    ? containerRect.left
                    : containerRect.top;
            const containerSize =
                orientation === "horizontal"
                    ? containerRect.width
                    : containerRect.height;

            // 计算当前拖动位置相对于容器的比例
            let newSizes = [...sizes];
            let totalSize = sizes.reduce((a, b) => a + b, 0);



            // 计算拖动位置的绝对像素值
            const absolutePos = clientPos - containerPos;
            // 计算左侧/上侧所有面板的当前总宽度/高度
            let leftTotal = 0;
            for (let i = 0; i <= activeIndex; i++) {
                leftTotal += sizes[i];
            }
            console.log("DEBUG:", clientPos)
            // 计算新的大小变化量
            const delta = (absolutePos / containerSize) * totalSize - leftTotal;

            // 确保面板不小于最小尺寸
            if (
                newSizes[activeIndex] + delta >= minSize &&
                newSizes[activeIndex + 1] - delta >= minSize
            ) {
                newSizes[activeIndex] += delta;
                newSizes[activeIndex + 1] -= delta;
                setSizes(newSizes);
                // 保存尺寸到localStorage
                saveSizesToStorage(newSizes);
                onResize?.(newSizes);
            }
        };

        const handleUp = () => {
            setIsResizing(false);
            setActiveIndex(-1);
        };

        // 添加事件监听器
        document.addEventListener("mousemove", handleMove as EventListener);
        document.addEventListener("touchmove", handleMove as EventListener, {
            passive: false,
        });
        document.addEventListener("mouseup", handleUp);
        document.addEventListener("touchend", handleUp);

        return () => {
            // 清理事件监听器
            document.removeEventListener(
                "mousemove",
                handleMove as EventListener
            );
            document.removeEventListener(
                "touchmove",
                handleMove as EventListener
            );
            document.removeEventListener("mouseup", handleUp);
            document.removeEventListener("touchend", handleUp);
        };
    }, [isResizing, activeIndex, sizes, orientation, minSize, onResize]);

    return (
        <div
            className={`resizable-container resizable-${orientation}`}
            ref={containerRef}
        >
            {children.map((child, index) => (
                <React.Fragment key={index}>
                    {/* 内容面板 */}
                    <div
                        className="resizable-content"
                        ref={(el) => (contentRefs.current[index] = el)}
                        style={{
                            [orientation === "horizontal"
                                ? "width"
                                : "height"]: `${sizes[index] || 0}px`,
                            minWidth:
                                orientation === "horizontal"
                                    ? `${minSize}px`
                                    : undefined,
                            minHeight:
                                orientation === "vertical"
                                    ? `${minSize}px`
                                    : undefined,
                            flexShrink: 0,
                        }}
                    >
                        {child}
                    </div>

                    {/* 分割线 */}
                    {index < children.length - 1 && (
                        <div
                            className={`resizable-separator resizable-separator-${orientation} ${
                                isResizing && activeIndex === index
                                    ? "active"
                                    : ""
                            }`}
                            onMouseDown={(e) => handleSeparatorDown(index, e)}
                            onTouchStart={(e) => handleSeparatorDown(index, e)}
                            style={{
                                cursor: isResizing
                                    ? orientation === "horizontal"
                                        ? "col-resize"
                                        : "row-resize"
                                    : orientation === "horizontal"
                                    ? "col-resize"
                                    : "row-resize",
                            }}
                        />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

export default ResizableContainer;
