import {
  combine,
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

export const winFx = createEffect(async () => {
  await timeout(1000);
  startNewGameFx();
});

export const loseFx = createEffect(async () => {
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
  .on([loseFx, winFx], (state, status) => GameStatuses.RESULTS)
  .on([loseFx.done, winFx.done], (state, status) => GameStatuses.DEAL)
  .reset(startNewGameFx);

const $dealerHasEnoughCards = combine(
  $dealerValue,
  $playerValue,
  (dealerValue, playerValue) => {
    const dealerHasEnoughCards =
      dealerValue > 16 && dealerValue < 21 && dealerValue > playerValue;

    return dealerHasEnoughCards;
  }
);

const dealerTurnDoneFx = createEffect(async enoughCards => {
  if (enoughCards) {
    loseFx();
  } else {
    await dealCardToDealerFx();
    dealerTurn();
  }
});

sample({
  source: { status: $status, dealerHasEnoughCards: $dealerHasEnoughCards },
  clock: dealerTurn,
  filter: ({ status }) => status === GameStatuses.DEALER_TURN,
  fn: ({ dealerHasEnoughCards }) => dealerHasEnoughCards,
  target: dealerTurnDoneFx
});

split({
  source: $dealerValue,
  match: {
    bust: value => value > 21,
    blackjack: value => value === 21
  },
  cases: {
    bust: winFx,
    blackjack: loseFx
  }
});

split({
  source: $playerValue,
  match: {
    bust: value => value > 21,
    blackjack: value => value === 21
  },
  cases: {
    bust: loseFx,
    blackjack: winFx
  }
});

export const $dealerScore = createStore(0).on(loseFx, value => value + 1);
export const $playerScore = createStore(0).on(winFx, value => value + 1);

function timeout(ms = process.env.NODE_ENV === "test" ? 0 : 500) {
  return new Promise(res => setTimeout(res, ms));
}
