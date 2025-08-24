import React, { useState, useEffect } from 'react'
import { X, Clipboard, Keyboard } from 'lucide-react'

const ClipboardTip = () => {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // 检查是否已经显示过提示
        const hasSeenTip = localStorage.getItem('clipboardTipSeen')
        if (!hasSeenTip) {
            setIsVisible(true)
        }
    }, [])

    const handleClose = () => {
        setIsVisible(false)
        localStorage.setItem('clipboardTipSeen', 'true')
    }

    if (!isVisible) return null

    return (
        <div style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            width: '320px',
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1001,
            fontSize: '14px'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: '500',
                    color: '#333'
                }}>
                    <Clipboard size={16} />
                    剪切板功能提示
                </div>
                <button
                    onClick={handleClose}
                    style={{
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        color: '#666'
                    }}
                >
                    <X size={16} />
                </button>
            </div>

            <div style={{ color: '#666', lineHeight: '1.5', marginBottom: '12px' }}>
                现在支持剪切板图片功能！
            </div>

            <div style={{ fontSize: '13px', color: '#888' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <Keyboard size={14} />
                    <span><strong>Ctrl+V</strong> 或 <strong>Cmd+V</strong> 快速粘贴图片</span>
                </div>
                <div style={{ marginLeft: '20px', marginBottom: '4px' }}>• 自动添加为新的图片元素</div>
                <div style={{ marginLeft: '20px', marginBottom: '8px' }}>• 支持从QQ、微信、浏览器等复制图片</div>

                <div style={{ marginBottom: '6px' }}>
                    <strong>工具栏按钮：</strong>
                </div>
                <div style={{ marginLeft: '20px', marginBottom: '4px' }}>• "粘贴图片" - 添加图片元素</div>
                <div style={{ marginLeft: '20px' }}>• "背景设置" → "粘贴" - 设置背景图片</div>
            </div>

            <div style={{
                marginTop: '12px',
                padding: '8px',
                background: '#f8f9fa',
                borderRadius: '4px',
                fontSize: '12px',
                color: '#666'
            }}>
                💡 提示：某些浏览器可能需要先点击页面才能使用剪切板功能
            </div>
        </div>
    )
}

export default ClipboardTip