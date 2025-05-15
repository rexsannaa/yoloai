// yolo-worker.js
// YOLO Web Worker 處理模組 - 精簡整合版

// 初始化全域變數
let yoloModel = null;
let isModelLoaded = false;

// 監聽主執行緒訊息
self.addEventListener('message', async (event) => {
    const { type, data } = event.data;
    
    switch (type) {
        case 'init':
            await initializeModel(data);
            break;
        case 'detect':
            await detectObjects(data);
            break;
        case 'updateConfig':
            updateConfiguration(data);
            break;
        default:
            console.error('未知的訊息類型:', type);
    }
});

// 初始化 YOLO 模型
async function initializeModel(config) {
    try {
        postMessage({
            type: 'status',
            message: '正在載入 YOLO 模型...'
        });
        
        // 在真實應用中，這裡會載入實際的 YOLO 模型
        // 現在我們創建一個簡化的模擬模型
        yoloModel = createSimulatedModel(config);
        isModelLoaded = true;
        
        postMessage({
            type: 'modelLoaded',
            success: true,
            message: 'YOLO 模型載入完成'
        });
    } catch (error) {
        postMessage({
            type: 'error',
            message: '模型載入失敗：' + error.message
        });
    }
}

// 創建模擬的 YOLO 模型
function createSimulatedModel(config) {
    return {
        config: {
            threshold: config.threshold || 0.5,
            nmsThreshold: config.nmsThreshold || 0.4,
            maxBoxes: config.maxBoxes || 100,
            classes: config.classes || ['物件']
        },
        
        // 模擬推論函數
        predict: function(imageData) {
            // 在真實應用中，這裡會執行實際的 YOLO 推論
            // 現在我們生成模擬的偵測結果
            const detections = [];
            const numDetections = Math.floor(Math.random() * 3) + 1;
            
            for (let i = 0; i < numDetections; i++) {
                detections.push({
                    bbox: [
                        Math.random() * (imageData.width - 100),
                        Math.random() * (imageData.height - 100),
                        50 + Math.random() * 100,
                        50 + Math.random() * 100
                    ],
                    score: 0.7 + Math.random() * 0.3,
                    class: Math.floor(Math.random() * this.config.classes.length),
                    className: this.config.classes[Math.floor(Math.random() * this.config.classes.length)]
                });
            }
            
            return this.postProcess(detections);
        },
        
        // 後處理函數
        postProcess: function(detections) {
            // 過濾低信心度的偵測
            let filtered = detections.filter(det => det.score >= this.config.threshold);
            
            // 非最大抑制 (NMS)
            filtered = this.nms(filtered, this.config.nmsThreshold);
            
            // 限制最大框數
            if (filtered.length > this.config.maxBoxes) {
                filtered = filtered.slice(0, this.config.maxBoxes);
            }
            
            return filtered;
        },
        
        // 簡化的非最大抑制實現
        nms: function(boxes, threshold) {
            // 按信心度排序
            boxes.sort((a, b) => b.score - a.score);
            
            const selected = [];
            const processed = new Set();
            
            for (let i = 0; i < boxes.length; i++) {
                if (processed.has(i)) continue;
                
                selected.push(boxes[i]);
                processed.add(i);
                
                for (let j = i + 1; j < boxes.length; j++) {
                    if (processed.has(j)) continue;
                    
                    const iou = this.calculateIoU(boxes[i].bbox, boxes[j].bbox);
                    if (iou > threshold) {
                        processed.add(j);
                    }
                }
            }
            
            return selected;
        },
        
        // 計算交併比 (IoU)
        calculateIoU: function(box1, box2) {
            const [x1, y1, w1, h1] = box1;
            const [x2, y2, w2, h2] = box2;
            
            // 計算交集
            const xi1 = Math.max(x1, x2);
            const yi1 = Math.max(y1, y2);
            const xi2 = Math.min(x1 + w1, x2 + w2);
            const yi2 = Math.min(y1 + h1, y2 + h2);
            
            const interArea = Math.max(0, xi2 - xi1) * Math.max(0, yi2 - yi1);
            
            // 計算並集
            const box1Area = w1 * h1;
            const box2Area = w2 * h2;
            const unionArea = box1Area + box2Area - interArea;
            
            return interArea / unionArea;
        }
    };
}

// 物件偵測函數
async function detectObjects(data) {
    if (!isModelLoaded) {
        postMessage({
            type: 'error',
            message: '模型尚未載入'
        });
        return;
    }
    
    try {
        const { imageData, config } = data;
        
        // 更新配置（如果提供）
        if (config) {
            Object.assign(yoloModel.config, config);
        }
        
        // 執行推論
        const detections = yoloModel.predict(imageData);
        
        // 格式化結果
        const formattedResults = formatDetectionResults(detections, imageData);
        
        // 發送結果回主執行緒
        postMessage({
            type: 'detection',
            results: formattedResults,
            stats: {
                detectionCount: detections.length,
                processingTime: Math.random() * 50 + 20 // 模擬處理時間
            }
        });
    } catch (error) {
        postMessage({
            type: 'error',
            message: '偵測失敗：' + error.message
        });
    }
}

// 格式化偵測結果
function formatDetectionResults(detections, imageData) {
    return detections.map(det => ({
        bbox: {
            x: det.bbox[0],
            y: det.bbox[1],
            width: det.bbox[2],
            height: det.bbox[3]
        },
        confidence: det.score,
        class: det.class,
        className: det.className,
        // 計算相對座標（0-1）
        normalizedBbox: {
            x: det.bbox[0] / imageData.width,
            y: det.bbox[1] / imageData.height,
            width: det.bbox[2] / imageData.width,
            height: det.bbox[3] / imageData.height
        }
    }));
}

// 更新配置
function updateConfiguration(config) {
    if (!yoloModel) {
        postMessage({
            type: 'error',
            message: '模型尚未初始化'
        });
        return;
    }
    
    Object.assign(yoloModel.config, config);
    
    postMessage({
        type: 'configUpdated',
        config: yoloModel.config
    });
}

// 工具函數
const utils = {
    // 影像預處理
    preprocessImage: function(imageData, targetSize = 416) {
        // 在真實應用中，這裡會進行影像預處理
        // 包括調整大小、正規化等
        return imageData;
    },
    
    // 繪製偵測框的建議樣式
    getDrawStyle: function(className, confidence) {
        // 根據類別和信心度返回不同的繪製樣式
        const colors = {
            '物件': '#00ff00',
            '人': '#ff0000',
            '車輛': '#0000ff',
            '動物': '#ffff00'
        };
        
        const color = colors[className] || '#00ff00';
        const alpha = Math.min(0.9, confidence);
        
        return {
            strokeColor: color,
            fillColor: `${color}${Math.floor(alpha * 255).toString(16)}`,
            lineWidth: Math.max(2, confidence * 4),
            fontSize: Math.max(12, confidence * 16)
        };
    },
    
    // 處理繁體中文編碼
    encodeChineseText: function(text) {
        // 確保繁體中文正確編碼
        return encodeURIComponent(text).replace(/%/g, '\\x');
    },
    
    // 解碼繁體中文
    decodeChineseText: function(encodedText) {
        return decodeURIComponent(encodedText.replace(/\\x/g, '%'));
    }
};

// 效能監控
const performanceMonitor = {
    metrics: {
        totalDetections: 0,
        averageProcessingTime: 0,
        frameCount: 0
    },
    
    recordDetection: function(processingTime, detectionCount) {
        this.metrics.frameCount++;
        this.metrics.totalDetections += detectionCount;
        this.metrics.averageProcessingTime = 
            (this.metrics.averageProcessingTime * (this.metrics.frameCount - 1) + processingTime) / 
            this.metrics.frameCount;
    },
    
    getMetrics: function() {
        return {
            ...this.metrics,
            fps: this.metrics.frameCount > 0 ? 1000 / this.metrics.averageProcessingTime : 0
        };
    }
};

// 錯誤處理
const errorHandler = {
    handleError: function(error, context) {
        console.error(`錯誤於 ${context}:`, error);
        
        postMessage({
            type: 'error',
            message: error.message,
            context: context,
            stack: error.stack
        });
    }
};

// 初始化時的自檢
self.addEventListener('load', () => {
    postMessage({
        type: 'ready',
        message: 'YOLO Worker 已就緒'
    });
});