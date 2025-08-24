import React, { useState, useRef, useCallback, useEffect } from 'react'
import { RotateCw, Copy, Trash2 } from 'lucide-react'

const DraggableElement = ({
    element,
    isSelected,
    onSelect,
    onUpdate,
    onDelete,
    onDuplicate,
    onCommitTempState, // 新增：提交临时状态的回调
    canvasWidth,
    canvasHeight
}) => {
    const [isEditing, setIsEditing] = useState(false)
    const [editText, setEditText] = useState(element.content || '')
    const [isResizing, setIsResizing] = useState(false)
    const [isRotating, setIsRotating] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
    const elementRef = useRef(null)
    const textareaRef = useRef(null)

    // 处理拖拽开始
    const handleMouseDown = useCallback((e) => {
        if (isEditing || isResizing || isRotating) return
        if (e.target.closest('.element-controls') || e.target.closest('.resize-handle') || e.target.closest('.rotate-handle')) return

        e.preventDefault()
        setIsDragging(true)

        const rect = elementRef.current.getBoundingClientRect()
        const canvasRect = elementRef.current.parentElement.getBoundingClientRect()

        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        })

        onSelect()
    }, [isEditing, isResizing, isRotating, onSelect])

    // 处理拖拽移动
    useEffect(() => {
        if (!isDragging) return

        let lastPosition = { x: element.x, y: element.y }

        const handleMouseMove = (e) => {
            const canvasRect = elementRef.current.parentElement.getBoundingClientRect()

            const newX = e.clientX - canvasRect.left - dragOffset.x
            const newY = e.clientY - canvasRect.top - dragOffset.y

            const boundedX = Math.max(0, Math.min(newX, canvasWidth - element.width))
            const boundedY = Math.max(0, Math.min(newY, canvasHeight - element.height))

            lastPosition = { x: boundedX, y: boundedY }

            // 拖拽过程中使用静默更新，不记录历史
            onUpdate({
                x: boundedX,
                y: boundedY
            }, { silent: true, skipHistory: true })
        }

        const handleMouseUp = () => {
            setIsDragging(false)

            // 二次确认最终位置，确保状态同步
            const finalX = lastPosition.x
            const finalY = lastPosition.y

            // 立即应用最终位置到临时状态
            onUpdate({
                x: finalX,
                y: finalY
            }, { silent: true, skipHistory: true })

            // 立即提交历史记录，不需要延迟
            if (onCommitTempState) {
                onCommitTempState(`移动${element.type === 'text' ? '文本' : '图片'}`)
            }
        }

        document.addEventListener('mousemove', handleMouseMove, { passive: false })
        document.addEventListener('mouseup', handleMouseUp)

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDragging, dragOffset, element.width, element.height, element.type, element.x, element.y, canvasWidth, canvasHeight, onUpdate, onCommitTempState])

    // 处理双击编辑文本
    const handleDoubleClick = useCallback(() => {
        if (element.type === 'text') {
            setIsEditing(true)
            setEditText(element.content)
        }
    }, [element.type, element.content])

    // 完成文本编辑
    const finishEditing = useCallback(() => {
        if (isEditing) {
            onUpdate({ content: editText })
            setIsEditing(false)
        }
    }, [isEditing, editText, onUpdate])

    // 处理文本编辑的键盘事件
    const handleTextKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            finishEditing()
        } else if (e.key === 'Escape') {
            setIsEditing(false)
            setEditText(element.content)
        }
    }, [finishEditing, element.content])

    // 处理缩放
    const handleResizeStart = useCallback((e) => {
        e.stopPropagation()
        setIsResizing(true)

        const startX = e.clientX
        const startY = e.clientY
        const startWidth = element.width
        const startHeight = element.height
        let lastSize = { width: startWidth, height: startHeight }

        const handleMouseMove = (e) => {
            const deltaX = e.clientX - startX
            const deltaY = e.clientY - startY

            const newWidth = Math.max(20, Math.min(startWidth + deltaX, canvasWidth - element.x))
            const newHeight = Math.max(20, Math.min(startHeight + deltaY, canvasHeight - element.y))

            lastSize = { width: newWidth, height: newHeight }

            // 缩放过程中使用静默更新
            onUpdate({
                width: newWidth,
                height: newHeight
            }, { silent: true, skipHistory: true })
        }

        const handleMouseUp = () => {
            setIsResizing(false)
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)

            // 二次确认最终尺寸
            const finalWidth = lastSize.width
            const finalHeight = lastSize.height

            // 确保最终尺寸应用到临时状态
            onUpdate({
                width: finalWidth,
                height: finalHeight
            }, { silent: true, skipHistory: true })

            // 缩放结束时立即提交历史记录
            if (onCommitTempState) {
                onCommitTempState(`缩放${element.type === 'text' ? '文本' : '图片'}`)
            }
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
    }, [element.width, element.height, element.x, element.y, element.type, canvasWidth, canvasHeight, onUpdate, onCommitTempState])

    // 处理旋转
    const handleRotateStart = useCallback((e) => {
        e.stopPropagation()
        setIsRotating(true)

        const rect = elementRef.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2

        const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX)
        const startRotation = element.rotation || 0
        let lastRotation = startRotation

        const handleMouseMove = (e) => {
            const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX)
            const deltaAngle = (currentAngle - startAngle) * (180 / Math.PI)
            const newRotation = (startRotation + deltaAngle) % 360

            lastRotation = newRotation

            // 旋转过程中使用静默更新
            onUpdate({ rotation: newRotation }, { silent: true, skipHistory: true })
        }

        const handleMouseUp = () => {
            setIsRotating(false)
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)

            // 二次确认最终旋转角度
            const finalRotation = lastRotation

            // 确保最终旋转角度应用到临时状态
            onUpdate({ rotation: finalRotation }, { silent: true, skipHistory: true })

            // 旋转结束时立即提交历史记录
            if (onCommitTempState) {
                onCommitTempState(`旋转${element.type === 'text' ? '文本' : '图片'}`)
            }
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
    }, [element.rotation, element.type, onUpdate, onCommitTempState])

    // 自动聚焦到文本编辑区域
    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus()
            textareaRef.current.select()
        }
    }, [isEditing])

    // 渲染文本元素
    const renderTextElement = () => (
        <>
            {isEditing ? (
                <textarea
                    ref={textareaRef}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={finishEditing}
                    onKeyDown={handleTextKeyDown}
                    style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        outline: 'none',
                        resize: 'none',
                        background: 'transparent',
                        fontSize: element.fontSize || 16,
                        fontFamily: element.fontFamily || 'Arial',
                        fontWeight: element.fontWeight || 'normal',
                        color: element.color || '#000000',
                        textAlign: element.textAlign || 'left',
                        lineHeight: element.lineHeight || 1.5,
                        padding: '4px'
                    }}
                />
            ) : (
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        fontSize: element.fontSize || 16,
                        fontFamily: element.fontFamily || 'Arial',
                        fontWeight: element.fontWeight || 'normal',
                        color: element.color || '#000000',
                        textAlign: element.textAlign || 'left',
                        lineHeight: element.lineHeight || 1.5,
                        padding: '4px',
                        wordWrap: 'break-word',
                        overflow: 'hidden'
                    }}
                >
                    {element.content}
                </div>
            )}
        </>
    )

    // 渲染图片元素
    const renderImageElement = () => (
        <img
            src={element.src}
            alt="设计元素"
            style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: element.opacity || 1
            }}
            draggable={false}
        />
    )

    return (
        <div
            ref={elementRef}
            className={`draggable-element ${isSelected ? 'selected' : ''}`}
            style={{
                position: 'absolute',
                left: element.x,
                top: element.y,
                width: element.width,
                height: element.height,
                transform: `rotate(${element.rotation || 0}deg)`,
                zIndex: isSelected ? 1000 : 1,
                cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onMouseDown={handleMouseDown}
            onClick={(e) => {
                e.stopPropagation()
                onSelect()
            }}
            onDoubleClick={handleDoubleClick}
        >
            {element.type === 'text' ? renderTextElement() : renderImageElement()}

            {isSelected && !isEditing && (
                <>
                    {/* 控制按钮 */}
                    <div className="element-controls">
                        <button
                            className="control-btn"
                            onClick={(e) => {
                                e.stopPropagation()
                                onDuplicate()
                            }}
                            title="复制"
                        >
                            <Copy size={12} />
                        </button>
                        <button
                            className="control-btn"
                            onClick={(e) => {
                                e.stopPropagation()
                                onDelete()
                            }}
                            title="删除"
                        >
                            <Trash2 size={12} />
                        </button>
                    </div>

                    {/* 缩放手柄 */}
                    <div
                        className="resize-handle bottom-right"
                        onMouseDown={handleResizeStart}
                    />

                    {/* 旋转手柄 */}
                    <div
                        className="rotate-handle"
                        onMouseDown={handleRotateStart}
                        title="拖拽旋转"
                    >
                        <RotateCw size={10} />
                    </div>
                </>
            )}
        </div>
    )
}

export default DraggableElement