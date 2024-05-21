class LifeController {
  constructor(cnv, rows, cols, size) {
    this.cnv = cnv;
    this.ctx = cnv.getContext("2d");
    this.board = [];
    this.rows = rows || 100;
    this.cols = cols || 100;
    this.size = size || 10;
    this.canvasPadding = 5;
    this.cnv.height = this.rows * this.size + 2 * this.canvasPadding;
    this.cnv.width = this.cols * this.size + 2 * this.canvasPadding;
    this.countLives = 0;
    this.steps = 0;
    this.timeExecution = 0;

    this.cnv_drawBackground();
    this.setEvents();

    this.event_onCountLives = new CustomEvent("onCountLives");
    this.event_onTimeExecution = new CustomEvent("onTimeExecution");
    this.event_onCountSteps = new CustomEvent("onCountSteps");
  }

  setEvents() {
    this.cnv.onclick = (ev) => {
      const x = ev.offsetX - this.canvasPadding;
      const y = ev.offsetY - this.canvasPadding;
      const r = Math.floor(y / this.size);
      const c = Math.floor(x / this.size);
      this.createPoint(r, c);
      // drop();
    };
  }

  cnv_drawBackground() {
    const draw = () => {
      this.ctx.strokeStyle = "red";
      this.ctx.strokeRect(0, 0, this.cnv.width, this.cnv.height);

      for (let r = 0; r < this.rows; r++) {
        this.board[r] = [];
        for (let c = 0; c < this.cols; c++) {
          this.board[r][c] = false;
          this.cnv_drawBorder(r, c);
        }
      }
    };
    requestAnimationFrame(draw);
  }

  cnv_drawBorder(r, c) {
    this.ctx.strokeStyle = "grey";
    this.ctx.strokeRect(
      this.canvasPadding + c * this.size,
      this.canvasPadding + r * this.size,
      this.size,
      this.size
    );
  }

  cnv_drawSquare(r, c, color) {
    this.countLives++;
    this.ctx.fillStyle = color || "black";
    this.ctx.fillRect(
      this.canvasPadding + c * this.size + 1,
      this.canvasPadding + r * this.size + 1,
      this.size - 2,
      this.size - 2
    );
  }

  cnv_clearCell(r, c) {
    this.countLives--;
    this.ctx.clearRect(
      this.canvasPadding + c * this.size + 1,
      this.canvasPadding + r * this.size + 1,
      this.size - 2,
      this.size - 2
    );
    // this.cnv_drawSquare(r, c, "white");
  }

  clear() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.board[r][c]) {
          this.board[r][c] = false;
          this.cnv_clearCell(r, c);
        }
      }
    }
    this.steps = 0;
    this.timeExecution = 0;
    this.countLives = 0;
    this.cnv.dispatchEvent(this.event_onCountLives);
    this.cnv.dispatchEvent(this.event_onTimeExecution);
    this.cnv.dispatchEvent(this.event_onCountSteps);
  }

  validCoordinates(coordinate) {
    coordinate.r =
      coordinate.r < 0 ? this.rows + coordinate.r : coordinate.r % this.rows;
    coordinate.c =
      coordinate.c < 0 ? this.cols + coordinate.c : coordinate.c % this.cols;
    return coordinate;
  }

  createPoint(r, c) {
    if (!this.board[r][c]) {
      this.board[r][c] = true;
      this.cnv_drawSquare(r, c);
    } else {
      this.board[r][c] = false;
      this.cnv_clearCell(r, c);
    }

    this.cnv.dispatchEvent(this.event_onChangeCountLives);
  }

  isEmptycell(r, c) {
    return !this.board.at(r % this.rows).at(c % this.cols);
  }

  isNewLife(r, c) {
    const countLife = this.countLifesAround(r, c);
    return countLife === 3 ? true : false;
  }

  isContinueLife(r, c) {
    const countLife = this.countLifesAround(r, c);
    return countLife === 2 || countLife === 3 ? true : false;
  }

  countLifesAround(r, c) {
    return (
      this.board.at((r - 1) % this.rows).at((c - 1) % this.cols) +
      this.board.at((r - 1) % this.rows).at(c % this.cols) +
      this.board.at((r - 1) % this.rows).at((c + 1) % this.cols) +
      this.board.at(r % this.rows).at((c - 1) % this.cols) +
      this.board.at(r % this.rows).at((c + 1) % this.cols) +
      this.board.at((r + 1) % this.rows).at((c - 1) % this.cols) +
      this.board.at((r + 1) % this.rows).at(c % this.cols) +
      this.board.at((r + 1) % this.rows).at((c + 1) % this.cols)
    );
  }

  // stepLife() {
  //   const newBoard = [];
  //   for (let r = 0; r < this.rows; r++) {
  //     newBoard[r] = [];
  //     for (let c = 0; c < this.cols; c++) {
  //       if (this.board[r][c]) {
  //         if (!this.isContinueLife(r, c)) {
  //           newBoard[r][c] = false;
  //           this.cnv_clearCell(r, c);
  //         } else {
  //           newBoard[r][c] = true;
  //         }
  //       } else {
  //         if (this.isNewLife(r, c)) {
  //           newBoard[r][c] = true;
  //           this.cnv_drawSquare(r, c);
  //         } else {
  //           newBoard[r][c] = false;
  //         }
  //       }
  //     }
  //   }
  //   this.board = newBoard;
  //   this.cnv.dispatchEvent(this.event_onChangeCountLives);
  //   this.cnv.dispatchEvent(this.event_onChangeTimeExecution);
  // }

  async stepLife() {
    const newBoard = [];
    const DELIMETER = 100;
    const r = Math.ceil(this.rows / DELIMETER);
    const c = Math.ceil(this.cols / DELIMETER);
    const arrPromises = [];

    for (let rBox = 0; rBox < r; rBox++) {
      for (let cBox = 0; cBox < c; cBox++) {
        arrPromises.push(
          new Promise((resolve) => {
            setTimeout(() => {
              const start = new Date().getTime();
              if (rBox != r - 1) {
                this.stepLifeByBox(
                  newBoard,
                  rBox * DELIMETER,
                  cBox * DELIMETER,
                  (rBox + 1) * DELIMETER,
                  (cBox + 1) * DELIMETER
                );
              } else {
                this.stepLifeByBox(
                  newBoard,
                  rBox * DELIMETER,
                  cBox * DELIMETER,
                  this.rows,
                  this.cols
                );
              }
              const end = new Date().getTime();
              resolve(end - start);
            });
          })
        );
      }
    }
    await Promise.all(arrPromises).then((results) => {
      this.board = newBoard;
      this.timeExecution = 0;
      results.forEach((num) => (this.timeExecution += num));
      this.steps++;
      this.cnv.dispatchEvent(this.event_onCountLives);
      this.cnv.dispatchEvent(this.event_onTimeExecution);
      this.cnv.dispatchEvent(this.event_onCountSteps);
    });
  }

  stepLifeByBox(newBoard, rStart, cStart, rStop, cStop) {
    for (let r = rStart; r < rStop; r++) {
      if (!newBoard[r]) {
        newBoard[r] = [];
      }
      for (let c = cStart; c < cStop; c++) {
        if (this.board[r][c]) {
          if (!this.isContinueLife(r, c)) {
            newBoard[r][c] = false;
            this.cnv_clearCell(r, c);
          } else {
            newBoard[r][c] = true;
          }
        } else {
          if (this.isNewLife(r, c)) {
            newBoard[r][c] = true;
            this.cnv_drawSquare(r, c);
          } else {
            newBoard[r][c] = false;
          }
        }
      }
    }
  }

  generateByPercent(percent = 20) {
    for (let r = 0; r < this.rows; r++) {
      this.board[r] = [];
      for (let c = 0; c < this.cols; c++) {
        if (Math.floor(Math.random() * 100) % Math.floor(100 / percent) === 0) {
          this.board[r][c] = true;
          this.cnv_drawSquare(r, c);
        } else {
          this.board[r][c] = false;
        }
      }
    }
    this.cnv.dispatchEvent(this.event_onCountLives);
  }
}
