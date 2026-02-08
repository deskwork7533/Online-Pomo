const DURATIONS = {
  focus: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

const MODE_COLORS = {
  focus: "#fb7185",
  short: "#34d399",
  long: "#f59e0b",
};

const modeButtons = [...document.querySelectorAll(".mode-btn")];
const timeDisplay = document.getElementById("timeDisplay");
const statusText = document.getElementById("statusText");
const startPauseBtn = document.getElementById("startPauseBtn");
const resetBtn = document.getElementById("resetBtn");
const notifyBtn = document.getElementById("notifyBtn");
const completedCount = document.getElementById("completedCount");
const cycleCount = document.getElementById("cycleCount");
const ringProgress = document.getElementById("ringProgress");

const ringLength = 2 * Math.PI * 104;
ringProgress.style.strokeDasharray = String(ringLength);

let mode = "focus";
let seconds = DURATIONS[mode];
let timerId;
let running = false;
let completedFocus = 0;
let cycles = 0;

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const remainingSeconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

function render() {
  timeDisplay.textContent = formatTime(seconds);
  completedCount.textContent = String(completedFocus);
  cycleCount.textContent = String(cycles);
  statusText.textContent = running
    ? `${mode === "focus" ? "Focusing" : "Taking a break"}...`
    : "Ready to focus";

  const progress = (DURATIONS[mode] - seconds) / DURATIONS[mode];
  ringProgress.style.strokeDashoffset = String(ringLength * progress);
  ringProgress.style.stroke = MODE_COLORS[mode];

  modeButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });
}

function notify(title, body) {
  const beep = new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg");
  beep.play().catch(() => {});

  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body });
  }
}

function requestNotifications() {
  if (!("Notification" in window)) {
    notifyBtn.textContent = "Notifications Unsupported";
    notifyBtn.disabled = true;
    return;
  }

  Notification.requestPermission().then((permission) => {
    notifyBtn.textContent =
      permission === "granted" ? "Notifications Enabled" : "Notifications Blocked";
  });
}

function switchMode(nextMode) {
  mode = nextMode;
  seconds = DURATIONS[mode];
  stopTimer();
  render();
}

function stopTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = undefined;
  }
  running = false;
  startPauseBtn.textContent = "Start";
}

function advanceModeAfterCompletion() {
  if (mode === "focus") {
    completedFocus += 1;
    cycles += 1;
    switchMode(cycles % 4 === 0 ? "long" : "short");
    notify("Focus session complete!", "Time for a break.");
    return;
  }

  switchMode("focus");
  notify("Break complete!", "Get back to focused work.");
}

function tick() {
  if (seconds > 0) {
    seconds -= 1;
    render();
    return;
  }

  advanceModeAfterCompletion();
}

modeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    switchMode(btn.dataset.mode);
  });
});

startPauseBtn.addEventListener("click", () => {
  if (running) {
    stopTimer();
    render();
    return;
  }

  running = true;
  startPauseBtn.textContent = "Pause";
  timerId = setInterval(tick, 1000);
  render();
});

resetBtn.addEventListener("click", () => {
  seconds = DURATIONS[mode];
  stopTimer();
  render();
});

notifyBtn.addEventListener("click", requestNotifications);

if ("Notification" in window) {
  notifyBtn.textContent =
    Notification.permission === "granted" ? "Notifications Enabled" : "Enable Notifications";
}

render();
