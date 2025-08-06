console.log(
    '%cbuild from PakePlus： https://github.com/Sjj1024/PakePlus',
    'color:orangered;font-weight:bolder'
)

// very important, if you don't know what it is, don't touch it
const hookClick = (e) => {
    const origin = e.target.closest('a')
    const isBaseTargetBlank = document.querySelector(
        'head base[target="_blank"]'
    )
    console.log('origin', origin, isBaseTargetBlank)
    if (
        (origin && origin.href && origin.target === '_blank') ||
        (origin && origin.href && isBaseTargetBlank)
    ) {
        e.preventDefault()
        console.log('handle origin', origin)
        location.href = origin.href
    } else {
        console.log('not handle origin', origin)
    }
}

window.open = function (url, target, features) {
    console.log('open', url, target, features)
    location.href = url
}

document.addEventListener('click', hookClick, { capture: true })

// 配置选项
const config = {
    // 最大初始化等待时间（毫秒）
    maxInitWait: 10000,
    // 重试间隔（毫秒）
    retryInterval: 500,
    // 调试模式
    debug: true
};

// 工具函数：日志记录
function log(...args) {
    if (config.debug) {
        console.log('[ArtPlayer AutoFullscreen]', ...args);
    }
}

// 主初始化函数
function initAutoFullscreen() {
    log('脚本已启动，正在寻找ArtPlayer实例...');
    
    let player = null;
    let initAttempts = 0;
    const maxAttempts = config.maxInitWait / config.retryInterval;
    
    // 尝试获取ArtPlayer实例
    function findPlayer() {
        // 方法1：通过全局变量查找
        if (window.artplayer) {
            player = window.artplayer;
            log('通过全局变量找到ArtPlayer实例');
            return true;
        }
        
        // 方法2：通过DOM元素属性查找
        const playerElements = document.querySelectorAll('[class*="artplayer"]');
        for (const el of playerElements) {
            if (el.artplayer) {
                player = el.artplayer;
                log('通过DOM属性找到ArtPlayer实例');
                return true;
            }
        }
        
        // 方法3：通过特定类名查找
        const artApp = document.querySelector('.art-video-player');
        if (artApp && artApp.artplayer) {
            player = artApp.artplayer;
            log('通过.artplayer-app类找到ArtPlayer实例');
            return true;
        }
        
        initAttempts++;
        return false;
    }
    
    // 重试机制
    const intervalId = setInterval(() => {
        if (findPlayer() || initAttempts >= maxAttempts) {
            clearInterval(intervalId);
            
            if (!player) {
                log('未找到ArtPlayer实例，停止尝试');
                return;
            }
            
            log('ArtPlayer实例已找到，设置自动全屏');
            setupAutoFullscreen(player);
        }
    }, config.retryInterval);
}

// 设置自动全屏
function setupAutoFullscreen(player) {
    // 监听播放事件
    player.on('play', () => {
        log('视频开始播放，尝试进入全屏...');
        
        try {
            // 使用ArtPlayer的全屏API
            if (player.fullscreen && typeof player.fullscreen.toggle === 'function') {
                player.fullscreen.toggle();
                log('成功切换全屏状态');
            } else {
                log('player.fullscreen.toggle方法不可用');
            }
        } catch (e) {
            log('全屏切换失败:', e);
        }
    });
    
    // 可选：监听播放器就绪事件
    player.on('ready', () => {
        log('播放器准备就绪');
    });
    
    // 可选：添加全屏状态监听
    player.on('fullscreen', (state) => {
        log('全屏状态变化:', state);
    });
}

// 启动脚本
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initAutoFullscreen();
} else {
    window.addEventListener('DOMContentLoaded', initAutoFullscreen);
}