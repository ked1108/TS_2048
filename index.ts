"use strict";

class Game2048 {
    private gridSize: number = 4;
    private grid: number[][];
    private score: number = 0;
    private gameOver: boolean = false;
    private canvas: HTMLCanvasElement | null;
    private context: CanvasRenderingContext2D | null;
    private scoreElement: HTMLElement | null;
    private gameOverElement: HTMLElement | null;

    constructor(canvas: HTMLCanvasElement) {
	if(canvas === null) throw new Error("Canvas ain't available");
        this.canvas = canvas;
	canvas.width = 800;
	canvas.height = 800;
        this.context = this.canvas.getContext("2d")!;
	if(this.context === null) throw new Error("Context2d ain't available")
        this.grid = this.createEmptyGrid();

	this.scoreElement = document.getElementById('score') as HTMLElement | null;
        this.gameOverElement = document.getElementById('gameOver') as HTMLElement | null;

	console.log(this.grid);
	this.updateScore();


        this.addRandomTile();
        this.addRandomTile();
        this.draw();

	this.startGame();
	window.addEventListener("keydown", (e) => this.handleKeyPress(e))
    }

    private startGame() {
        this.grid = this.createEmptyGrid();
	this.gameOver = false;


        this.addRandomTile();
        this.addRandomTile();
        this.draw();
    }

    private updateScore() {
	if(this.scoreElement === null) throw new Error("Null Element");
        this.scoreElement.innerText = `Score: ${this.score}`;
    }

    private endGame() {
        this.gameOver = true;
	if(this.gameOverElement === null) throw new Error("Null Element");
        this.gameOverElement.style.display = "block";
    }

    private createEmptyGrid(): number[][] {
        return Array(this.gridSize).fill(0).map(() => Array(this.gridSize).fill(0));
    }

    private addRandomTile() {
        const emptyTiles: { x: number, y: number }[] = [];
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] === 0) {
                    emptyTiles.push({ x: i, y: j });
                }
            }
        }

        if (emptyTiles.length > 0) {
            const { x, y } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
            this.grid[x][y] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    public draw() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const tileSize = this.canvas.width / this.gridSize;

        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                this.drawTile(i, j, tileSize);
            }
        }

	this.updateScore();
	if (this.isGameOver()) {
            this.endGame();
        }
    }

    private drawTile(i: number, j: number, tileSize: number) {
        const value = this.grid[i][j];
        this.context.fillStyle = value ? this.getTileColor(value) : "#cdc1b4";
        this.context.fillRect(j * tileSize, i * tileSize, tileSize - 5, tileSize - 5);
        
        if (value) {
            this.context.fillStyle = "#776e65";
            this.context.font = "bold 40px Arial";
            this.context.textAlign = "center";
            this.context.textBaseline = "middle";
            this.context.fillText(value.toString(), j * tileSize + tileSize / 2, i * tileSize + tileSize / 2);
        }
    }

    private getTileColor(value: number): string {
        switch (value) {
            case 2: return "#eee4da";
            case 4: return "#ede0c8";
            case 8: return "#f2b179";
            case 16: return "#f59563";
            case 32: return "#f67c5f";
            case 64: return "#f65e3b";
            case 128: return "#edcf72";
            case 256: return "#edcc61";
            case 512: return "#edc850";
            case 1024: return "#edc53f";
            case 2048: return "#edc22e";
            default: return "#3c3a32";
        }
    }

    private handleKeyPress(event: KeyboardEvent) {
	console.log(event)
        let moved = false;
        switch (event.key) {
            case "ArrowUp":
                moved = this.moveUp();
                break;
            case "ArrowDown":
                moved = this.moveDown();
                break;
            case "ArrowLeft":
                moved = this.moveLeft();
                break;
            case "ArrowRight":
                moved = this.moveRight();
                break;
        }
        if (moved) {
            this.addRandomTile();
            this.draw();
        }
    }

    private moveLeft() {
        let moved = false;
        for (let i = 0; i < this.gridSize; i++) {
            const row = this.grid[i];
            const newRow = this.combineTiles(row);
            if (!this.areArraysEqual(row, newRow)) {
                this.grid[i] = newRow;
                moved = true;
            }
        }
        return moved;
    }

    private moveRight() {
        let moved = false;
        for (let i = 0; i < this.gridSize; i++) {
            const row = [...this.grid[i]].reverse();
            const newRow = this.combineTiles(row).reverse();
            if (!this.areArraysEqual(this.grid[i], newRow)) {
                this.grid[i] = newRow;
                moved = true;
            }
        }
        return moved;
    }

    private moveUp() {
        let moved = false;
        for (let j = 0; j < this.gridSize; j++) {
            const col = this.grid.map(row => row[j]);
            const newCol = this.combineTiles(col);
            if (!this.areArraysEqual(col, newCol)) {
                for (let i = 0; i < this.gridSize; i++) {
                    this.grid[i][j] = newCol[i];
                }
                moved = true;
            }
        }
        return moved;
    }

    private moveDown() {
        let moved = false;
        for (let j = 0; j < this.gridSize; j++) {
            const col = this.grid.map(row => row[j]).reverse();
            const newCol = this.combineTiles(col).reverse();
            if (!this.areArraysEqual(this.grid.map(row => row[j]), newCol)) {
                for (let i = 0; i < this.gridSize; i++) {
                    this.grid[i][j] = newCol[i];
                }
                moved = true;
            }
        }
        return moved;
    }

    private combineTiles(row) {
	let newRow = row.filter(v => v !== 0);

	for (let i = 0; i < newRow.length - 1; i++) {
	    if (newRow[i] === newRow[i + 1]) {
		newRow[i] *= 2;
		this.score += newRow[i]; // Add score
		newRow[i + 1] = 0; // Mark the next tile as 0 after merging
	    }
	}

	newRow = newRow.filter(v => v !== 0);
	return [...newRow, ...Array(this.gridSize - newRow.length).fill(0)];
    }


    private areArraysEqual(arr1, arr2) {
        return arr1.every((value, index) => value === arr2[index]);
    }

    private isGameOver() {
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] === 0) return false;
            }
        }

        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (i < this.gridSize - 1 && this.grid[i][j] === this.grid[i + 1][j]) return false;
                if (j < this.gridSize - 1 && this.grid[i][j] === this.grid[i][j + 1]) return false;
            }
        }

        return true;
    }
}

window.onload = () => {
    const canvas = document.getElementById('game');
    new Game2048(canvas);
};

