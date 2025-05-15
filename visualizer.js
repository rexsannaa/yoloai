// visualizer.js
// EasyYOLO 視覺化模組 - 精簡版

class YOLOVisualizer {
    constructor(config = {}) {
        this.config = {
            canvasId: 'visualizerCanvas',
            chartCanvasId: 'chartCanvas',
            width: 800,
            height: 400,
            fontFamily: '"Microsoft JhengHei", sans-serif',
            colors: {
                primary: '#667eea',
                secondary: '#764ba2',
                success: '#00ff00',
                danger: '#ff0000',
                text: '#333',
                grid: '#e0e0e0'
            },
            ...config
        };
        
        this.init();
    }
    
    init() {
        this.canvas = document.getElementById(this.config.canvasId);
        this.ctx = this.canvas?.getContext('2d');
        this.chartCanvas = document.getElementById(this.config.chartCanvasId);
        this.chartCtx = this.chartCanvas?.getContext('2d');
        
        if (this.canvas) {
            this.canvas.width = this.config.width;
            this.canvas.height = this.config.height;
        }
        
        if (this.chartCanvas) {
            this.chartCanvas.width = 400;
            this.chartCanvas.height = 300;
        }
    }
    
    drawNeuralNetwork(progress = 0) {
        if (!this.ctx) return;
        
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 背景
        const gradient = ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, 'rgba(102, 126, 234, 0.02)');
        gradient.addColorStop(1, 'rgba(118, 75, 162, 0.02)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 標題
        ctx.font = `bold 24px ${this.config.fontFamily}`;
        ctx.fillStyle = this.config.colors.text;
        ctx.textAlign = 'center';
        ctx.fillText('YOLO 神經網路架構', this.canvas.width / 2, 35);
        
        // 網路層
        const layers = [
            { name: '輸入層', nodes: 3, color: this.config.colors.primary },
            { name: '卷積層 1', nodes: 5, color: '#00bfff' },
            { name: '卷積層 2', nodes: 7, color: '#00bfff' },
            { name: '全連接層', nodes: 5, color: '#ffa500' },
            { name: '輸出層', nodes: 3, color: this.config.colors.success }
        ];
        
        const layerWidth = 150;
        const startX = 50;
        const centerY = this.canvas.height / 2;
        
        layers.forEach((layer, layerIndex) => {
            const x = startX + layerIndex * layerWidth;
            this.drawLayer(layer, x, centerY, progress, layerIndex, layers);
        });
        
        this.drawInfoPanel(progress);
    }
    
    drawLayer(layer, x, centerY, progress, layerIndex, allLayers) {
        const ctx = this.ctx;
        const nodeSpacing = 40;
        const startY = centerY - (layer.nodes * nodeSpacing) / 2;
        const nodeProgress = Math.min(1, progress - layerIndex * 0.1);
        const radius = 15 * nodeProgress;
        
        for (let i = 0; i < layer.nodes; i++) {
            const y = startY + i * nodeSpacing;
            
            // 節點
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = layer.color;
            ctx.globalAlpha = nodeProgress;
            ctx.fill();
            ctx.strokeStyle = layer.color;
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.globalAlpha = 1;
            
            // 連接線
            if (layerIndex < allLayers.length - 1 && nodeProgress > 0.5) {
                this.drawConnections(x, y, radius, layerIndex, allLayers, progress);
            }
        }
        
        // 層標籤
        ctx.font = `16px ${this.config.fontFamily}`;
        ctx.fillStyle = this.config.colors.text;
        ctx.textAlign = 'center';
        ctx.globalAlpha = Math.min(1, progress * 2);
        ctx.fillText(layer.name, x, centerY + 150);
        ctx.globalAlpha = 1;
    }
    
    drawConnections(x, y, radius, layerIndex, layers, progress) {
        const ctx = this.ctx;
        const nextLayer = layers[layerIndex + 1];
        const layerWidth = 150;
        const nextX = x + layerWidth;
        const nodeSpacing = 40;
        const centerY = this.canvas.height / 2;
        const nextStartY = centerY - (nextLayer.nodes * nodeSpacing) / 2;
        const lineProgress = Math.min(1, (progress - layerIndex * 0.1 - 0.5) * 2);
        
        if (lineProgress <= 0) return;
        
        for (let j = 0; j < nextLayer.nodes; j++) {
            const nextY = nextStartY + j * nodeSpacing;
            
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            const endX = x + radius + (nextX - x - radius * 2) * lineProgress;
            const endY = y + (nextY - y) * lineProgress;
            ctx.lineTo(endX, endY);
            
            const gradient = ctx.createLinearGradient(x, y, endX, endY);
            gradient.addColorStop(0, layers[layerIndex].color);
            gradient.addColorStop(1, nextLayer.color);
            
            ctx.strokeStyle = gradient;
           ctx.globalAlpha = 0.4 * lineProgress;
           ctx.lineWidth = 1.5;
           ctx.stroke();
           ctx.globalAlpha = 1;
       }
   }
   
   drawInfoPanel(progress) {
       const ctx = this.ctx;
       const panelX = this.canvas.width - 220;
       const panelY = 60;
       
       ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
       ctx.fillRect(panelX, panelY, 200, 120);
       ctx.strokeStyle = this.config.colors.grid;
       ctx.strokeRect(panelX, panelY, 200, 120);
       
       ctx.font = `14px ${this.config.fontFamily}`;
       ctx.fillStyle = this.config.colors.text;
       
       const info = [
           `訓練進度：${Math.round(progress * 100)}%`,
           `損失值：${(Math.random() * 0.5 + 0.1).toFixed(4)}`,
           `準確率：${(85 + Math.random() * 10).toFixed(2)}%`
       ];
       
       info.forEach((text, i) => {
           ctx.fillText(text, panelX + 10, panelY + 30 + i * 30);
       });
   }
   
   animateTraining(duration = 10000) {
       if (this.isAnimating) return;
       
       this.isAnimating = true;
       const startTime = Date.now();
       
       const animate = () => {
           const progress = Math.min(1, (Date.now() - startTime) / duration);
           this.drawNeuralNetwork(progress);
           this.drawTrainingCharts(progress);
           
           if (progress < 1) {
               requestAnimationFrame(animate);
           } else {
               this.isAnimating = false;
               this.onTrainingComplete();
           }
       };
       
       animate();
   }
   
   drawTrainingCharts(progress) {
       if (!this.chartCtx) return;
       
       const ctx = this.chartCtx;
       ctx.clearRect(0, 0, this.chartCanvas.width, this.chartCanvas.height);
       
       // 標題
       ctx.font = `bold 18px ${this.config.fontFamily}`;
       ctx.fillStyle = this.config.colors.text;
       ctx.textAlign = 'center';
       ctx.fillText('訓練指標', this.chartCanvas.width / 2, 25);
       
       // 簡單圖表
       const margin = 40;
       const chartWidth = this.chartCanvas.width - 2 * margin;
       const chartHeight = this.chartCanvas.height - 2 * margin - 20;
       
       // 坐標軸
       ctx.beginPath();
       ctx.moveTo(margin, margin + 20);
       ctx.lineTo(margin, margin + 20 + chartHeight);
       ctx.lineTo(margin + chartWidth, margin + 20 + chartHeight);
       ctx.strokeStyle = this.config.colors.text;
       ctx.stroke();
       
       // 繪製模擬數據
       if (progress > 0) {
           this.drawCurve(ctx, margin, margin + 20, chartWidth, chartHeight, progress, 
                         this.config.colors.danger, 'loss');
           this.drawCurve(ctx, margin, margin + 20, chartWidth, chartHeight, progress, 
                         this.config.colors.success, 'accuracy');
       }
   }
   
   drawCurve(ctx, x, y, width, height, progress, color, type) {
       ctx.beginPath();
       ctx.strokeStyle = color;
       ctx.lineWidth = 2;
       
       const points = 50;
       for (let i = 0; i <= points * progress; i++) {
           const px = x + (i / points) * width;
           const py = type === 'loss' 
               ? y + height - (height * Math.exp(-i / 10))
               : y + height - (height * (1 - Math.exp(-i / 15)));
           
           if (i === 0) ctx.moveTo(px, py);
           else ctx.lineTo(px, py);
       }
       
       ctx.stroke();
   }
   
   onTrainingComplete() {
       const ctx = this.ctx;
       ctx.save();
       ctx.font = `bold 24px ${this.config.fontFamily}`;
       ctx.fillStyle = this.config.colors.success;
       ctx.textAlign = 'center';
       ctx.fillText('訓練完成！', this.canvas.width / 2, this.canvas.height / 2);
       ctx.restore();
   }
}