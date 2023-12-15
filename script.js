/**
 * Prize data will space out evenly on the deal wheel based on the amount of items available.
 * @param text [string] name of the prize
 * @param color [string] background color of the prize
 * @param reaction ['resting' | 'dancing' | 'laughing' | 'shocked'] Sets the reaper's animated reaction
 */
const prizes = [
  {
    text: "R100",
    color: "hsl(197 30% 43%)",
    reaction: "dancing",
    number:1
  },
  { 
    text: "Lose",
    color: "hsl(173 58% 39%)",
    reaction: "shocked",
    number:2
  },
  { 
    text: "R50",
    color: "hsl(43 74% 66%)",
    reaction: "shocked",
    number:3 
  },
  {
    text: "Lose",
    color: "hsl(27 87% 67%)",
    reaction: "shocked",
    number:4
  },
  {
    text: "R150",
    color: "hsl(12 76% 61%)",
    reaction: "dancing",
    number:5
  },
  {
    text: "Lose",
    color: "hsl(350 60% 52%)",
    reaction: "laughing",
    number:6
  },
  {
    text: "R250",
    color: "hsl(91 43% 54%)",
    reaction: "laughing",
    number:7
  },
  {
    text: "Lose",
    color: "hsl(140 36% 74%)",
    reaction: "dancing",
    number:8
  }
];

const wheel = document.querySelector(".deal-wheel");
const spinner = wheel.querySelector(".spinner");
const trigger = wheel.querySelector(".btn-spin");
const ticker = wheel.querySelector(".ticker");
const reaper = wheel.querySelector(".grim-reaper");
const prizeSlice = 360 / prizes.length;
const prizeOffset = Math.floor(180 / prizes.length);
const spinClass = "is-spinning";
const selectedClass = "selected";
const spinnerStyles = window.getComputedStyle(spinner);
let tickerAnim;
let rotation = 0;
let currentSlice = 0;
let prizeNodes;

const createPrizeNodes = () => {
  prizes.forEach(({ text, color, reaction }, i) => {
    const rotation = ((prizeSlice * i) * -1) - prizeOffset;
    
    spinner.insertAdjacentHTML(
      "beforeend",
      `<li class="prize" data-reaction=${reaction} style="--rotate: ${rotation}deg">
        <span class="text">${text}</span>
      </li>`
    );
  });
};

const createConicGradient = () => {
  spinner.setAttribute(
    "style",
    `background: conic-gradient(
      from -90deg,
      ${prizes
        .map(({ color }, i) => `${color} 0 ${(100 / prizes.length) * (prizes.length - i)}%`)
        .reverse()
      }
    );`
  );
};


const setupWheel = () => {
  createConicGradient();
  createPrizeNodes();
  prizeNodes = wheel.querySelectorAll(".prize");
};

const spinertia = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  angle=Math.floor(Math.random() * (max - min + 1)) + min;
  console.log("angle", angle);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const runTickerAnimation = () => {
  // https://css-tricks.com/get-value-of-css-rotation-through-javascript/
  const values = spinnerStyles.transform.split("(")[1].split(")")[0].split(",");
  const a = values[0];
  const b = values[1];  
  let rad = Math.atan2(b, a);
  
  if (rad < 0) rad += (2 * Math.PI);
  
  const angle = Math.round(rad * (180 / Math.PI));
  const slice = Math.floor(angle / prizeSlice);

  if (currentSlice !== slice) {
    ticker.style.animation = "none";
    setTimeout(() => ticker.style.animation = null, 10);
    currentSlice = slice;
  }

  tickerAnim = requestAnimationFrame(runTickerAnimation);
};

const selectPrize = () => {
  const selected = Math.floor(rotation / prizeSlice);
  prizeNodes[selected].classList.add(selectedClass);
  reaper.dataset.reaction = prizeNodes[selected].dataset.reaction;
};

const socket = io('https://brook-delicate-marmoset.glitch.me/');

trigger.addEventListener("click", () => {
  if (reaper.dataset.reaction !== "resting") {
    balance -= 10;
    const dynamicBalanceElement = document.getElementById('dynamic-balance');
    dynamicBalanceElement.textContent = balance;
    reaper.dataset.reaction = "resting";
  }

  trigger.disabled = true;

  
  const storedToken = localStorage.getItem('yourTokenKey');

  
  if (storedToken) {
    socket.emit("requestRotationValue", storedToken);
  } else {
    console.error('Token not found in local storage');
    alert("No token found go and login again!")
  }
});



socket.on("rotationValue", (receivedRotation) => {
  rotation = receivedRotation;
  prizeNodes.forEach((prize) => prize.classList.remove(selectedClass));
  wheel.classList.add(spinClass);
  spinner.style.setProperty("--rotate", rotation);
  ticker.style.animation = "none";
  runTickerAnimation();
});


spinner.addEventListener("transitionend", () => {
  cancelAnimationFrame(tickerAnim);
  trigger.disabled = false;
  trigger.focus();
  rotation %= 360;
  selectPrize();
  wheel.classList.remove(spinClass);
  spinner.style.setProperty("--rotate", rotation);
});

setupWheel();
