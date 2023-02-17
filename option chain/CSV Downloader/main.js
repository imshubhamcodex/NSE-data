chrome.runtime.onMessage.addListener(startProcess);
let inv = null;
let prevMin = -99;

function startProcess(signal) {
  if (signal) {
    let time = new Date().toString().split(" ")[4];

    min = time.split(":")[1];

    let r = Number(min) % 5;
    if (r !== 0) {
      setTimeout(() => {
        run();
        inv = setInterval(run, 5 * 1000);
      }, (5 - r) * 60 * 1000);
    } else {
      run();
      inv = setInterval(run, 5 * 1000);
    }
  }
}

function run() {
  let time = new Date().toString().split(" ")[4];
  let hr = time.split(":")[0];
  let min = time.split(":")[1];

  if (hr >= 15 && min >= 40) {
    clearInterval(inv);
    return;
  }

  let r = Number(min) % 5;

  if (r == 0 && Number(min) !== prevMin) {
   prevMin = Number(min);
   document
    .getElementById("equity_underlyingVal")
    .parentNode.children[2].children[0].click();
     setTimeout(start, 10 * 1000);
  }
  
}

function start() {
  document.getElementById("downloadOCTable").click();
}
