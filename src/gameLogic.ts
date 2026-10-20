import { Ship, GameBoard } from './types';
import { v4 as uuidv4 } from 'uuid';

const BOARD_SIZE = 10;
const SHIP_SIZES = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1]; // Standard battleship fleet

export function createEmptyBoard(): GameBoard {
  return { ships: [], shots: [], missedShots: [] };
}

export function generateRandomPlacement(): GameBoard {
  const board = createEmptyBoard();
  const occupied = new Set<string>();
  
  for (const size of SHIP_SIZES) {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 1000) {
      attempts++;
      const horizontal = Math.random() > 0.5;
      const row = Math.floor(Math.random() * BOARD_SIZE);
      const col = Math.floor(Math.random() * BOARD_SIZE);
      
      const cells: { row: number; col: number }[] = [];
      let valid = true;
      
      for (let i = 0; i < size; i++) {
        const r = horizontal ? row : row + i;
        const c = horizontal ? col + i : col;
        if (r >= BOARD_SIZE || c >= BOARD_SIZE) { valid = false; break; }
        cells.push({ row: r, col: c });
      }
      
      if (!valid) continue;
      
      // Check if cells and surrounding cells are free
      const allCellsToCheck: string[] = [];
      for (const cell of cells) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = cell.row + dr;
            const nc = cell.col + dc;
            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
              allCellsToCheck.push(`${nr},${nc}`);
            }
          }
        }
      }
      
      if (allCellsToCheck.some(key => occupied.has(key))) continue;
      
      const ship: Ship = {
        id: uuidv4(),
        size,
        cells,
        hits: 0,
        sunk: false,
      };
      
      board.ships.push(ship);
      allCellsToCheck.forEach(key => occupied.add(key));
      placed = true;
    }
  }
  
  return board;
}

export function processShot(board: GameBoard, row: number, col: number): { hit: boolean; sunk: boolean; shipId?: string } {
  const alreadyShot = board.shots.some(s => s.row === row && s.col === col) ||
    board.missedShots.some(s => s.row === row && s.col === col);
  
  if (alreadyShot) return { hit: false, sunk: false };
  
  const ship = board.ships.find(s => s.cells.some(c => c.row === row && c.col === col));
  
  if (ship) {
    ship.hits++;
    board.shots.push({ row, col, hit: true });
    
    if (ship.hits >= ship.size) {
      ship.sunk = true;
      return { hit: true, sunk: true, shipId: ship.id };
    }
    return { hit: true, sunk: false, shipId: ship.id };
  } else {
    board.missedShots.push({ row, col });
    return { hit: false, sunk: false };
  }
}

export function isAllSunk(board: GameBoard): boolean {
  return board.ships.every(s => s.sunk);
}

export function getSunkShipCells(board: GameBoard): Set<string> {
  const cells = new Set<string>();
  board.ships.filter(s => s.sunk).forEach(ship => {
    ship.cells.forEach(c => cells.add(`${c.row},${c.col}`));
    // Добавляем клетки вокруг потопленного корабля
    ship.cells.forEach(c => {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = c.row + dr;
          const nc = c.col + dc;
          if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
            cells.add(`${nr},${nc}`);
          }
        }
      }
    });
  });
  return cells;
}

export function getDamagedShipCells(board: GameBoard): Set<string> {
  const cells = new Set<string>();
  board.ships.filter(s => !s.sunk && s.hits > 0).forEach(ship => {
    ship.cells.forEach(c => {
      if (board.shots.some(s => s.row === c.row && s.col === c.col)) {
        cells.add(`${c.row},${c.col}`);
      }
    });
  });
  return cells;
}

export function getHitCells(board: GameBoard): Set<string> {
  const cells = new Set<string>();
  board.ships.filter(s => !s.sunk && s.hits > 0).forEach(ship => {
    ship.cells.forEach(c => cells.add(`${c.row},${c.col}`));
  });
  return cells;
}
