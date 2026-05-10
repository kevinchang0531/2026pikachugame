import { Game } from './game.js';

const canvas = document.getElementById('gameCanvas');
canvas.width = 800;
canvas.height = 900;

const game = new Game(canvas);
game.start();
