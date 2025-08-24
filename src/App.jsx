import React, { useState, useRef, useCallback, useEffect } from 'react'
import Canvas from './components/Canvas'
import Toolbar from './components/Toolbar'
import PropertiesPanel from './components/PropertiesPanel'
import HistoryPanel from './components/HistoryPanel'
import ClipboardTip from './components/ClipboardTip'
import { v4 as uuidv4 } from 'uuid'
import { setupGlobalPasteHandler } from './utils/clipboard'
import useHistory from './hooks/useHistory'

function App() {
  const [selectedElement, setSelectedElement] = useState(null)
  const canvasRef = useRef(null)
  const [tempElements, setTempElements] = useState(null) // 临时状态，用于拖拽过程
  const [tempBackground, setTempBackground] = useState(null) // 临时背景状态
  const [canvasSize, setCanvasSize] = useState({
    width: 360,
    height: 640,
    name: '小红书标准',
    ratio: '9:16'
  })

  // 生成随机渐变背景的函数
  const generateRandomGradient = useCallback(() => {
    // 预设的美观颜色组合
    const gradientPresets = [
      { colors: ['#ff7b7b', '#ff4757'], direction: '135deg' }, // 红色渐变
      { colors: ['#70a1ff', '#3742fa'], direction: '135deg' }, // 蓝色渐变  
      { colors: ['#7bed9f', '#2ed573'], direction: '135deg' }, // 绿色渐变
      { colors: ['#ffa502', '#ff6348'], direction: '135deg' }, // 橙色渐变
      { colors: ['#ff6b9d', '#c44569'], direction: '135deg' }, // 粉色渐变
      { colors: ['#a55eea', '#8854d0'], direction: '135deg' }, // 紫色渐变
      { colors: ['#26d0ce', '#1dd1a1'], direction: '135deg' }, // 青色渐变
      { colors: ['#feca57', '#ff9ff3'], direction: '135deg' }, // 彩虹渐变
      { colors: ['#667eea', '#764ba2'], direction: '135deg' }, // 夜空渐变
      { colors: ['#f093fb', '#f5576c'], direction: '135deg' }, // 日落渐变
      { colors: ['#4facfe', '#00f2fe'], direction: '135deg' }, // 海洋渐变
      { colors: ['#43e97b', '#38f9d7'], direction: '135deg' }, // 春天渐变
      { colors: ['#fa709a', '#fee140'], direction: '135deg' }, // 暖夏渐变
      { colors: ['#a8edea', '#fed6e3'], direction: '135deg' }, // 柔和渐变
      { colors: ['#ff9a9e', '#fecfef'], direction: '135deg' }  // 梦幻渐变
    ]

    // 随机选择一个渐变
    const randomIndex = Math.floor(Math.random() * gradientPresets.length)
    return {
      type: 'gradient',
      ...gradientPresets[randomIndex]
    }
  }, [])

  // 使用历史记录系统
  const {
    history,
    currentIndex,
    addToHistory,
    undo,
    redo,
    getCurrentState,
    canUndo,
    canRedo
  } = useHistory([])

  // 从历史记录中获取当前状态
  const currentState = getCurrentState()
  // 使用临时状态（如果存在）或历史状态
  const elements = tempElements !== null ? tempElements : (currentState?.elements || [])
  const canvasBackground = tempBackground !== null ? tempBackground : (currentState?.background || generateRandomGradient())

  // 更新状态并添加历史记录
  const updateStateWithHistory = useCallback((newElements, newBackground, action) => {
    const newState = {
      elements: newElements || elements,
      background: newBackground || canvasBackground
    }
    addToHistory(action, newState)
    // 清空临时状态
    setTempElements(null)
    setTempBackground(null)
  }, [elements, canvasBackground, addToHistory])

  // 更新背景
  const setCanvasBackground = useCallback((newBackground) => {
    let action = '更改背景'
    if (newBackground.type === 'color') {
      action = `设置背景颜色: ${newBackground.value}`
    } else if (newBackground.type === 'gradient') {
      action = `设置渐变背景`
    } else if (newBackground.type === 'image') {
      action = `设置背景图片`
    }
    updateStateWithHistory(elements, newBackground, action)
  }, [elements, updateStateWithHistory])

  // 添加文本元素
  const addTextElement = useCallback(() => {
    const newElement = {
      id: uuidv4(),
      type: 'text',
      content: '双击编辑文本',
      x: 100,
      y: 100,
      width: 200,
      height: 50,
      rotation: 0,
      fontSize: 16,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      color: '#000000',
      textAlign: 'left',
      lineHeight: 1.5
    }
    const newElements = [...elements, newElement]
    updateStateWithHistory(newElements, canvasBackground, '添加文本元素')
    setSelectedElement(newElement.id)
  }, [elements, canvasBackground, updateStateWithHistory])

  // 添加图片元素
  const addImageElement = useCallback((imageUrl) => {
    const newElement = {
      id: uuidv4(),
      type: 'image',
      src: imageUrl,
      x: 100,
      y: 100,
      width: 200,
      height: 200,
      rotation: 0,
      opacity: 1
    }
    const newElements = [...elements, newElement]
    updateStateWithHistory(newElements, canvasBackground, '添加图片元素')
    setSelectedElement(newElement.id)
  }, [elements, canvasBackground, updateStateWithHistory])

  // 更新元素属性
  const updateElement = useCallback((id, updates, options = {}) => {
    const { silent = false, skipHistory = false } = options
    const element = elements.find(el => el.id === id)
    if (!element) return

    const newElements = elements.map(el =>
      el.id === id ? { ...el, ...updates } : el
    )

    if (silent || skipHistory) {
      // 静默更新，不记录历史（用于拖拽过程中）
      setTempElements(newElements)
    } else {
      // 生成操作描述
      let action = `更新${element.type === 'text' ? '文本' : '图片'}元素`
      if (updates.x !== undefined || updates.y !== undefined) {
        action = `移动${element.type === 'text' ? '文本' : '图片'}`
      } else if (updates.width !== undefined || updates.height !== undefined) {
        action = `缩放${element.type === 'text' ? '文本' : '图片'}`
      } else if (updates.rotation !== undefined) {
        action = `旋转${element.type === 'text' ? '文本' : '图片'}`
      } else if (updates.content !== undefined) {
        action = '编辑文本内容'
      } else if (updates.fontSize !== undefined || updates.fontFamily !== undefined) {
        action = '修改文本样式'
      } else if (updates.color !== undefined) {
        action = '修改文本颜色'
      }

      updateStateWithHistory(newElements, canvasBackground, action)
    }
  }, [elements, canvasBackground, updateStateWithHistory])

  // 提交临时状态到历史记录
  const commitTempState = useCallback((action) => {
    if (tempElements !== null) {
      // 直接使用tempElements作为新状态，避免回弹
      const newState = {
        elements: tempElements,
        background: canvasBackground
      }
      // 直接使用 addToHistory，避免 updateStateWithHistory 的状态清空
      addToHistory(action, newState)
      // 使用一帧时间延迟清空，确保 DOM 已更新
      requestAnimationFrame(() => {
        setTempElements(null)
        setTempBackground(null)
      })
    }
  }, [tempElements, canvasBackground, addToHistory])

  // 删除元素
  const deleteElement = useCallback((id) => {
    const element = elements.find(el => el.id === id)
    if (!element) return

    const newElements = elements.filter(el => el.id !== id)
    updateStateWithHistory(newElements, canvasBackground, `删除${element.type === 'text' ? '文本' : '图片'}元素`)

    if (selectedElement === id) {
      setSelectedElement(null)
    }
  }, [elements, canvasBackground, updateStateWithHistory, selectedElement])

  // 复制元素
  const duplicateElement = useCallback((id) => {
    const element = elements.find(el => el.id === id)
    if (element) {
      const newElement = {
        ...element,
        id: uuidv4(),
        x: element.x + 20,
        y: element.y + 20
      }
      const newElements = [...elements, newElement]
      updateStateWithHistory(newElements, canvasBackground, `复制${element.type === 'text' ? '文本' : '图片'}元素`)
      setSelectedElement(newElement.id)
    }
  }, [elements, canvasBackground, updateStateWithHistory])

  // 获取选中的元素
  const getSelectedElement = useCallback(() => {
    return elements.find(el => el.id === selectedElement)
  }, [elements, selectedElement])

  // 处理画布尺寸变化
  const handleCanvasSizeChange = useCallback((newSize) => {
    setCanvasSize(newSize)
    // 清空选中状态，避免元素超出画布边界
    setSelectedElement(null)
  }, [])

  // 撤销操作
  const handleUndo = useCallback(() => {
    const previousState = undo()
    if (previousState) {
      setSelectedElement(null)
      setTempElements(null)
      setTempBackground(null)
    }
  }, [undo])

  // 重做操作
  const handleRedo = useCallback(() => {
    const nextState = redo()
    if (nextState) {
      setSelectedElement(null)
      setTempElements(null)
      setTempBackground(null)
    }
  }, [redo])

  // 跳转到指定历史记录
  const handleJumpToHistory = useCallback((index) => {
    const targetState = history[index]?.state
    if (targetState) {
      // 直接更新当前索引
      history.splice(0, history.length, ...history) // 触发重新渲染
      setSelectedElement(null)
    }
  }, [history])

  // 初始化随机渐变背景
  useEffect(() => {
    // 等待历史记录系统完全初始化后再检查和设置背景
    const initializeBackground = () => {
      console.log('检查初始化背景, 历史记录数:', history.length)
      // 检查历史记录是否存在且只有一条初始记录
      if (history.length === 1) {
        const currentState = getCurrentState()
        console.log('当前状态背景:', currentState?.background)
        if (currentState && currentState.background &&
          currentState.background.type === 'color' &&
          currentState.background.value === '#ffffff') {
          const randomGradient = generateRandomGradient()
          console.log('设置随机渐变背景:', randomGradient)
          // 直接更新当前历史记录的背景，而不是添加新记录
          setCanvasBackground(randomGradient)
        }
      }
    }

    // 使用 setTimeout 确保历史记录系统完全准备好
    const timer = setTimeout(initializeBackground, 100)
    return () => clearTimeout(timer)
  }, [history.length, getCurrentState, generateRandomGradient, setCanvasBackground])

  // 设置全局剪切板监听
  useEffect(() => {
    const cleanup = setupGlobalPasteHandler((imageUrl) => {
      // 如果没有选中元素，则添加为新的图片元素
      addImageElement(imageUrl)
    })

    return cleanup
  }, [addImageElement])

  // 设置全局键盘快捷键监听
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 撤销: Ctrl+Z 或 Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
      }
      // 重做: Ctrl+Y 或 Cmd+Y 或 Ctrl+Shift+Z
      else if (
        ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')
      ) {
        e.preventDefault()
        handleRedo()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleUndo, handleRedo])

  return (
    <div className="app">
      <Toolbar
        onAddText={addTextElement}
        onAddImage={addImageElement}
        canvasBackground={canvasBackground}
        onBackgroundChange={setCanvasBackground}
        canvasRef={canvasRef}
        canvasSize={canvasSize}
        onCanvasSizeChange={handleCanvasSizeChange}
      />

      <div className="workspace">
        {/* 历史记录面板 */}
        <HistoryPanel
          history={history}
          currentIndex={currentIndex}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          onJumpToHistory={handleJumpToHistory}
        />

        <div className="canvas-container">
          <Canvas
            ref={canvasRef}
            elements={elements}
            selectedElement={selectedElement}
            onSelectElement={setSelectedElement}
            onUpdateElement={updateElement}
            onDeleteElement={deleteElement}
            onDuplicateElement={duplicateElement}
            onCommitTempState={commitTempState}
            background={canvasBackground}
            canvasSize={canvasSize}
          />
        </div>

        <PropertiesPanel
          selectedElement={getSelectedElement()}
          onUpdateElement={updateElement}
        />
      </div>

      <ClipboardTip />
    </div>
  )
}

export default App