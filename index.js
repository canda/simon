const buttons = [red, green, blue, yellow];
const audioContext = new AudioContext();

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

const buttonTones = {
  red: 196.0,
  green: 220.0,
  blue: 246.9,
  yellow: 261.6
};

const activateAll = () => {
  buttons.forEach((button) => {
    button.classList.add('active');
  });
};

const deactivateAll = () => {
  buttons.forEach((button) => {
    button.classList.remove('active');
  });
};

const tone = (type, frequency, time) => {
  const oscilator = audioContext.createOscillator();
  const g = audioContext.createGain();
  oscilator.connect(g);
  oscilator.type = type;
  oscilator.frequency.value = frequency;
  g.connect(audioContext.destination);
  oscilator.start(0);
  g.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + (time / 1000));
};

const G4 = 440 * Math.pow(2, -2 / 12);
const A4 = 440;
const F4 = 440 * Math.pow(2, -4 / 12);
const F3 = 440 * Math.pow(2, -16 / 12);
const C4 = 440 * Math.pow(2, -9 / 12);

const loseSound = async (milisecondsTime) => {
  const oscilator = audioContext.createOscillator();
  const g = audioContext.createGain();
  oscilator.connect(g);

  const time = milisecondsTime / 1000;
  const { currentTime } = audioContext;

  oscilator.type = 'sine';
  oscilator.frequency.setValueAtTime(G4, currentTime);
  oscilator.frequency.setValueAtTime(G4, currentTime + ((time / 3) - (time / 20)));
  oscilator.frequency.exponentialRampToValueAtTime(A4, currentTime + (time / 3));
  oscilator.frequency.setValueAtTime(A4, currentTime + (((time * 2) / 3) - (time / 20)));
  oscilator.frequency.exponentialRampToValueAtTime(F4, currentTime + ((time * 2) / 3));

  g.connect(audioContext.destination);
  oscilator.start(0);
  await timeout(milisecondsTime - (milisecondsTime / 20));
  g.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + time);
};

const randomColor = () => {
  const index = Math.floor(Math.random() * 4);
  return buttons[index];
};

const activateButton = async (button, time = 500) => {
  deactivateAll();
  button.classList.add('active');
  tone('triangle', buttonTones[button.id], time);
  await timeout(time);
  deactivateAll();
};

const reproduceSequence = async (sequence, time) => {
  for (const button of sequence) {
    await activateButton(button, time);
    await timeout(100);
  }
};

const simonTurn = async (sequence, time) => {
  const newSequence = [...sequence, randomColor()];
  await reproduceSequence(newSequence, time);
  return newSequence;
};

const arrowToButton = {
  ArrowUp: red,
  ArrowDown: yellow,
  ArrowLeft: blue,
  ArrowRight: green
};

const getUserSelection = async time => new Promise((resolve) => {
  buttons.forEach((button) => {
    button.onclick = async () => {
      buttons.forEach((b) => {
        b.onclick = null;
      });
      await activateButton(button, time);
      resolve(button);
    };
  });
  window.onkeydown = async ({ key }) => {
    window.onkeydown = null;
    const button = arrowToButton[key];
    await activateButton(button, time);
    resolve(button);
  };
});

/**
 * Listens for user selection
 * Returns whether the user pressed all the buttons in the correct order or not
 * @param {button[]} sequence Ordered array of buttons the user has to press
 */
const userTurn = async (sequence, time) => {
  for (const button of sequence) {
    const selectedButton = await getUserSelection(time);
    if (selectedButton !== button) {
      return false;
    }
  }
  return true;
};

const lose = async () => {
  loseSound(3000);
  activateAll();
  await timeout(1000);
  deactivateAll();
  await timeout(1000);
  activateAll();
  await timeout(1000);
  deactivateAll();
};

const newGame = async () => {
  let success = true;
  let sequence = [];
  let time = 2500;
  while (success) {
    sequence = await simonTurn(sequence, time);
    console.log('sequence', sequence.map(b => b.id));
    success = await userTurn(sequence, time);
    console.log('success', success);
    if (!success) {
      await lose();
    }
    await timeout(500);
    const GOLDEN_RATIO = 1.618033988749895;
    time /= GOLDEN_RATIO;
  }
  console.log('your score is', sequence.length - 1);
};

const startGame = async () => {
  while (true) {
    await newGame();
  }
};

startGame();
