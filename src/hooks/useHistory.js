import { useState, useCallback, useRef } from 'react'

const useHistory = (initialState = []) => {
    const [history, setHistory] = useState([
        {
            id: Date.now(),
            action: '初始化画布',
            timestamp: new Date(),
            state: {
                elements: initialState,
                background: { type: 'color', value: '#ffffff' }
            }
        }
    ])
    const [currentIndex, setCurrentIndex] = useState(0)
    const isUndoRedo = useRef(false)
    const debounceTimer = useRef(null)
    const lastAction = useRef(null)

    // 添加历史记录（带防抖）
    const addToHistory = useCallback((action, newState) => {
        if (isUndoRedo.current) {
            isUndoRedo.current = false
            return
        }

        // 对于拖拽、旋转、缩放操作，由commitTempState统一控制，不再使用防抖
        const isDragOrRotate = action.includes('移动') || action.includes('旋转') || action.includes('缩放')

        if (isDragOrRotate) {
            // 清除之前的定时器（如果有）
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current)
                debounceTimer.current = null
            }
            // 直接记录，不使用防抖
            addHistoryRecord(action, newState)
        } else {
            // 非拖拽操作直接记录
            addHistoryRecord(action, newState)
        }
    }, [currentIndex])

    // 实际添加历史记录的函数
    const addHistoryRecord = useCallback((action, newState) => {
        setHistory(prev => {
            // 如果当前不在最新位置，删除后面的历史记录
            const newHistory = prev.slice(0, currentIndex + 1)

            // 添加新的历史记录
            const newRecord = {
                id: Date.now(),
                action,
                timestamp: new Date(),
                state: JSON.parse(JSON.stringify(newState)) // 深拷贝状态
            }

            const updatedHistory = [...newHistory, newRecord]

            // 限制历史记录数量（最多50条）
            const maxHistory = 50
            if (updatedHistory.length > maxHistory) {
                updatedHistory.shift()
                setCurrentIndex(maxHistory - 1)
            } else {
                setCurrentIndex(updatedHistory.length - 1)
            }

            return updatedHistory
        })
    }, [currentIndex])

    // 撤销操作
    const undo = useCallback(() => {
        if (currentIndex > 0) {
            isUndoRedo.current = true
            setCurrentIndex(prev => prev - 1)
            return history[currentIndex - 1].state
        }
        return null
    }, [currentIndex, history])

    // 重做操作
    const redo = useCallback(() => {
        if (currentIndex < history.length - 1) {
            isUndoRedo.current = true
            setCurrentIndex(prev => prev + 1)
            return history[currentIndex + 1].state
        }
        return null
    }, [currentIndex, history])

    // 获取当前状态
    const getCurrentState = useCallback(() => {
        return history[currentIndex]?.state || null
    }, [history, currentIndex])

    // 检查是否可以撤销/重做
    const canUndo = currentIndex > 0
    const canRedo = currentIndex < history.length - 1

    return {
        history,
        currentIndex,
        addToHistory,
        undo,
        redo,
        getCurrentState,
        canUndo,
        canRedo
    }
}

export default useHistory