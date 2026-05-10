# 2026 Pikachu Game

## 專案概述
原生 HTML5 Canvas 網頁遊戲，皮卡丘主題。

## 技術棧
- 純 HTML5 / CSS3 / Vanilla JS（ES Modules）
- Canvas 2D API 負責渲染
- 無框架、無打包工具（直接用 `<script type="module">`）

## 目錄結構
```
index.html       # 入口
css/style.css    # 樣式
js/main.js       # 入口 JS，建立 Game 實例
js/game.js       # Game 主類別（loop / update / draw）
assets/          # 圖片、音效（之後加）
```

## 開發方式
直接在瀏覽器開啟 index.html，或用 Live Server 預覽。  
ES Modules 需透過 HTTP 提供（不能用 `file://`）。

## 命名規範
- JS 類別：PascalCase
- 方法 / 變數：camelCase
- CSS 類別：kebab-case
