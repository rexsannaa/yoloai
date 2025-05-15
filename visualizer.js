// visualizer.js
// EasyYOLO 視覺化模組 - 精簡整合版

class YOLOVisualizer {
    constructor(config = {}) {
        // 初始化配置
        this.config = {
            canvasId: config.canvasId || 'visualizerCanvas',
            chartCanvasId: config.chartCanvasId || 'chartCanvas',
            width: config.width || 800,
            height: config.height || 400,
            // 繁體中文字體設定
            fontFamily: '"Microsoft JhengHei", "微軟正黑體", "PingFang TC", "蘋方-繁", sans-serif',
            fontSize: 14,
            colors: {
                primary: '#667eea',
                secondary: '#764ba2',
                success: '#00ff00',
                warning: '#ffa500',
                danger: '#ff0000',
                info: '#00bfff',
                text: '#333333',
                background: '#ffffff',
                grid: '#e0e0e0'
            },
            ...config
        };
        
        // 初始化畫布
        this.canvas = null;
        this.ctx = null;
        this.chartCanvas = null;
        this.chartCtx = null;
        
        // 動畫相關
        this.animationId = null;
        this.isAnimating = false;
        
        // 訓練數據
        this.trainingData = {
            epochs: [],
            loss: [],
            accuracy: [],
            currentEpoch: 0,
            totalEpochs: 20
        };
        
        this.init();
    }
    
    init() {
        // 初始化主視覺化畫布
        this.canvas = document.getElementById(this.config.canvasId);
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.canvas.width = this.config.width;
            this.canvas.height = this.config.height;
            
            // 設定繁體中文字體
            this.ctx.font = `${this.config.fontSize}px ${this.config.fontFamily}`;
        }
        
        // 初始化圖表畫布
        this.chartCanvas = document.getElementById(this.config.chartCanvasId);
        if (this.chartCanvas) {
            this.chartCtx = this.chartCanvas.getContext('2d');
            this.chartCanvas.width = 400;
            this.chartCanvas.height = 300;
        }
        
        console.log('視覺化模組初始化完成');
    }
    
    // 繪製神經網路架構
    drawNeuralNetwork(progress = 0) {
        if (!this.ctx) return;
        
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 繪製背景漸層
        const gradient = ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, 'rgba(102, 126, 234, 0.02)');
        gradient.addColorStop(1, 'rgba(118, 75, 162, 0.02)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 設定標題 - 確保繁體中文正確顯示
        ctx.save();
        ctx.font = `bold 24px ${this.config.fontFamily}`;
        ctx.fillStyle = this.config.colors.text;
        ctx.textAlign = 'center';
        ctx.fillText('YOLO 神經網路架構視覺化', this.canvas.width / 2, 35);
        ctx.restore();
        
        // 網路層配置
        const layers = [
            { name: '輸入層', nodes: 3, color: this.config.colors.primary },
            { name: '卷積層 1', nodes: 5, color: this.config.colors.info },
            { name: '卷積層 2', nodes: 7, color: this.config.colors.info },
            { name: '全連接層', nodes: 5, color: this.config.colors.warning },
            { name: '輸出層', nodes: 3, color: this.config.colors.success }
        ];
        
        const layerWidth = 150;
        const startX = 50;
        const centerY = this.canvas.height / 2;
        
        // 繪製每一層
        layers.forEach((layer, layerIndex) => {
            const x = startX + layerIndex * layerWidth;
            const nodeSpacing = 40;
            const startY = centerY - (layer.nodes * nodeSpacing) / 2;
            
            // 繪製節點
            for (let i = 0; i < layer.nodes; i++) {
                const y = startY + i * nodeSpacing;
                
                // 節點動畫效果
                const nodeProgress = Math.min(1, progress - layerIndex * 0.1);
                const radius = 15 * nodeProgress;
                
                // 繪製節點光暈
                if (nodeProgress > 0) {
                    const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
                    glow.addColorStop(0, layer.color);
                    glow.addColorStop(0.3, layer.color + '88');
                    glow.addColorStop(1, layer.color + '00');
                    ctx.fillStyle = glow;
                    ctx.globalAlpha = 0.5 * nodeProgress;
                    ctx.fillRect(x - radius * 2, y - radius * 2, radius * 4, radius * 4);
                    ctx.globalAlpha = 1;
                }
                
                // 繪製節點
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, 2 * Math.PI);
                ctx.fillStyle = layer.color;
                ctx.globalAlpha = nodeProgress;
                ctx.fill();
                
                // 節點邊框
                ctx.strokeStyle = layer.color;
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.globalAlpha = 1;
                
                // 脈動效果
                if (progress > layerIndex * 0.1 && progress < (layerIndex + 1) * 0.1) {
                    const pulseRadius = radius + 5 * Math.sin(progress * Math.PI * 10);
                    ctx.beginPath();
                    ctx.arc(x, y, pulseRadius, 0, 2 * Math.PI);
                    ctx.strokeStyle = layer.color;
                    ctx.globalAlpha = 0.3;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                }
                
                // 繪製連接線到下一層
                if (layerIndex < layers.length - 1 && nodeProgress > 0.5) {
                    const nextLayer = layers[layerIndex + 1];
                    const nextX = x + layerWidth;
                    const nextNodeSpacing = 40;
                    const nextStartY = centerY - (nextLayer.nodes * nextNodeSpacing) / 2;
                    
                    for (let j = 0; j < nextLayer.nodes; j++) {
                        const nextY = nextStartY + j * nextNodeSpacing;
                        
                        // 連接線動畫
                        const lineProgress = Math.min(1, (progress - layerIndex * 0.1 - 0.5) * 2);
                        if (lineProgress > 0) {
                            // 計算貝塞爾曲線控制點
                            const controlX = x + (nextX - x) / 2;
                            const controlY = y + (nextY - y) / 4;
                            
                            ctx.beginPath();
                            ctx.moveTo(x + radius, y);
                            
                            // 使用貝塞爾曲線繪製平滑連接
                            const endX = x + radius + (nextX - x - radius * 2) * lineProgress;
                            const endY = y + (nextY - y) * lineProgress;
                            
                            ctx.quadraticCurveTo(controlX, controlY, endX, endY);
                            
                            // 漸變線條
                            const lineGradient = ctx.createLinearGradient(x, y, endX, endY);
                            lineGradient.addColorStop(0, layer.color);
                            lineGradient.addColorStop(1, nextLayer.color);
                            
                            ctx.strokeStyle = lineGradient;
                            ctx.globalAlpha = 0.4 * lineProgress;
                            ctx.lineWidth = 1.5;
                            ctx.stroke();
                            ctx.globalAlpha = 1;
                        }
                    }
                }
            }
            
            // 層標籤 - 繁體中文
            ctx.save();
            ctx.font = `16px ${this.config.fontFamily}`;
            ctx.fillStyle = this.config.colors.text;
            ctx.textAlign = 'center';
            ctx.globalAlpha = Math.min(1, progress * 2);
            ctx.fillText(layer.name, x, centerY + 150);
            ctx.restore();
        });
        
        // 繪製資訊面板
        this.drawInfoPanel(progress);
    }
    
    // 繪製資訊面板
    drawInfoPanel(progress) {
        const ctx = this.ctx;
        const panelX = this.canvas.width - 220;
        const panelY = 60;
        const panelWidth = 200;
        const panelHeight = 120;
        
        // 面板背景
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
        ctx.strokeStyle = this.config.colors.grid;
        ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
        
        // 資訊文字 - 繁體中文
        ctx.font = `14px ${this.config.fontFamily}`;
        ctx.fillStyle = this.config.colors.text;
        
        const info = [
            `訓練進度：${Math.round(progress * 100)}%`,
            `當前週期：${this.trainingData.currentEpoch}/${this.trainingData.totalEpochs}`,
            `損失值：${(Math.random() * 0.5 + 0.1).toFixed(4)}`,
            `準確率：${(85 + Math.random() * 10).toFixed(2)}%`
        ];
        
        info.forEach((text, index) => {
            ctx.fillText(text, panelX + 10, panelY + 30 + index * 25);
        });
    }
    
    // 繪製訓練圖表
    drawTrainingCharts() {
        if (!this.chartCtx) return;
        
        const ctx = this.chartCtx;
        ctx.clearRect(0, 0, this.chartCanvas.width, this.chartCanvas.height);
        
        // 設定圖表標題
        ctx.font = `bold 18px ${this.config.fontFamily}`;
        ctx.fillStyle = this.config.colors.text;
        ctx.textAlign = 'center';
        ctx.fillText('訓練指標', this.chartCanvas.width / 2, 25);
        
        // 繪製坐標軸
        const margin = 40;
        const chartWidth = this.chartCanvas.width - 2 * margin;
        const chartHeight = this.chartCanvas.height - 2 * margin - 20;
        const chartX = margin;
        const chartY = margin + 20;
        
        // Y軸
        ctx.beginPath();
        ctx.moveTo(chartX, chartY);
        ctx.lineTo(chartX, chartY + chartHeight);
        ctx.strokeStyle = this.config.colors.text;
        ctx.stroke();
        
        // X軸
        ctx.beginPath();
        ctx.moveTo(chartX, chartY + chartHeight);
        ctx.lineTo(chartX + chartWidth, chartY + chartHeight);
        ctx.stroke();
        
        // 軸標籤 - 繁體中文
        ctx.font = `12px ${this.config.fontFamily}`;
        ctx.fillStyle = this.config.colors.text;
        ctx.textAlign = 'center';
        ctx.fillText('訓練週期', chartX + chartWidth / 2, chartY + chartHeight + 25);
        
        ctx.save();
        ctx.translate(chartX - 25, chartY + chartHeight / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('數值', 0, 0);
        ctx.restore();
        
        // 繪製數據線
        if (this.trainingData.epochs.length > 1) {
            // 損失曲線
            this.drawDataLine(ctx, this.trainingData.epochs, this.trainingData.loss, 
                            chartX, chartY, chartWidth, chartHeight, 
                            this.config.colors.danger, '損失值');
            
            // 準確率曲線
            this.drawDataLine(ctx, this.trainingData.epochs, this.trainingData.accuracy, 
                            chartX, chartY, chartWidth, chartHeight, 
                            this.config.colors.success, '準確率');
        }
        
        // 圖例
        this.drawLegend(ctx, chartX + chartWidth - 100, chartY + 10);
    }
    
    // 繪製數據線
    drawDataLine(ctx, xData, yData, chartX, chartY, chartWidth, chartHeight, color, label) {
        if (xData.length === 0) return;
        
        const xScale = chartWidth / (this.trainingData.totalEpochs - 1);
        const yMin = Math.min(...yData);
        const yMax = Math.max(...yData);
        const yScale = chartHeight / (yMax - yMin || 1);
        
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        
        xData.forEach((x, i) => {
            const px = chartX + x * xScale;
            const py = chartY + chartHeight - (yData[i] - yMin) * yScale;
            
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
            
            // 繪製數據點
            ctx.save();
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
        });
        
        ctx.stroke();
    }
    
    // 繪製圖例
    drawLegend(ctx, x, y) {
        const legends = [
            { color: this.config.colors.danger, label: '損失值' },
            { color: this.config.colors.success, label: '準確率' }
        ];
        
        ctx.font = `12px ${this.config.fontFamily}`;
        
        legends.forEach((legend, i) => {
            const ly = y + i * 20;
            
            // 顏色標記
            ctx.fillStyle = legend.color;
            ctx.fillRect(x, ly - 5, 15, 10);
            
            // 標籤文字
            ctx.fillStyle = this.config.colors.text;
            ctx.fillText(legend.label, x + 20, ly + 3);
        });
    }
    
    // 動畫訓練過程
    animateTraining(duration = 10000) {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(1, elapsed / duration);
            
            // 更新訓練數據
            this.updateTrainingData(progress);
            
            // 繪製神經網路
            this.drawNeuralNetwork(progress);
            
            // 繪製圖表
            this.drawTrainingCharts();
            
            // 繪製粒子效果
            this.drawParticleEffect(progress);
            
            if (progress < 1) {
                this.animationId = requestAnimationFrame(animate);
            } else {
                this.isAnimating = false;
                this.onTrainingComplete();
            }
        };
        
        animate();
    }
    
    // 繪製粒子效果
    drawParticleEffect(progress) {
        const ctx = this.ctx;
        const time = Date.now() / 1000;
        
        // 產生流動粒子
        for (let i = 0; i < 20; i++) {
            const x = (progress * this.canvas.width + i * 50) % this.canvas.width;
            const y = this.canvas.height / 2 + Math.sin(time + i) * 50;
            
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, 2 * Math.PI);
            ctx.fillStyle = `rgba(102, 126, 234, ${0.5 * (1 - progress)})`;
            ctx.fill();
        }
    }
    
    // 訓練完成回調
    onTrainingComplete() {
        console.log('訓練動畫完成');
        
        // 繪製完成效果
        const ctx = this.ctx;
        ctx.save();
        ctx.font = `bold 24px ${this.config.fontFamily}`;
        ctx.fillStyle = this.config.colors.success;
        ctx.textAlign = 'center';
        ctx.fillText('訓練完成！', this.canvas.width / 2, this.canvas.height / 2);
        ctx.restore();
        
        // 發送自定義事件
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('trainingComplete', {
                detail: { data: this.trainingData }
            }));
        }
    }
    
    // 更新訓練數據
    updateTrainingData(progress) {
        const epoch = Math.floor(progress * this.trainingData.totalEpochs);
        if (epoch > this.trainingData.currentEpoch) {
            this.trainingData.currentEpoch = epoch;
            this.trainingData.epochs.push(epoch);
            
            // 使用更真實的損失值下降曲線
            const baseLoss = 0.8 * Math.exp(-epoch * 0.2);
            const noise = (Math.random() - 0.5) * 0.05;
            const loss = Math.max(0.05, baseLoss + noise);
            this.trainingData.loss.push(loss);
            
            // 使用更平滑的準確率提升曲線
            const baseAccuracy = 0.95 - 0.85 * Math.exp(-epoch * 0.15);
            const accNoise = (Math.random() - 0.5) * 0.02;
            const accuracy = Math.min(0.99, Math.max(0, baseAccuracy + accNoise));
            this.trainingData.accuracy.push(accuracy);
        }
    }
    
    // 繪製即時偵測結果
    drawDetectionResults(imageData, detections) {
        if (!this.ctx) return;
        
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 繪製圖片
        if (imageData) {
            ctx.drawImage(imageData, 0, 0, this.canvas.width, this.canvas.height);
        }
        
        // 繪製偵測框
        detections.forEach(detection => {
            const { bbox, confidence, className } = detection;
            
            // 偵測框
            ctx.strokeStyle = this.config.colors.success;
            ctx.lineWidth = 3;
            ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);
            
            // 標籤背景
            const label = `${className} ${(confidence * 100).toFixed(1)}%`;
            ctx.font = `bold 16px ${this.config.fontFamily}`;
            const textWidth = ctx.measureText(label).width;
            
            ctx.fillStyle = this.config.colors.success;
            ctx.fillRect(bbox.x, bbox.y - 25, textWidth + 10, 25);
            
            // 標籤文字 - 繁體中文
            ctx.fillStyle = this.config.colors.background;
            ctx.fillText(label, bbox.x + 5, bbox.y - 7);
        });
        
        // 統計資訊
        this.drawDetectionStats(detections);
    }
    
    // 繪製偵測統計
    drawDetectionStats(detections) {
        const ctx = this.ctx;
        const statsX = this.canvas.width - 200;
        const statsY = 10;
        
        // 統計背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(statsX, statsY, 190, 80);
        
        // 統計文字 - 繁體中文
        ctx.font = `14px ${this.config.fontFamily}`;
        ctx.fillStyle = this.config.colors.background;
        
        const stats = [
            `偵測物件數：${detections.length}`,
            `平均信心度：${(detections.reduce((sum, d) => sum + d.confidence, 0) / detections.length * 100).toFixed(1)}%`,
            `FPS：${(Math.random() * 10 + 20).toFixed(1)}`
        ];
        
        stats.forEach((stat, i) => {
            ctx.fillText(stat, statsX + 10, statsY + 25 + i * 20);
        });
    }
    
    // 重置視覺化
    reset() {
        this.trainingData = {
            epochs: [],
            loss: [],
            accuracy: [],
            currentEpoch: 0,
            totalEpochs: 20
        };
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        this.isAnimating = false;
        
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        if (this.chartCtx) {
            this.chartCtx.clearRect(0, 0, this.chartCanvas.width, this.chartCanvas.height);
        }
    }
    
    // 匯出圖表為圖片
    exportChart(filename = 'training_chart.png') {
        if (!this.chartCanvas) return;
        
        const link = document.createElement('a');
        link.download = filename;
        link.href = this.chartCanvas.toDataURL();
        link.click();
    }
    
    // 設定自訂顏色
    setColors(colors) {
        Object.assign(this.config.colors, colors);
    }
    
    // 調整畫布大小
    resize(width, height) {
        if (this.canvas) {
            this.canvas.width = width;
            this.canvas.height = height;
            this.config.width = width;
            this.config.height = height;
        }
    }
}

// 工具函數
const visualizerUtils = {
    // 確保繁體中文正確顯示
    ensureChineseFontLoaded() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.font = '16px "Microsoft JhengHei"';
        ctx.fillText('測試繁體中文', 0, 0);
    },
    
    // 顏色工具
    hexToRgba(hex, alpha = 1) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? 
            `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})` : 
            null;
    },
    
    // 數值格式化
    formatNumber(num, decimals = 2) {
        return num.toFixed(decimals);
    },
    
    // 時間格式化
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
};

// 匯出模組
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { YOLOVisualizer, visualizerUtils };
} else {
    window.YOLOVisualizer = YOLOVisualizer;
    window.visualizerUtils = visualizerUtils;
}

// 初始化時載入字體
document.addEventListener('DOMContentLoaded', () => {
    visualizerUtils.ensureChineseFontLoaded();
});