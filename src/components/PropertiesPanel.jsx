import React, { useState, useEffect } from 'react'
import { HexColorPicker } from 'react-colorful'

const PropertiesPanel = ({ selectedElement, onUpdateElement }) => {
    const [showColorPicker, setShowColorPicker] = useState(false)

    // 设置全局点击监听
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (showColorPicker && !e.target.closest('.color-picker-popup') && !e.target.closest('.color-preview')) {
                setShowColorPicker(false)
            }
        }

        document.addEventListener('click', handleClickOutside)
        return () => {
            document.removeEventListener('click', handleClickOutside)
        }
    }, [showColorPicker])

    if (!selectedElement) {
        return (
            <div className="properties-panel">
                <h3 style={{ marginBottom: '16px', color: '#666' }}>属性设置</h3>
                <p style={{ color: '#999', textAlign: 'center', marginTop: '40px' }}>
                    请选择一个元素来编辑其属性
                </p>
            </div>
        )
    }

    return (
        <div className="properties-panel">
            <h3 style={{ marginBottom: '16px' }}>属性设置</h3>

            {/* 基础属性 */}
            <div className="form-group">
                <label className="form-label">位置</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                        <label style={{ fontSize: '12px', color: '#666' }}>X</label>
                        <input
                            type="number"
                            className="input"
                            value={Math.round(selectedElement.x)}
                            onChange={(e) => onUpdateElement(selectedElement.id, { x: parseInt(e.target.value) || 0 })}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', color: '#666' }}>Y</label>
                        <input
                            type="number"
                            className="input"
                            value={Math.round(selectedElement.y)}
                            onChange={(e) => onUpdateElement(selectedElement.id, { y: parseInt(e.target.value) || 0 })}
                        />
                    </div>
                </div>
                {/* 快捷居中操作 */}
                <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                    <button
                        className="btn"
                        style={{ fontSize: '11px', padding: '4px 6px', flex: 1 }}
                        onClick={() => onUpdateElement(selectedElement.id, {
                            x: 180 - selectedElement.width / 2,
                            y: selectedElement.y
                        })}
                        title="水平居中"
                    >
                        水平居中
                    </button>
                    <button
                        className="btn"
                        style={{ fontSize: '11px', padding: '4px 6px', flex: 1 }}
                        onClick={() => onUpdateElement(selectedElement.id, {
                            x: selectedElement.x,
                            y: 320 - selectedElement.height / 2
                        })}
                        title="垂直居中"
                    >
                        垂直居中
                    </button>
                    <button
                        className="btn"
                        style={{ fontSize: '11px', padding: '4px 6px', flex: 1 }}
                        onClick={() => onUpdateElement(selectedElement.id, {
                            x: 180 - selectedElement.width / 2,
                            y: 320 - selectedElement.height / 2
                        })}
                        title="完全居中"
                    >
                        完全居中
                    </button>
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">尺寸</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                        <label style={{ fontSize: '12px', color: '#666' }}>宽度</label>
                        <input
                            type="number"
                            className="input"
                            value={Math.round(selectedElement.width)}
                            onChange={(e) => onUpdateElement(selectedElement.id, { width: parseInt(e.target.value) || 1 })}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', color: '#666' }}>高度</label>
                        <input
                            type="number"
                            className="input"
                            value={Math.round(selectedElement.height)}
                            onChange={(e) => onUpdateElement(selectedElement.id, { height: parseInt(e.target.value) || 1 })}
                        />
                    </div>
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">旋转角度</label>
                <input
                    type="range"
                    min="0"
                    max="360"
                    value={selectedElement.rotation || 0}
                    onChange={(e) => onUpdateElement(selectedElement.id, { rotation: parseInt(e.target.value) })}
                    style={{ width: '100%' }}
                />
                <div style={{ textAlign: 'center', fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    {Math.round(selectedElement.rotation || 0)}°
                </div>
            </div>

            {/* 文本特有属性 */}
            {selectedElement.type === 'text' && (
                <>
                    <div className="form-group">
                        <label className="form-label">文本内容</label>
                        <textarea
                            className="input"
                            value={selectedElement.content}
                            onChange={(e) => onUpdateElement(selectedElement.id, { content: e.target.value })}
                            rows={3}
                            style={{ resize: 'vertical' }}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">文字颜色</label>
                        <div style={{ position: 'relative' }}>
                            <div
                                className="color-preview"
                                style={{
                                    backgroundColor: selectedElement.color || '#000000',
                                    width: '100%'
                                }}
                                onClick={() => setShowColorPicker(!showColorPicker)}
                            />

                            {showColorPicker && (
                                <div className="color-picker-popup">
                                    <HexColorPicker
                                        color={selectedElement.color || '#000000'}
                                        onChange={(color) => onUpdateElement(selectedElement.id, { color })}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">字体大小</label>
                        <input
                            type="range"
                            min="8"
                            max="72"
                            value={selectedElement.fontSize || 16}
                            onChange={(e) => onUpdateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })}
                            style={{ width: '100%' }}
                        />
                        <div style={{ textAlign: 'center', fontSize: '12px', color: '#666', marginTop: '4px' }}>
                            {selectedElement.fontSize || 16}px
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">字体</label>
                        <select
                            className="input"
                            value={selectedElement.fontFamily || 'Arial'}
                            onChange={(e) => onUpdateElement(selectedElement.id, { fontFamily: e.target.value })}
                        >
                            <option value="Arial">Arial</option>
                            <option value="Helvetica">Helvetica</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Courier New">Courier New</option>
                            <option value="Verdana">Verdana</option>
                            <option value="Georgia">Georgia</option>
                            <option value="PingFang SC">苹方</option>
                            <option value="Microsoft YaHei">微软雅黑</option>
                            <option value="SimHei">黑体</option>
                            <option value="SimSun">宋体</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">字体粗细</label>
                        <select
                            className="input"
                            value={selectedElement.fontWeight || 'normal'}
                            onChange={(e) => onUpdateElement(selectedElement.id, { fontWeight: e.target.value })}
                        >
                            <option value="normal">正常</option>
                            <option value="bold">粗体</option>
                            <option value="lighter">细体</option>
                            <option value="bolder">特粗</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">文本对齐</label>
                        <select
                            className="input"
                            value={selectedElement.textAlign || 'left'}
                            onChange={(e) => onUpdateElement(selectedElement.id, { textAlign: e.target.value })}
                        >
                            <option value="left">左对齐</option>
                            <option value="center">居中</option>
                            <option value="right">右对齐</option>
                            <option value="justify">两端对齐</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">行高</label>
                        <input
                            type="range"
                            min="0.8"
                            max="3"
                            step="0.1"
                            value={selectedElement.lineHeight || 1.5}
                            onChange={(e) => onUpdateElement(selectedElement.id, { lineHeight: parseFloat(e.target.value) })}
                            style={{ width: '100%' }}
                        />
                        <div style={{ textAlign: 'center', fontSize: '12px', color: '#666', marginTop: '4px' }}>
                            {selectedElement.lineHeight || 1.5}
                        </div>
                    </div>
                </>
            )}

            {/* 图片特有属性 */}
            {selectedElement.type === 'image' && (
                <div className="form-group">
                    <label className="form-label">透明度</label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={selectedElement.opacity || 1}
                        onChange={(e) => onUpdateElement(selectedElement.id, { opacity: parseFloat(e.target.value) })}
                        style={{ width: '100%' }}
                    />
                    <div style={{ textAlign: 'center', fontSize: '12px', color: '#666', marginTop: '4px' }}>
                        {Math.round((selectedElement.opacity || 1) * 100)}%
                    </div>
                </div>
            )}

        </div>
    )
}

export default PropertiesPanel