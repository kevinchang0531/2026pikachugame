import { Platform }    from './platform.js';
import { Enemy }       from './enemy.js';
import { Collectible } from './collectible.js';

// Enemy(x, y, patrolW, speed)  ← speed 預設 80，第三關用 130~160 加速版

// ── 關卡 1：草原入門 ────────────────────────────────────────
export const LEVEL_1 = {
  width: 3200,
  height: 900,
  playerStart: { x: 100, y: 700 },
  bg: ['#87ceeb', '#d4f1f9'],
  platforms: [
    new Platform(0,    820, 3200, 80, '#5a3e28'),
    new Platform(200,  700, 160),
    new Platform(420,  600, 160),
    new Platform(640,  500, 160),
    new Platform(860,  400, 200),
    new Platform(1100, 650, 120),
    new Platform(1280, 550, 120),
    new Platform(1460, 450, 120),
    new Platform(1640, 350, 180),
    new Platform(1900, 600, 200),
    new Platform(2150, 480, 200),
    new Platform(2400, 360, 200),
    new Platform(2650, 240, 200),
    new Platform(2950, 500, 240, 20, '#c0a000'),
  ],
  enemies: [
    new Enemy(420,  664, 140),
    new Enemy(860,  364, 160),
    new Enemy(1640, 314, 140),
    new Enemy(1900, 564, 160),
    new Enemy(2400, 324, 160),
  ],
  collectibles: [
    new Collectible(240,  668, 'bolt'),
    new Collectible(460,  568, 'coin'),
    new Collectible(680,  468, 'bolt'),
    new Collectible(900,  368, 'coin'),
    new Collectible(1120, 618, 'bolt'),
    new Collectible(1300, 518, 'coin'),
    new Collectible(1480, 418, 'bolt'),
    new Collectible(1660, 318, 'coin'),
    new Collectible(1940, 568, 'bolt'),
    new Collectible(2180, 448, 'coin'),
    new Collectible(2440, 328, 'bolt'),
    new Collectible(2680, 208, 'coin'),
    new Collectible(3000, 468, 'bolt'),
  ],
  goal: { x: 3100, y: 460, w: 40, h: 40 },
};

// ── 關卡 2：地下熔岩洞窟 ──────────────────────────────────────
// 設計主軸：
//   段落 A（入口）→ 段落 B（熔岩裂縫 #1，小跳石）→
//   段落 C（中段岩台 + 敵人密集）→ 段落 D（熔岩裂縫 #2，更窄）→
//   段落 E（最終垂直攀登）→ 終點
export const LEVEL_2 = {
  width: 4400,
  height: 900,
  playerStart: { x: 80, y: 720 },
  bg: ['#2d0800', '#0a0000'],
  bgType: 'cave',

  platforms: [
    // ── A. 洞窟入口（安全熱身區）──────────────────
    new Platform(0,    820, 880, 80, '#4a3020'),   // 地板
    new Platform(160,  700, 140, 18, '#6a4530'),   // 低台
    new Platform(360,  590, 130, 18, '#6a4530'),   // 中台
    new Platform(540,  470, 150, 18, '#6a4530'),   // 高台（敵人在這）
    new Platform(720,  360, 140, 18, '#6a4530'),   // 最高台

    // ── B. 熔岩裂縫 #1（跳石渡河，間距適中）──────
    new Platform(940,  730, 90,  18, '#7a3a20'),
    new Platform(1080, 660, 70,  18, '#7a3a20'),
    new Platform(1200, 590, 80,  18, '#7a3a20'),
    new Platform(1330, 660, 70,  18, '#7a3a20'),
    new Platform(1450, 730, 90,  18, '#7a3a20'),

    // ── B 出口休息台 ───────────────────────────────
    new Platform(1580, 820, 300, 80, '#4a3020'),
    new Platform(1620, 680, 160, 18, '#6a4530'),
    new Platform(1700, 540, 160, 18, '#6a4530'),

    // ── C. 中段岩台（敵人密集，平台寬但對手多）───
    new Platform(1920, 820, 700, 80, '#4a3020'),
    new Platform(1960, 680, 200, 18, '#6a4530'),
    new Platform(2220, 560, 180, 18, '#6a4530'),
    new Platform(2060, 440, 200, 18, '#6a4530'),
    new Platform(2320, 360, 160, 18, '#6a4530'),

    // ── D. 熔岩裂縫 #2（更窄、間距更大）──────────
    new Platform(2680, 760, 65,  18, '#7a3a20'),
    new Platform(2800, 690, 55,  18, '#7a3a20'),
    new Platform(2910, 620, 60,  18, '#7a3a20'),
    new Platform(3020, 560, 55,  18, '#7a3a20'),
    new Platform(3130, 620, 60,  18, '#7a3a20'),
    new Platform(3240, 690, 55,  18, '#7a3a20'),
    new Platform(3350, 760, 65,  18, '#7a3a20'),

    // ── E. 最終垂直攀登 ────────────────────────────
    new Platform(3460, 820, 240, 80, '#4a3020'),   // 落腳地板
    new Platform(3440, 680, 130, 18, '#6a4530'),
    new Platform(3600, 560, 130, 18, '#6a4530'),
    new Platform(3450, 440, 130, 18, '#6a4530'),
    new Platform(3610, 320, 130, 18, '#6a4530'),
    new Platform(3460, 200, 130, 18, '#6a4530'),
    new Platform(3950, 820, 450, 80, '#4a3020'),   // 終點地板
    new Platform(3860, 640, 140, 18, '#6a4530'),
    new Platform(4000, 480, 160, 18, '#6a4530'),
    new Platform(4100, 300, 240, 20, '#b8860b'),   // 黃金終點台
  ],

  enemies: [
    // A 段：高台上守門
    new Enemy(540,  434, 120),
    new Enemy(720,  324, 110),
    // C 段：密集守衛
    new Enemy(1960, 644, 170),
    new Enemy(2220, 524, 150),
    new Enemy(2060, 404, 170),
    new Enemy(2320, 324, 130),
    // E 段：最終攀登守衛
    new Enemy(3600, 524, 100),
    new Enemy(3610, 284, 100),
    new Enemy(4000, 444, 130),
  ],

  collectibles: [
    // A 段
    new Collectible(200,  668, 'bolt'),
    new Collectible(390,  558, 'coin'),
    new Collectible(575,  438, 'bolt'),
    new Collectible(755,  328, 'coin'),
    // B 熔岩跳石
    new Collectible(960,  698, 'bolt'),
    new Collectible(1090, 628, 'coin'),
    new Collectible(1210, 558, 'bolt'),
    new Collectible(1460, 698, 'coin'),
    // B 休息區
    new Collectible(1640, 648, 'bolt'),
    new Collectible(1720, 508, 'coin'),
    // C 段
    new Collectible(2000, 648, 'bolt'),
    new Collectible(2260, 528, 'coin'),
    new Collectible(2100, 408, 'bolt'),
    new Collectible(2360, 328, 'coin'),
    // D 熔岩跳石
    new Collectible(2700, 728, 'bolt'),
    new Collectible(2820, 658, 'coin'),
    new Collectible(2930, 588, 'bolt'),
    new Collectible(3040, 528, 'coin'),
    // E 最終攀登
    new Collectible(3460, 648, 'bolt'),
    new Collectible(3620, 528, 'coin'),
    new Collectible(3470, 408, 'bolt'),
    new Collectible(3630, 288, 'coin'),
    new Collectible(3480, 168, 'bolt'),
    new Collectible(4140, 268, 'coin'),
  ],

  goal: { x: 4210, y: 260, w: 40, h: 40 },

  // 鐘乳石裝飾（靜態），格式：[x, 長度]
  stalactites: [
    [80,60],[200,90],[340,50],[480,110],[600,70],
    [900,80],[1050,60],[1200,100],[1400,70],[1550,90],
    [1650,60],[1800,80],[2000,110],[2100,60],[2280,90],
    [2450,70],[2550,80],[2700,60],[2900,90],[3100,70],
    [3300,100],[3480,60],[3600,80],[3750,70],[3900,110],
    [4050,60],[4200,90],
  ],
};

// ── 關卡 3：電力發電廠 ────────────────────────────────────────
// 設計主軸：敵人更快（speed 130~160），子彈是主要攻擊手段
//   段落 A（工廠入口，熱身射擊練習）
//   段落 B（管道區，逼窄平台，快速敵人必須遠射）
//   段落 C（垂直電梯井，之字形攀升，四方敵人）
//   段落 D（高壓電弧區，超快敵人 + 精準射擊）
//   段落 E（發電機頂層，最終密集戰）
export const LEVEL_3 = {
  width: 5000,
  height: 900,
  playerStart: { x: 80, y: 720 },
  bg: ['#001133', '#000820'],
  bgType: 'electric',

  platforms: [
    // ── A. 工廠入口（寬台，熱身射擊）─────────────────
    new Platform(0,    820, 1000, 80, '#1a2a3a'),
    new Platform(150,  680, 200,  18, '#2a3a5a'),
    new Platform(420,  560, 200,  18, '#2a3a5a'),
    new Platform(680,  440, 200,  18, '#2a3a5a'),
    new Platform(880,  320, 200,  18, '#2a3a5a'),

    // ── B. 管道跨越（窄跳石 + 快敵）──────────────────
    new Platform(1060, 760, 80,   18, '#1a3a6a'),
    new Platform(1190, 690, 70,   18, '#1a3a6a'),
    new Platform(1310, 620, 80,   18, '#1a3a6a'),
    new Platform(1440, 690, 70,   18, '#1a3a6a'),
    new Platform(1560, 760, 80,   18, '#1a3a6a'),
    new Platform(1680, 820, 280,  80, '#1a2a3a'), // 休息台

    // ── C. 垂直電梯井（之字爬升）─────────────────────
    new Platform(2000, 820, 280,  80, '#1a2a3a'),
    new Platform(1980, 680, 130,  18, '#2a3a5a'),
    new Platform(2170, 560, 130,  18, '#2a3a5a'),
    new Platform(1980, 440, 130,  18, '#2a3a5a'),
    new Platform(2170, 320, 130,  18, '#2a3a5a'),
    new Platform(1990, 200, 140,  18, '#2a3a5a'),

    // ── D. 高壓電弧區（超快敵人，需先射再跳）─────────
    new Platform(2360, 820, 800,  80, '#1a2a3a'),
    new Platform(2400, 680, 180,  18, '#1a3a6a'),
    new Platform(2650, 560, 180,  18, '#1a3a6a'),
    new Platform(2860, 440, 160,  18, '#1a3a6a'),
    new Platform(2600, 320, 180,  18, '#1a3a6a'),
    new Platform(2860, 200, 200,  18, '#1a3a6a'),

    // ── E. 發電機頂層（最終密集戰）───────────────────
    new Platform(3200, 820, 600,  80, '#1a2a3a'),
    new Platform(3250, 680, 200,  18, '#2a3a5a'),
    new Platform(3510, 560, 180,  18, '#2a3a5a'),
    new Platform(3740, 440, 180,  18, '#2a3a5a'),
    new Platform(3510, 320, 200,  18, '#2a3a5a'),
    new Platform(3760, 200, 180,  18, '#2a3a5a'),
    new Platform(3900, 820, 1100, 80, '#1a2a3a'),
    new Platform(3950, 680, 200,  18, '#2a3a5a'),
    new Platform(4200, 560, 200,  18, '#2a3a5a'),
    new Platform(4000, 440, 200,  18, '#2a3a5a'),
    new Platform(4220, 320, 160,  18, '#2a3a5a'),
    new Platform(4080, 180, 240,  20, '#b8860b'), // 黃金終點台
  ],

  enemies: [
    // A 段（普通速度 90，練習瞄準）
    new Enemy(430,  524, 160, 90),
    new Enemy(690,  404, 160, 90),
    new Enemy(890,  284, 160, 90),
    // B 段（跳石上，速度 110，需要射擊才安全通過）
    new Enemy(1070, 724, 60,  110),
    new Enemy(1320, 584, 60,  110),
    new Enemy(1570, 724, 60,  110),
    // C 段（之字攀升，速度 120）
    new Enemy(1990, 644, 110, 120),
    new Enemy(2180, 524, 110, 120),
    new Enemy(1990, 404, 110, 120),
    new Enemy(2180, 284, 110, 120),
    // D 段（超快，speed 150，強迫遠程射擊）
    new Enemy(2410, 644, 150, 150),
    new Enemy(2660, 524, 150, 150),
    new Enemy(2870, 404, 130, 150),
    new Enemy(2610, 284, 150, 150),
    new Enemy(2870, 164, 170, 150),
    // E 段（最終密集，速度 130）
    new Enemy(3260, 644, 170, 130),
    new Enemy(3520, 524, 150, 130),
    new Enemy(3750, 404, 150, 130),
    new Enemy(3520, 284, 170, 130),
    new Enemy(3960, 644, 170, 130),
    new Enemy(4210, 524, 160, 130),
    new Enemy(4010, 404, 170, 130),
  ],

  collectibles: [
    // A 段
    new Collectible(190,  648, 'bolt'),
    new Collectible(460,  528, 'coin'),
    new Collectible(720,  408, 'bolt'),
    new Collectible(920,  288, 'coin'),
    // B 管道
    new Collectible(1075, 728, 'bolt'),
    new Collectible(1200, 658, 'coin'),
    new Collectible(1320, 588, 'bolt'),
    new Collectible(1450, 658, 'coin'),
    new Collectible(1570, 728, 'bolt'),
    // C 攀升
    new Collectible(2000, 648, 'bolt'),
    new Collectible(2190, 528, 'coin'),
    new Collectible(2000, 408, 'bolt'),
    new Collectible(2190, 288, 'coin'),
    new Collectible(2010, 168, 'bolt'),
    // D 電弧區
    new Collectible(2430, 648, 'coin'),
    new Collectible(2680, 528, 'bolt'),
    new Collectible(2880, 408, 'coin'),
    new Collectible(2630, 288, 'bolt'),
    new Collectible(2890, 168, 'coin'),
    // E 頂層
    new Collectible(3280, 648, 'bolt'),
    new Collectible(3540, 528, 'coin'),
    new Collectible(3760, 408, 'bolt'),
    new Collectible(3540, 288, 'coin'),
    new Collectible(3980, 648, 'bolt'),
    new Collectible(4230, 528, 'coin'),
    new Collectible(4040, 408, 'bolt'),
    new Collectible(4240, 288, 'coin'),
    new Collectible(4120, 148, 'bolt'),
  ],

  goal: { x: 4240, y: 140, w: 40, h: 40 },

  // 電路裝飾節點（格式：[x, y, 類型 'h'水平/'v'垂直]）
  circuits: [
    [100,200,'h'],[300,350,'v'],[500,150,'h'],[700,280,'v'],
    [1000,400,'h'],[1200,250,'v'],[1500,500,'h'],[1700,300,'v'],
    [2050,550,'h'],[2200,400,'v'],[2400,300,'h'],[2600,450,'v'],
    [2800,200,'h'],[3000,350,'v'],[3200,480,'h'],[3400,280,'v'],
    [3700,420,'h'],[3900,260,'v'],[4100,380,'h'],[4300,220,'v'],
  ],
};
