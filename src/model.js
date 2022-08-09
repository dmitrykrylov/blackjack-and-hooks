import {
  createEffect,
  createEvent,
  createStore,
  sample,
  split
} from "effector";

import score from "./utils/score";
import getDeck from "./utils/getDeck";
import shuffle from "lodash/shuffle";

export const GameStatuses = {
  DEAL: "deal",
  PLAYER_TURN: "player-turn",
  DEALER_TURN: "dealer-turn",
  RESULTS: "results"
};
export const GameResults = {
  DEALER_HAS_BLACKJACK: "dealerHasBlackjack",
  PLAYER_HAS_BLACKJACK: "playerHasBlackjack",
  PLAYER_WIN: "playerWin",
  DEALER_WIN: "dealerWin",
  LOSE: "lose"
};

export const endGameFx = createEffect(async () => {
  await timeout(1000);
  startNewGameFx();
});

export const putCardIntoDealerHand = createEvent();
export const putCardIntoPlayerHand = createEvent();
export const revealDealerSecondCard = createEvent();
export const setStatus = createEvent();

const dealCardToDealerFx = createEffect(faceDown => {
  return new Promise(async resolve => {
    await timeout();
    resolve(faceDown);
  });
});

const dealCardToPlayerFx = createEffect(() => {
  return new Promise(async resolve => {
    await timeout();
    resolve();
  });
});

export const startNewGameFx = createEffect(async () => {
  setStatus(GameStatuses.DEAL);

  await dealCardToPlayerFx();
  await dealCardToDealerFx();
  await dealCardToPlayerFx();
  await dealCardToDealerFx(true);

  setStatus(GameStatuses.PLAYER_TURN);
});

export const hit = createEffect(async () => {
  setStatus(GameStatuses.DEAL);

  await dealCardToPlayerFx();

  setStatus(GameStatuses.PLAYER_TURN);
});

export const dealerTurn = createEvent();

export const stand = createEffect(async () => {
  setStatus(GameStatuses.DEAL);

  revealDealerSecondCard();

  await timeout();

  setStatus(GameStatuses.DEALER_TURN);

  dealerTurn();
});

export const $deck = createStore([])
  .on(startNewGameFx, (state, newDeck) => newDeck ?? shuffle(getDeck()))
  .on([putCardIntoDealerHand, putCardIntoPlayerHand], deck =>
    deck.slice(0, -1)
  );

sample({
  clock: dealCardToPlayerFx,
  source: $deck,
  fn: deck => deck[deck.length - 1],
  target: putCardIntoPlayerHand
});

sample({
  clock: dealCardToDealerFx,
  source: $deck,
  fn: (deck, faceDown) => ({ ...deck[deck.length - 1], faceDown }),
  target: putCardIntoDealerHand
});

export const $dealerHand = createStore([])
  .on(putCardIntoDealerHand, (deck, card) => [...deck, card])
  .on(revealDealerSecondCard, deck => [
    deck[0],
    { ...deck[1], faceDown: false }
  ])
  .reset(startNewGameFx);

export const $playerHand = createStore([])
  .on(putCardIntoPlayerHand, (deck, card) => [...deck, card])
  .reset(startNewGameFx);

export const $dealerValue = $dealerHand.map(hand => score(hand));
export const $playerValue = $playerHand.map(hand => score(hand));

$dealerValue.watch(dealerValue => ({ dealerValue }));
$playerValue.watch(playerValue => ({ playerValue }));

export const $status = createStore(GameStatuses.DEAL)
  .on(setStatus, (state, status) => status)
  .on(endGameFx, (state, status) => GameStatuses.RESULTS)
  .on(endGameFx.done, (state, status) => GameStatuses.DEAL)
  .reset(startNewGameFx);

export const $gameResult = createStore(null)
  .on(endGameFx, (state, result) => result)
  .reset(startNewGameFx);

const checkDealerHandFx = createEffect(async ({ dealerValue, playerValue }) => {
  const dealerHasBust = dealerValue > 21;
  const dealerHasBlackjack = dealerValue === 21;
  const dealerHasEnoughCards =
    dealerValue > 16 && dealerValue < 21 && dealerValue > playerValue;

  if (dealerHasBlackjack) {
    endGameFx(GameResults.DEALER_HAS_BLACKJACK);
  } else if (dealerHasEnoughCards) {
    endGameFx(GameResults.DEALER_WIN);
  } else if (dealerHasBust) {
    endGameFx(GameResults.PLAYER_WIN);
  } else {
    await dealCardToDealerFx();
    dealerTurn();
  }
});

const checkPlayerHandFx = createEffect(playerValue => {
  const playerHasBust = playerValue > 21;
  const playerHasBlackjack = playerValue === 21;

  if (playerHasBlackjack) {
    endGameFx(GameResults.PLAYER_HAS_BLACKJACK);
  } else if (playerHasBust) {
    endGameFx(GameResults.LOSE);
  }
});

sample({
  source: {
    status: $status,
    dealerValue: $dealerValue,
    playerValue: $playerValue
  },
  clock: dealerTurn,
  filter: ({ status }) => status === GameStatuses.DEALER_TURN,
  fn: ({ dealerValue, playerValue }) => ({ dealerValue, playerValue }),
  target: checkDealerHandFx
});

sample({
  source: $playerValue,
  target: checkPlayerHandFx
});

export const $dealerScore = createStore(0).on(endGameFx, (value, result) =>
  [GameResults.DEALER_HAS_BLACKJACK, GameResults.LOSE].includes(result)
    ? value + 1
    : value
);
export const $playerScore = createStore(0).on(endGameFx, (value, result) =>
  ![GameResults.DEALER_HAS_BLACKJACK, GameResults.LOSE].includes(result)
    ? value + 1
    : value
);

function timeout(ms = process.env.NODE_ENV === "test" ? 0 : 500) {
  return new Promise(res => setTimeout(res, ms));
}
