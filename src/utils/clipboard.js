// 剪切板工具函数
export const handleClipboardImage = (callback) => {
    return new Promise((resolve, reject) => {
        // 检查浏览器是否支持剪切板 API
        if (!navigator.clipboard || !navigator.clipboard.read) {
            reject(new Error('浏览器不支持剪切板API'))
            return
        }

        navigator.clipboard.read().then(clipboardItems => {
            for (const item of clipboardItems) {
                // 查找图片类型
                for (const type of item.types) {
                    if (type.startsWith('image/')) {
                        item.getType(type).then(blob => {
                            const reader = new FileReader()
                            reader.onload = (e) => {
                                const imageUrl = e.target.result
                                callback(imageUrl)
                                resolve(imageUrl)
                            }
                            reader.onerror = reject
                            reader.readAsDataURL(blob)
                        }).catch(reject)
                        return
                    }
                }
            }
            reject(new Error('剪切板中没有图片内容'))
        }).catch(reject)
    })
}

// 传统的粘贴事件处理（作为备用方案）
export const handlePasteEvent = (event, callback) => {
    const items = event.clipboardData?.items
    if (!items) return false

    for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.type.startsWith('image/')) {
            const blob = item.getAsFile()
            if (blob) {
                const reader = new FileReader()
                reader.onload = (e) => {
                    callback(e.target.result)
                }
                reader.readAsDataURL(blob)
                return true
            }
        }
    }
    return false
}

// 处理键盘快捷键粘贴
export const setupGlobalPasteHandler = (callback) => {
    const handleKeyDown = (event) => {
        // Ctrl+V 或 Cmd+V
        if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
            event.preventDefault()
            handleClipboardImage(callback).catch(error => {
                console.log('剪切板粘贴失败:', error.message)
            })
        }
    }

    const handlePaste = (event) => {
        handlePasteEvent(event, callback)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('paste', handlePaste)

    // 返回清理函数
    return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.removeEventListener('paste', handlePaste)
    }
}