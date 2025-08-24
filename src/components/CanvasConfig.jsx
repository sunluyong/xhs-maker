import React, { useState, useEffect } from 'react'
import { Settings } from 'lucide-react'

const CanvasConfig = ({ canvasSize, onCanvasSizeChange }) => {
    const [showConfig, setShowConfig] = useState(false)
    const [customWidth, setCustomWidth] = useState(canvasSize.width)
    const [customHeight, setCustomHeight] = useState(canvasSize.height)

    // 快速比例选择
    const quickRatios = [
        { name: '9:16', ratio: 9 / 16, width: 360, height: 640, desc: '竖屏' },
        { name: '1:1', ratio: 1, width: 400, height: 400, desc: '方形' },
        { name: '16:9', ratio: 16 / 9, width: 640, height: 360, desc: '横屏' },
        { name: '3:4', ratio: 3 / 4, width: 450, height: 600, desc: '竖向' },
        { name: '4:3', ratio: 4 / 3, width: 600, height: 450, desc: '横向' }
    ]

    // 应用快速比例
    const applyQuickRatio = (ratio) => {
        onCanvasSizeChange({
            name: `自定义 ${ratio.name}`,
            width: ratio.width,
            height: ratio.height,
            ratio: ratio.name,
            description: `${ratio.name} ${ratio.desc}`
        })
        setCustomWidth(ratio.width)
        setCustomHeight(ratio.height)
        setShowConfig(false)
    }

    // 预设尺寸配置 - 针对移动端优化
    const presets = [
        { name: '小红书标准', width: 360, height: 640, description: '9:16 手机端', ratio: '9:16' },
        { name: '方形图片', width: 400, height: 400, description: '1:1 方形', ratio: '1:1' },
        { name: '横向视频', width: 640, height: 360, description: '16:9 横向', ratio: '16:9' },
        { name: '竖向海报', width: 450, height: 600, description: '3:4 竖向', ratio: '3:4' },
        { name: '横向海报', width: 600, height: 450, description: '4:3 横向', ratio: '4:3' },
        { name: 'Instagram故事', width: 360, height: 640, description: '9:16 故事', ratio: '9:16' },
        { name: 'Instagram帖子', width: 400, height: 400, description: '1:1 帖子', ratio: '1:1' },
        { name: '微信朋友圈', width: 400, height: 400, description: '1:1 朋友圈', ratio: '1:1' }
    ]

    // 应用预设尺寸
    const applyPreset = (preset) => {
        onCanvasSizeChange(preset)
        setCustomWidth(preset.width)
        setCustomHeight(preset.height)
        setShowConfig(false)
    }

    // 设置全局点击监听
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (showConfig && !e.target.closest('.color-picker-popup') && !e.target.closest('[title="画布配置"]')) {
                setShowConfig(false)
            }
        }

        document.addEventListener('click', handleClickOutside)
        return () => {
            document.removeEventListener('click', handleClickOutside)
        }
    }, [showConfig])
    const applyCustomSize = () => {
        if (customWidth > 0 && customHeight > 0) {
            const customSize = {
                name: '自定义',
                width: customWidth,
                height: customHeight,
                ratio: `${customWidth}:${customHeight}`,
                description: `${customWidth} × ${customHeight}`
            }
            onCanvasSizeChange(customSize)
            setShowConfig(false)
        }
    }

    return (
        <div style={{ position: 'relative' }}>
            <button
                className="btn"
                onClick={() => setShowConfig(!showConfig)}
                title="画布配置"
            >
                <Settings size={16} />
                画布配置
            </button>

            {showConfig && (
                <div
                    className="color-picker-popup"
                    style={{
                        width: '300px',
                        top: '35px',
                        right: '0',
                        left: 'auto',
                        maxHeight: '500px',
                        overflowY: 'auto'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="form-group">
                        <label className="form-label">当前画布</label>
                        <div style={{
                            padding: '8px 12px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '6px',
                            fontSize: '12px',
                            color: '#666'
                        }}>
                            {canvasSize.name || '自定义'} - {canvasSize.width} × {canvasSize.height}
                            {canvasSize.ratio && (
                                <span style={{ marginLeft: '8px', opacity: 0.7 }}>
                                    ({canvasSize.ratio})
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">快速比例</label>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {quickRatios.map((ratio, index) => (
                                <button
                                    key={index}
                                    className="btn"
                                    style={{
                                        fontSize: '11px',
                                        padding: '6px 12px',
                                        minWidth: 'auto',
                                        height: '32px',
                                        flex: '1',
                                        backgroundColor: canvasSize.ratio === ratio.name ? '#3742fa' : '#ff4757'
                                    }}
                                    onClick={() => applyQuickRatio(ratio)}
                                    title={`${ratio.name} ${ratio.desc} - ${ratio.width}×${ratio.height}`}
                                >
                                    {ratio.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">预设尺寸</label>
                        <div style={{ display: 'grid', gap: '6px' }}>
                            {presets.map((preset, index) => (
                                <button
                                    key={index}
                                    className="btn"
                                    style={{
                                        fontSize: '12px',
                                        padding: '8px 12px',
                                        textAlign: 'left',
                                        justifyContent: 'flex-start',
                                        width: '100%',
                                        height: 'auto',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}
                                    onClick={() => applyPreset(preset)}
                                    title={`${preset.width} × ${preset.height} - ${preset.description}`}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                        <span style={{ fontWeight: '500' }}>{preset.name}</span>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '10px', opacity: 0.8 }}>
                                            <span>{preset.ratio}</span>
                                            <span>{preset.width}×{preset.height}</span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">自定义尺寸</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                            <div>
                                <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '4px' }}>宽度</label>
                                <input
                                    type="number"
                                    className="input"
                                    value={customWidth}
                                    onChange={(e) => setCustomWidth(parseInt(e.target.value) || 0)}
                                    min="200"
                                    max="800"
                                    style={{ fontSize: '12px', padding: '6px 8px' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '4px' }}>高度</label>
                                <input
                                    type="number"
                                    className="input"
                                    value={customHeight}
                                    onChange={(e) => setCustomHeight(parseInt(e.target.value) || 0)}
                                    min="200"
                                    max="800"
                                    style={{ fontSize: '12px', padding: '6px 8px' }}
                                />
                            </div>
                        </div>
                        <button
                            className="btn"
                            onClick={applyCustomSize}
                            disabled={!customWidth || !customHeight || customWidth <= 0 || customHeight <= 0}
                            style={{ width: '100%', fontSize: '12px' }}
                        >
                            应用自定义尺寸
                        </button>
                        {customWidth > 0 && customHeight > 0 && (
                            <div style={{ fontSize: '11px', color: '#666', marginTop: '4px', textAlign: 'center' }}>
                                比例: {(customWidth / customHeight).toFixed(2)}:1
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default CanvasConfig