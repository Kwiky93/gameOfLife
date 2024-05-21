let cnv, inputPing, inputCount, lifeController;
let process = "stop";
let speed = 200;
// let mouseZoom = 1;
let drawStart = Date.now();

function draw() {
  let now = Date.now();
  let delta = now - drawStart;
  const start = new Date().getTime();
  if (process === "run" && delta > speed) {
    lifeController.stepLife();
    drawStart = Date.now();
  }
  if (process !== "run") {
    lifeController.stepLife();
  }
  const end = new Date().getTime();
  inputPing.value = end - start + "ms";

  if (process === "run") {
    requestAnimationFrame(draw);
  }
}

function setCanvasSize() {
  const rows = Math.floor(parseInt(document.querySelector("input#rows").value));
  const cols = Math.floor(parseInt(document.querySelector("input#cols").value));
  const size = 10;
  lifeController = new LifeController(cnv, rows, cols, size);
}

window.onload = function () {
  cnv = document.querySelector("canvas#canvas");
  inputPing = document.querySelector("input#ping");
  inputCount = document.querySelector("input#count");
  setCanvasSize();

  cnv.addEventListener("onChangeCountLives", () => {
    inputCount.value = lifeController.countLives;
  });

  document.getElementById("btn_run").onclick = (ev) => {
    process = process == "stop" ? "run" : "stop";
    btn_run.innerText = process == "stop" ? "Run" : "Stop";
    draw();
  };

  document.getElementById("btn_step").onclick = (ev) => {
    draw();
  };

  document.getElementById("btn_clear").onclick = (ev) => {
    lifeController.clear();
  };

  document.getElementById("btn_generate").onclick = (ev) => {
    lifeController.generateByPercent();
  };

  document.getElementById("btn_size").onclick = (ev) => {
    setCanvasSize();
  };

  // function zoomer() {
  //   let sizeZoom = 0;
  //   const ZOOM = 1.25;

  //   return (event) => {
  //     event.preventDefault();
  //     let newSize;
  //     if (event.wheelDelta > 0) {
  //       newSize = ZOOM;
  //       if (sizeZoom + 1 <= 5) {
  //         sizeZoom++;
  //         ctx.scale(newSize, newSize);
  //         mouseZoom *= newSize;
  //         // cnv.height *= newSize;
  //         // cnv.width *= newSize;
  //       }
  //     } else {
  //       newSize = 1 / ZOOM;
  //       if (sizeZoom - 1 >= -5) {
  //         sizeZoom--;
  //         ctx.scale(newSize, newSize);
  //         mouseZoom *= newSize;
  //         // cnv.height *= newSize;
  //         // cnv.width *= newSize;
  //       }
  //     }
  //     // ctx.clearRect(0, 0, ctx.width, ctx.height);
  //     drawBackground();
  //     draw();
  //   };
  // }

  // cnv.onwheel = zoomer();
};
