import React, { useState, useEffect } from 'react'
import { Download, Clipboard, Settings, FileImage } from 'lucide-react'
import html2canvas from 'html2canvas'

const ExportOptions = ({ canvasRef }) => {
    const [showOptions, setShowOptions] = useState(false)
    const [fileName, setFileName] = useState('小红书设计')
    const [quality, setQuality] = useState(2)
    const [format, setFormat] = useState('png')
    const [isExporting, setIsExporting] = useState(false)

    // 设置全局点击监听
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (showOptions && !e.target.closest('.color-picker-popup') && !e.target.closest('[title="导出选项"]')) {
                setShowOptions(false)
            }
        }

        document.addEventListener('click', handleClickOutside)
        return () => {
            document.removeEventListener('click', handleClickOutside)
        }
    }, [showOptions])
    const exportToClipboard = async () => {
        if (!canvasRef.current) return

        setIsExporting(true)
        try {
            const canvas = await html2canvas(canvasRef.current, {
                backgroundColor: null,
                scale: quality,
                useCORS: true,
                allowTaint: true
            })

            // 将canvas转换为blob
            canvas.toBlob(async (blob) => {
                try {
                    await navigator.clipboard.write([
                        new ClipboardItem({
                            [blob.type]: blob
                        })
                    ])
                    alert('图片已复制到剪切板！')
                } catch (error) {
                    console.error('复制到剪切板失败:', error)
                    // 降级方案：下载图片
                    const url = URL.createObjectURL(blob)
                    const link = document.createElement('a')
                    link.download = `${fileName}_${new Date().getTime()}.${format}`
                    link.href = url
                    link.click()
                    URL.revokeObjectURL(url)
                    alert('浏览器不支持复制到剪切板，已下载到本地')
                }
            }, `image/${format}`, format === 'jpeg' ? 0.9 : undefined)
        } catch (error) {
            console.error('导出失败:', error)
            alert('导出失败，请重试')
        } finally {
            setIsExporting(false)
        }
    }

    // 导出到本地文件
    const exportToFile = async () => {
        if (!canvasRef.current) return

        setIsExporting(true)
        try {
            const canvas = await html2canvas(canvasRef.current, {
                backgroundColor: null,
                scale: quality,
                useCORS: true,
                allowTaint: true
            })

            // 创建下载链接
            const dataUrl = canvas.toDataURL(`image/${format}`, format === 'jpeg' ? 0.9 : undefined)
            const link = document.createElement('a')
            link.download = `${fileName}_${new Date().getTime()}.${format}`
            link.href = dataUrl
            link.click()

            alert('图片导出成功！')
        } catch (error) {
            console.error('导出失败:', error)
            alert('导出失败，请重试')
        } finally {
            setIsExporting(false)
        }
    }

    // 导出到用户选择的目录（使用File System Access API）
    const exportToUserLocation = async () => {
        if (!canvasRef.current) return

        // 检查浏览器是否支持File System Access API
        if (!window.showSaveFilePicker) {
            // 降级到普通下载
            exportToFile()
            return
        }

        setIsExporting(true)
        try {
            const canvas = await html2canvas(canvasRef.current, {
                backgroundColor: null,
                scale: quality,
                useCORS: true,
                allowTaint: true
            })

            // 让用户选择保存位置
            const fileHandle = await window.showSaveFilePicker({
                suggestedName: `${fileName}_${new Date().getTime()}.${format}`,
                types: [
                    {
                        description: '图片文件',
                        accept: {
                            'image/png': ['.png'],
                            'image/jpeg': ['.jpg', '.jpeg'],
                            'image/webp': ['.webp']
                        }
                    }
                ]
            })

            // 创建可写流
            const writable = await fileHandle.createWritable()

            // 将canvas转换为blob并写入文件
            canvas.toBlob(async (blob) => {
                await writable.write(blob)
                await writable.close()
                alert('图片保存成功！')
            }, `image/${format}`, format === 'jpeg' ? 0.9 : undefined)
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('保存失败:', error)
                alert('保存失败，请重试')
            }
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <div style={{ position: 'relative' }}>
            <button
                className="btn btn-success"
                onClick={() => setShowOptions(!showOptions)}
                title="导出选项"
                disabled={isExporting}
            >
                {isExporting ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{
                            width: '12px',
                            height: '12px',
                            border: '2px solid #ffffff',
                            borderTop: '2px solid transparent',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }} />
                        导出中...
                    </div>
                ) : (
                    <>
                        <Download size={16} />
                        导出图片
                    </>
                )}
            </button>

            {showOptions && (
                <div
                    className="color-picker-popup"
                    style={{
                        width: '280px',
                        top: '45px',
                        right: '0',
                        left: 'auto',
                        maxHeight: 'none',
                        height: 'auto'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="form-group">
                        <label className="form-label">文件名</label>
                        <input
                            type="text"
                            className="input"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            placeholder="输入文件名"
                            style={{ fontSize: '12px' }}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">图片格式</label>
                        <select
                            className="input"
                            value={format}
                            onChange={(e) => setFormat(e.target.value)}
                            style={{ fontSize: '12px' }}
                        >
                            <option value="png">PNG (透明背景)</option>
                            <option value="jpeg">JPEG (较小文件)</option>
                            <option value="webp">WebP (现代格式)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">导出质量</label>
                        <select
                            className="input"
                            value={quality}
                            onChange={(e) => setQuality(parseInt(e.target.value))}
                            style={{ fontSize: '12px' }}
                        >
                            <option value={1}>标准 (1x)</option>
                            <option value={2}>高清 (2x)</option>
                            <option value={3}>超清 (3x)</option>
                        </select>
                        <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                            质量越高，文件越大，导出时间越长
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">导出方式</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <button
                                className="btn"
                                onClick={exportToClipboard}
                                disabled={isExporting}
                                style={{ fontSize: '12px', justifyContent: 'flex-start' }}
                            >
                                <Clipboard size={14} />
                                复制到剪切板
                            </button>

                            <button
                                className="btn"
                                onClick={exportToFile}
                                disabled={isExporting}
                                style={{ fontSize: '12px', justifyContent: 'flex-start' }}
                            >
                                <Download size={14} />
                                下载到默认位置
                            </button>

                            <button
                                className="btn"
                                onClick={exportToUserLocation}
                                disabled={isExporting}
                                style={{ fontSize: '12px', justifyContent: 'flex-start' }}
                            >
                                <FileImage size={14} />
                                保存到指定位置
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    )
}

export default ExportOptions