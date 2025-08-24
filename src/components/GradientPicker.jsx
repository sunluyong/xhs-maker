import React, { useState, useEffect } from 'react'
import { HexColorPicker } from 'react-colorful'
import { Plus, Trash2 } from 'lucide-react'

const GradientPicker = ({ gradient, onChange }) => {
    const [selectedColorIndex, setSelectedColorIndex] = useState(0)
    const [showColorPicker, setShowColorPicker] = useState(false)

    // 设置全局点击监听
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (showColorPicker && !e.target.closest('.react-colorful') && !e.target.closest('.color-edit-square')) {
                setShowColorPicker(false)
            }
        }

        document.addEventListener('click', handleClickOutside)
        return () => {
            document.removeEventListener('click', handleClickOutside)
        }
    }, [showColorPicker])

    // 预设渐变色方案
    const presetGradients = [
        { colors: ['#ff7b7b', '#ff4757'], direction: '135deg', name: '红色渐变' },
        { colors: ['#70a1ff', '#3742fa'], direction: '135deg', name: '蓝色渐变' },
        { colors: ['#7bed9f', '#2ed573'], direction: '135deg', name: '绿色渐变' },
        { colors: ['#ffa502', '#ff6348'], direction: '135deg', name: '橙色渐变' },
        { colors: ['#ff6b9d', '#c44569'], direction: '135deg', name: '粉色渐变' },
        { colors: ['#a55eea', '#8854d0'], direction: '135deg', name: '紫色渐变' },
        { colors: ['#26d0ce', '#1dd1a1'], direction: '135deg', name: '青色渐变' },
        { colors: ['#feca57', '#ff9ff3'], direction: '135deg', name: '彩虹渐变' },
        { colors: ['#667eea', '#764ba2'], direction: '135deg', name: '夜空渐变' },
        { colors: ['#f093fb', '#f5576c'], direction: '135deg', name: '日落渐变' },
        { colors: ['#4facfe', '#00f2fe'], direction: '135deg', name: '海洋渐变' },
        { colors: ['#43e97b', '#38f9d7'], direction: '135deg', name: '春天渐变' }
    ]

    // 方向选项
    const directions = [
        { value: '0deg', name: '向上' },
        { value: '45deg', name: '右上' },
        { value: '90deg', name: '向右' },
        { value: '135deg', name: '右下' },
        { value: '180deg', name: '向下' },
        { value: '225deg', name: '左下' },
        { value: '270deg', name: '向左' },
        { value: '315deg', name: '左上' }
    ]

    // 添加颜色
    const addColor = () => {
        const newColors = [...gradient.colors, '#ffffff']
        onChange({
            ...gradient,
            colors: newColors
        })
        setSelectedColorIndex(newColors.length - 1)
    }

    // 删除颜色
    const removeColor = (index) => {
        if (gradient.colors.length <= 2) return // 至少保留两个颜色

        const newColors = gradient.colors.filter((_, i) => i !== index)
        onChange({
            ...gradient,
            colors: newColors
        })

        if (selectedColorIndex >= newColors.length) {
            setSelectedColorIndex(newColors.length - 1)
        }
    }

    // 更新颜色
    const updateColor = (color) => {
        const newColors = [...gradient.colors]
        newColors[selectedColorIndex] = color
        onChange({
            ...gradient,
            colors: newColors
        })
    }

    // 更新方向
    const updateDirection = (direction) => {
        onChange({
            ...gradient,
            direction
        })
    }

    // 应用预设渐变
    const applyPreset = (preset) => {
        onChange({
            colors: [...preset.colors],
            direction: preset.direction
        })
        setSelectedColorIndex(0)
    }

    return (
        <div style={{ padding: '10px' }}>
            {/* 渐变预览 */}
            <div className="form-group">
                <label className="form-label">渐变预览</label>
                <div
                    style={{
                        width: '100%',
                        height: '40px',
                        borderRadius: '6px',
                        border: '1px solid #ddd',
                        background: `linear-gradient(${gradient.direction}, ${gradient.colors.join(', ')})`
                    }}
                />
            </div>

            {/* 预设渐变 */}
            <div className="form-group">
                <label className="form-label">预设渐变</label>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '8px'
                }}>
                    {presetGradients.map((preset, index) => (
                        <div
                            key={index}
                            style={{
                                width: '100%',
                                height: '32px',
                                borderRadius: '6px',
                                border: '1px solid #ddd',
                                cursor: 'pointer',
                                background: `linear-gradient(${preset.direction}, ${preset.colors.join(', ')})`,
                                transition: 'transform 0.2s'
                            }}
                            onClick={() => applyPreset(preset)}
                            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                            title={preset.name}
                        />
                    ))}
                </div>
            </div>

            {/* 渐变方向 */}
            <div className="form-group">
                <label className="form-label">渐变方向</label>
                <select
                    className="input"
                    value={gradient.direction}
                    onChange={(e) => updateDirection(e.target.value)}
                >
                    {directions.map(dir => (
                        <option key={dir.value} value={dir.value}>{dir.name}</option>
                    ))}
                </select>
            </div>

            {/* 颜色编辑 */}
            <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>颜色编辑</label>
                    <button
                        className="btn"
                        style={{
                            fontSize: '12px',
                            padding: '4px 8px',
                            minWidth: 'auto',
                            height: '28px'
                        }}
                        onClick={addColor}
                        disabled={gradient.colors.length >= 5}
                        title="添加颜色"
                    >
                        <Plus size={12} />
                        添加
                    </button>
                </div>

                {/* 颜色列表 */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                    {gradient.colors.map((color, index) => (
                        <div key={index} style={{ position: 'relative' }}>
                            <div
                                className="color-edit-square"
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    backgroundColor: color,
                                    border: selectedColorIndex === index ? '3px solid #ff4757' : '2px solid #ddd',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease'
                                }}
                                onClick={() => {
                                    setSelectedColorIndex(index)
                                    setShowColorPicker(true)
                                }}
                                onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                            />
                            {gradient.colors.length > 2 && (
                                <button
                                    style={{
                                        position: 'absolute',
                                        top: '-8px',
                                        right: '-8px',
                                        width: '18px',
                                        height: '18px',
                                        border: 'none',
                                        borderRadius: '50%',
                                        background: '#ff4757',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '10px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}
                                    onClick={() => removeColor(index)}
                                    title="删除颜色"
                                >
                                    <Trash2 size={10} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* 颜色选择器 */}
                {showColorPicker && (
                    <div style={{ marginTop: '10px' }}>
                        <HexColorPicker
                            color={gradient.colors[selectedColorIndex]}
                            onChange={updateColor}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

export default GradientPicker