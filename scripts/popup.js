// 获取URL中的文本参数
function getSelectedTextFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const text = urlParams.get('text') || '';
    return text.replace(/\\n/g, '\n');
}

// 初始化页面
document.addEventListener('DOMContentLoaded', () => {
    // 显示选中的文本
    const selectedText = getSelectedTextFromUrl();
    const textElement = document.getElementById('selected-text');
    textElement.textContent = selectedText;

    // 初始化所有功能
    initializeTextEditing();
    initializeBackgroundOptions();
    initializeSizeOptions();
    initializeExportButton();
});

// 初始化文字编辑功能
function initializeTextEditing() {
    // 字体选择
    const fontSelect = document.getElementById('font-family');
    fontSelect.addEventListener('change', () => {
        document.getElementById('selected-text').style.fontFamily = fontSelect.value;
    });

    // 字号选择
    const sizeSelect = document.getElementById('font-size');
    sizeSelect.addEventListener('change', () => {
        document.getElementById('selected-text').style.fontSize = `${sizeSelect.value}px`;
    });

    // 文字颜色
    const colorPicker = document.getElementById('font-color');
    colorPicker.addEventListener('input', () => {
        document.getElementById('selected-text').style.color = colorPicker.value;
    });

    // 粗体按钮
    const boldBtn = document.getElementById('bold-btn');
    boldBtn.addEventListener('click', () => {
        boldBtn.classList.toggle('active');
        document.getElementById('selected-text').style.fontWeight = 
            boldBtn.classList.contains('active') ? 'bold' : 'normal';
    });

    // 斜体按钮
    const italicBtn = document.getElementById('italic-btn');
    italicBtn.addEventListener('click', () => {
        italicBtn.classList.toggle('active');
        document.getElementById('selected-text').style.fontStyle = 
            italicBtn.classList.contains('active') ? 'italic' : 'normal';
    });

    // 下划线按钮
    const underlineBtn = document.getElementById('underline-btn');
    underlineBtn.addEventListener('click', () => {
        underlineBtn.classList.toggle('active');
        document.getElementById('selected-text').style.textDecoration = 
            underlineBtn.classList.contains('active') ? 'underline' : 'none';
    });

    // 对齐按钮
    const alignButtons = document.querySelectorAll('.align-btn');
    alignButtons.forEach(button => {
        button.addEventListener('click', () => {
            alignButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            document.getElementById('selected-text').style.textAlign = button.dataset.align;
        });
    });
}

// 初始化背景选项
function initializeBackgroundOptions() {
    const bgOptions = document.querySelectorAll('.bg-option');
    bgOptions.forEach(option => {
        option.addEventListener('click', () => {
            bgOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            applyBackground(option.dataset.bg);
        });
    });
}

// 初始化尺寸选项
function initializeSizeOptions() {
    const sizeButtons = document.querySelectorAll('.size-btn');
    sizeButtons.forEach(button => {
        button.addEventListener('click', () => {
            sizeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            document.querySelector('.preview-area').className = 
                `preview-area size-${button.dataset.size}`;
        });
    });
}

// 初始化导出按钮
function initializeExportButton() {
    const exportBtn = document.getElementById('export-btn');
    exportBtn.addEventListener('click', exportCard);
}

// 应用背景
function applyBackground(bg) {
    const preview = document.getElementById('card-preview');
    preview.className = 'gradient-bg';
    preview.classList.add(`bg-${bg}`);
}

// 导出卡片为图片
function exportCard() {
    const preview = document.getElementById('card-preview');
    const format = document.getElementById('export-format').value;
    
    try {
        // 创建Canvas元素
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 设置Canvas大小
        canvas.width = preview.offsetWidth * 2;
        canvas.height = preview.offsetHeight * 2;
        ctx.scale(2, 2);

        // 绘制背景
        const computedStyle = window.getComputedStyle(preview);
        const backgroundColor = computedStyle.backgroundColor;
        const backgroundImage = computedStyle.backgroundImage;
        
        if (backgroundImage !== 'none') {
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            const colors = backgroundImage.match(/#[a-fA-F0-9]{6}|rgba?\([^)]+\)/g);
            if (colors && colors.length >= 2) {
                gradient.addColorStop(0, colors[0]);
                gradient.addColorStop(1, colors[1]);
                ctx.fillStyle = gradient;
            } else {
                ctx.fillStyle = backgroundColor;
            }
        } else {
            ctx.fillStyle = backgroundColor;
        }
        
        ctx.fillRect(0, 0, preview.offsetWidth, preview.offsetHeight);

        // 获取文本元素的样式
        const textElement = document.getElementById('selected-text');
        const textStyle = window.getComputedStyle(textElement);
        
        // 设置文字样式
        ctx.font = `${textStyle.fontStyle} ${textStyle.fontWeight} ${textStyle.fontSize} ${textStyle.fontFamily}`;
        ctx.fillStyle = textStyle.color;
        ctx.textAlign = textStyle.textAlign;
        
        // 文字换行处理
        const lines = textElement.textContent.split('\n');
        let y = preview.offsetHeight / 2;
        const lineHeight = parseInt(textStyle.lineHeight);
        const maxWidth = preview.offsetWidth - 40;
        
        // 计算起始y坐标
        y = y - (lines.length * lineHeight / 2);
        
        // 绘制每一行文本
        for (let line of lines) {
            const words = line.split(' ');
            let currentLine = '';
            let lineArray = [];
            
            for (let word of words) {
                const testLine = currentLine + word + ' ';
                const metrics = ctx.measureText(testLine);
                if (metrics.width > maxWidth && currentLine !== '') {
                    lineArray.push(currentLine);
                    currentLine = word + ' ';
                } else {
                    currentLine = testLine;
                }
            }
            if (currentLine !== '') {
                lineArray.push(currentLine);
            }
            
            // 绘制当前段落的所有行
            for (let textLine of lineArray) {
                let x;
                switch(ctx.textAlign) {
                    case 'center':
                        x = preview.offsetWidth / 2;
                        break;
                    case 'right':
                        x = preview.offsetWidth - 20;
                        break;
                    default:
                        x = 20;
                }
                
                // 绘制文本装饰（下划线）
                if (textStyle.textDecoration === 'underline') {
                    const metrics = ctx.measureText(textLine.trim());
                    const lineY = y + 3; // 下划线位置稍微偏下
                    ctx.beginPath();
                    if (ctx.textAlign === 'center') {
                        ctx.moveTo(x - metrics.width / 2, lineY);
                        ctx.lineTo(x + metrics.width / 2, lineY);
                    } else if (ctx.textAlign === 'right') {
                        ctx.moveTo(x - metrics.width, lineY);
                        ctx.lineTo(x, lineY);
                    } else {
                        ctx.moveTo(x, lineY);
                        ctx.lineTo(x + metrics.width, lineY);
                    }
                    ctx.strokeStyle = textStyle.color;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
                
                ctx.fillText(textLine.trim(), x, y);
                y += lineHeight;
            }
            
            if (lineArray.length === 0) {
                y += lineHeight;
            }
        }

        // 导出图片
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            chrome.downloads.download({
                url: url,
                filename: `card.${format}`,
                saveAs: true
            }, () => {
                URL.revokeObjectURL(url);
            });
        }, `image/${format}`);
    } catch (error) {
        console.error('导出失败:', error);
        alert('导出失败，请重试。错误信息：' + error.message);
    }
}