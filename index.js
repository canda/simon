const buttons = [red, green, blue, yellow];

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

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

const randomColor = () => {
  const index = Math.floor(Math.random() * 4);
  return buttons[index];
};

const activateButton = async (button, time = 500) => {
  deactivateAll();
  button.classList.add('active');
  await timeout(time);
  deactivateAll();
};

const reproduceSequence = async (sequence) => {
  for (const button of sequence) {
    await activateButton(button);
    await timeout(100)
  }
};

const simonTurn = async (sequence) => {
  const newSequence = [...sequence, randomColor()];
  await reproduceSequence(newSequence);
  return newSequence;
};

const getUserSelection = async () => new Promise((resolve) => {
  buttons.forEach((button) => {
    button.onclick = async () => {
      buttons.forEach((b) => {
        b.onclick = null;
      });
      await activateButton(button);
      resolve(button);
    };
  });
});

/**
 * Listens for user selection
 * Returns whether the user pressed all the buttons in the correct order or not
 * @param {button[]} sequence Ordered array of buttons the user has to press
 */
const userTurn = async (sequence) => {
  for (const button of sequence) {
    const selectedButton = await getUserSelection();
    if (selectedButton !== button) {
      return false;
    }
  }
  return true;
};

const startGame = async () => {
  let success = true;
  let sequence = [];
  while (success) {
    sequence = await simonTurn(sequence);
    console.log('sequence', sequence.map(b => b.id));
    success = await userTurn(sequence);
    console.log('success', success);
    await timeout(500);
  }
  console.log('your score is', sequence.length - 1);
};

startGame();
