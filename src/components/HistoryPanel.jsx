import React from 'react'
import { RotateCcw, RotateCw, Clock, Type, Image, Palette, Move, Copy, Trash2 } from 'lucide-react'

const HistoryPanel = ({
    history,
    currentIndex,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
    onJumpToHistory
}) => {
    // 获取操作图标
    const getActionIcon = (action) => {
        if (action.includes('添加文本')) return <Type size={14} />
        if (action.includes('添加图片')) return <Image size={14} />
        if (action.includes('背景')) return <Palette size={14} />
        if (action.includes('移动')) return <Move size={14} />
        if (action.includes('旋转')) return <RotateCw size={14} />
        if (action.includes('复制')) return <Copy size={14} />
        if (action.includes('删除')) return <Trash2 size={14} />
        return <Clock size={14} />
    }

    // 格式化时间
    const formatTime = (timestamp) => {
        const now = new Date()
        const time = new Date(timestamp)
        const diff = now - time

        if (diff < 60000) { // 1分钟内
            return '刚刚'
        } else if (diff < 3600000) { // 1小时内
            return `${Math.floor(diff / 60000)}分钟前`
        } else {
            return time.toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit'
            })
        }
    }

    // 跳转到指定历史记录
    const handleHistoryClick = (index) => {
        if (index !== currentIndex && onJumpToHistory) {
            onJumpToHistory(index)
        }
    }

    return (
        <div className="history-panel">
            <div className="history-header">
                <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    margin: '0 0 16px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <Clock size={16} />
                    操作历史
                </h3>

                {/* 撤销重做按钮 */}
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '16px'
                }}>
                    <button
                        className={`btn ${!canUndo ? 'btn-disabled' : ''}`}
                        onClick={onUndo}
                        disabled={!canUndo}
                        style={{
                            fontSize: '12px',
                            padding: '6px 12px',
                            flex: 1
                        }}
                        title="撤销 (Ctrl+Z)"
                    >
                        <RotateCcw size={14} />
                        撤销
                    </button>
                    <button
                        className={`btn ${!canRedo ? 'btn-disabled' : ''}`}
                        onClick={onRedo}
                        disabled={!canRedo}
                        style={{
                            fontSize: '12px',
                            padding: '6px 12px',
                            flex: 1
                        }}
                        title="重做 (Ctrl+Y)"
                    >
                        <RotateCw size={14} />
                        重做
                    </button>
                </div>
            </div>

            {/* 历史记录列表 */}
            <div className="history-list">
                {history.slice().reverse().map((record, index) => {
                    const actualIndex = history.length - 1 - index
                    const isCurrent = actualIndex === currentIndex
                    const isFuture = actualIndex > currentIndex

                    return (
                        <div
                            key={record.id}
                            className={`history-item ${isCurrent ? 'current' : ''} ${isFuture ? 'future' : ''}`}
                            onClick={() => handleHistoryClick(actualIndex)}
                            style={{
                                padding: '6px 10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <div style={{ flexShrink: 0 }}>
                                {getActionIcon(record.action)}
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontSize: '13px',
                                    fontWeight: isCurrent ? '500' : '400',
                                    marginBottom: '2px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {record.action}
                                </div>
                                <div style={{
                                    fontSize: '11px',
                                    opacity: 0.8
                                }}>
                                    {formatTime(record.timestamp)}
                                </div>
                            </div>

                            {isCurrent && (
                                <div style={{
                                    fontSize: '10px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    padding: '2px 6px',
                                    borderRadius: '10px',
                                    flexShrink: 0
                                }}>
                                    当前
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* 统计信息 */}
            <div className="history-stats">
                共 {history.length} 个操作 · 当前第 {currentIndex + 1} 步
            </div>
        </div>
    )
}

export default HistoryPanel