import React, { forwardRef, useRef, useCallback } from 'react'
import DraggableElement from './DraggableElement'

// 移动端友好的默认尺寸 (9:16 比例)
const DEFAULT_CANVAS_WIDTH = 360
const DEFAULT_CANVAS_HEIGHT = 640

const Canvas = forwardRef(({
    elements,
    selectedElement,
    onSelectElement,
    onUpdateElement,
    onDeleteElement,
    onDuplicateElement,
    onCommitTempState, // 新增：提交临时状态的回调
    background,
    canvasSize = { width: DEFAULT_CANVAS_WIDTH, height: DEFAULT_CANVAS_HEIGHT } // 新增：画布尺寸
}, ref) => {
    const canvasRef = useRef(null)

    // 处理画布点击事件
    const handleCanvasClick = useCallback((e) => {
        if (e.target === canvasRef.current) {
            onSelectElement(null)
        }
    }, [onSelectElement])

    // 处理键盘事件
    const handleKeyDown = useCallback((e) => {
        if (!selectedElement) return

        switch (e.key) {
            case 'Delete':
            case 'Backspace':
                onDeleteElement(selectedElement)
                break
            case 'Escape':
                onSelectElement(null)
                break
            default:
                break
        }
    }, [selectedElement, onDeleteElement, onSelectElement])

    // 获取背景样式
    const getBackgroundStyle = () => {
        if (background.type === 'color') {
            return { backgroundColor: background.value }
        } else if (background.type === 'gradient') {
            return {
                background: `linear-gradient(${background.direction || '0deg'}, ${background.colors.join(', ')})`
            }
        } else if (background.type === 'image') {
            return {
                backgroundImage: `url(${background.value})`,
                backgroundSize: background.size || 'cover',
                backgroundPosition: background.position || 'center',
                backgroundRepeat: background.repeat || 'no-repeat'
            }
        }
        return { backgroundColor: '#ffffff' }
    }

    React.useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            handleKeyDown(e)
        }

        window.addEventListener('keydown', handleGlobalKeyDown)
        return () => {
            window.removeEventListener('keydown', handleGlobalKeyDown)
        }
    }, [handleKeyDown])

    // 将ref传递给canvas元素
    React.useImperativeHandle(ref, () => canvasRef.current)

    return (
        <div
            ref={canvasRef}
            className="canvas"
            style={{
                width: canvasSize.width,
                height: canvasSize.height,
                ...getBackgroundStyle()
            }}
            onClick={handleCanvasClick}
            tabIndex={0}
        >
            {elements.map(element => (
                <DraggableElement
                    key={element.id}
                    element={element}
                    isSelected={selectedElement === element.id}
                    onSelect={() => onSelectElement(element.id)}
                    onUpdate={(updates, options) => onUpdateElement(element.id, updates, options)}
                    onDelete={() => onDeleteElement(element.id)}
                    onDuplicate={() => onDuplicateElement(element.id)}
                    onCommitTempState={onCommitTempState}
                    canvasWidth={canvasSize.width}
                    canvasHeight={canvasSize.height}
                />
            ))}
        </div>
    )
})

Canvas.displayName = 'Canvas'

export default Canvas