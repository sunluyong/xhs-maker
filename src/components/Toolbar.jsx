import React, { useState, useRef, useEffect } from 'react'
import { Type, Image, Palette, Download, Upload, Clipboard } from 'lucide-react'
import { HexColorPicker } from 'react-colorful'
import html2canvas from 'html2canvas'
import GradientPicker from './GradientPicker'
import CanvasConfig from './CanvasConfig'
import ExportOptions from './ExportOptions'
import { handleClipboardImage } from '../utils/clipboard'

const Toolbar = ({
    onAddText,
    onAddImage,
    canvasBackground,
    onBackgroundChange,
    canvasRef,
    canvasSize,
    onCanvasSizeChange
}) => {
    const [showColorPicker, setShowColorPicker] = useState(false)
    const [showBackgroundOptions, setShowBackgroundOptions] = useState(false)
    const [showGradientPicker, setShowGradientPicker] = useState(false)
    const fileInputRef = useRef(null)
    const backgroundImageRef = useRef(null)

    // 处理图片上传
    const handleImageUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
                onAddImage(event.target.result)
            }
            reader.readAsDataURL(file)
        }
    }

    // 处理剪切板图片粘贴（用于添加图片）
    const handleClipboardImagePaste = async () => {
        try {
            await handleClipboardImage((imageUrl) => {
                onAddImage(imageUrl)
            })
        } catch (error) {
            alert('剪切板中没有图片内容或浏览器不支持此功能')
        }
    }



    // 处理渐变色设置
    const handleGradientChange = (gradient) => {
        onBackgroundChange({
            type: 'gradient',
            colors: gradient.colors,
            direction: gradient.direction
        })
    }

    // 设置全局点击监听
    useEffect(() => {
        const handleClickOutside = (e) => {
            // 关闭背景设置弹窗
            if (showBackgroundOptions && !e.target.closest('.color-picker-popup') && !e.target.closest('[title="背景设置"]')) {
                setShowBackgroundOptions(false)
                setShowColorPicker(false)
                setShowGradientPicker(false)
            }
        }

        document.addEventListener('click', handleClickOutside)
        return () => {
            document.removeEventListener('click', handleClickOutside)
        }
    }, [showBackgroundOptions])

    // 处理背景图片上传
    const handleBackgroundImageUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
                onBackgroundChange({
                    type: 'image',
                    value: event.target.result,
                    size: 'cover',
                    position: 'center',
                    repeat: 'no-repeat'
                })
                setShowBackgroundOptions(false)
            }
            reader.readAsDataURL(file)
        }
    }

    // 处理剪切板背景图片粘贴
    const handleClipboardBackgroundPaste = async () => {
        try {
            await handleClipboardImage((imageUrl) => {
                onBackgroundChange({
                    type: 'image',
                    value: imageUrl,
                    size: 'cover',
                    position: 'center',
                    repeat: 'no-repeat'
                })
                setShowBackgroundOptions(false)
            })
        } catch (error) {
            alert('剪切板中没有图片内容或浏览器不支持此功能')
        }
    }

    return (
        <div className="toolbar">
            {/* 页面标题 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <h1 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    margin: 0,
                    color: '#333',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>📱 图文设计器</h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '20px' }}>
                {/* 配置区域 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '12px', borderRight: '1px solid #ddd' }}>
                    {/* 背景设置 */}
                    <div style={{ position: 'relative' }}>
                        <button
                            className="btn"
                            onClick={() => setShowBackgroundOptions(!showBackgroundOptions)}
                            title="背景设置"
                        >
                            <Palette size={16} />
                            背景设置
                        </button>

                        {showBackgroundOptions && (
                            <div
                                className="color-picker-popup"
                                style={{ width: '280px', top: '45px', maxHeight: '500px', overflowY: 'auto' }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* 背景类型选择 */}
                                <div className="form-group">
                                    <label className="form-label">背景类型</label>
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                                        <button
                                            className={`btn ${canvasBackground.type === 'color' ? 'btn-secondary' : ''}`}
                                            style={{ fontSize: '12px', padding: '4px 8px', flex: 1 }}
                                            onClick={() => {
                                                onBackgroundChange({ type: 'color', value: '#ffffff' })
                                                setShowColorPicker(false)
                                                setShowGradientPicker(false)
                                            }}
                                        >
                                            纯色
                                        </button>
                                        <button
                                            className={`btn ${canvasBackground.type === 'gradient' ? 'btn-secondary' : ''}`}
                                            style={{ fontSize: '12px', padding: '4px 8px', flex: 1 }}
                                            onClick={() => {
                                                if (canvasBackground.type !== 'gradient') {
                                                    onBackgroundChange({
                                                        type: 'gradient',
                                                        colors: ['#ff7b7b', '#ff4757'],
                                                        direction: '135deg'
                                                    })
                                                }
                                                setShowColorPicker(false)
                                                setShowGradientPicker(true)
                                            }}
                                        >
                                            渐变
                                        </button>
                                    </div>
                                </div>

                                {/* 纯色设置 */}
                                {canvasBackground.type === 'color' && (
                                    <div className="form-group">
                                        <label className="form-label">背景颜色</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div
                                                className="color-preview"
                                                style={{
                                                    backgroundColor: canvasBackground.value
                                                }}
                                                onClick={() => setShowColorPicker(!showColorPicker)}
                                            />
                                        </div>

                                        {showColorPicker && (
                                            <div style={{ marginTop: '10px' }}>
                                                <HexColorPicker
                                                    color={canvasBackground.value}
                                                    onChange={(color) => onBackgroundChange({ type: 'color', value: color })}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* 渐变色设置 */}
                                {canvasBackground.type === 'gradient' && showGradientPicker && (
                                    <div className="form-group">
                                        <label className="form-label">渐变色设置</label>
                                        <GradientPicker
                                            gradient={{
                                                colors: canvasBackground.colors || ['#ff7b7b', '#ff4757'],
                                                direction: canvasBackground.direction || '135deg'
                                            }}
                                            onChange={handleGradientChange}
                                        />
                                    </div>
                                )}

                                <div className="form-group">
                                    <label className="form-label">背景图片</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            className="btn"
                                            style={{ flex: 1, fontSize: '12px' }}
                                            onClick={() => backgroundImageRef.current?.click()}
                                        >
                                            <Upload size={14} />
                                            上传图片
                                        </button>
                                        <button
                                            className="btn"
                                            style={{ flex: 1, fontSize: '12px' }}
                                            onClick={handleClipboardBackgroundPaste}
                                            title="从剪切板粘贴背景图片"
                                        >
                                            <Clipboard size={14} />
                                            粘贴
                                        </button>
                                    </div>
                                    <input
                                        ref={backgroundImageRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleBackgroundImageUpload}
                                        className="file-input"
                                    />
                                </div>

                                {/* 背景图片配置 */}
                                {canvasBackground.type === 'image' && (
                                    <>
                                        <div className="form-group">
                                            <label className="form-label">图片尺寸</label>
                                            <select
                                                className="input"
                                                value={canvasBackground.size || 'cover'}
                                                onChange={(e) => onBackgroundChange({
                                                    ...canvasBackground,
                                                    size: e.target.value
                                                })}
                                                style={{ fontSize: '12px' }}
                                            >
                                                <option value="cover">填充整个区域</option>
                                                <option value="contain">完整显示</option>
                                                <option value="auto">原始尺寸</option>
                                                <option value="100% 100%">拉伸填充</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">图片位置</label>
                                            <select
                                                className="input"
                                                value={canvasBackground.position || 'center'}
                                                onChange={(e) => onBackgroundChange({
                                                    ...canvasBackground,
                                                    position: e.target.value
                                                })}
                                                style={{ fontSize: '12px' }}
                                            >
                                                <option value="center">居中</option>
                                                <option value="top">顶部</option>
                                                <option value="bottom">底部</option>
                                                <option value="left">左侧</option>
                                                <option value="right">右侧</option>
                                                <option value="top left">左上</option>
                                                <option value="top right">右上</option>
                                                <option value="bottom left">左下</option>
                                                <option value="bottom right">右下</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">图片重复</label>
                                            <select
                                                className="input"
                                                value={canvasBackground.repeat || 'no-repeat'}
                                                onChange={(e) => onBackgroundChange({
                                                    ...canvasBackground,
                                                    repeat: e.target.value
                                                })}
                                                style={{ fontSize: '12px' }}
                                            >
                                                <option value="no-repeat">不重复</option>
                                                <option value="repeat">全部重复</option>
                                                <option value="repeat-x">水平重复</option>
                                                <option value="repeat-y">垂直重复</option>
                                            </select>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 画布配置 */}
                    <CanvasConfig
                        canvasSize={canvasSize}
                        onCanvasSizeChange={onCanvasSizeChange}
                    />
                </div>

                {/* 操作区域 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* 添加文本 */}
                    <button
                        className="btn"
                        onClick={onAddText}
                        title="添加文本"
                    >
                        <Type size={16} />
                        添加文本
                    </button>

                    {/* 添加图片 */}
                    <button
                        className="btn"
                        onClick={() => fileInputRef.current?.click()}
                        title="上传图片"
                    >
                        <Image size={16} />
                        上传图片
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="file-input"
                    />

                    {/* 剪切板图片 */}
                    <button
                        className="btn"
                        onClick={handleClipboardImagePaste}
                        title="从剪切板粘贴图片 (Ctrl+V)"
                    >
                        <Clipboard size={16} />
                        粘贴图片
                    </button>
                </div>
            </div>

            <div style={{ marginLeft: 'auto' }}>
                {/* 导出选项 */}
                <ExportOptions canvasRef={canvasRef} />
            </div>
        </div>
    )
}

export default Toolbar