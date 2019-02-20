import React, { useEffect, useMemo } from "react";
import shuffle from "lodash/shuffle";
import block from "bem-jsx";

import ActionButton from "./components/ActionButton";
import Hand from "./components/Hand";
import score from "./utils/score";
import getDeck from "./utils/getDeck";
import useStateWithActions from "./hooks/useStateWithActions";

import "./App.scss";

/* 
// DEAL - Initial or following card deals. Buttons should be disabled
// PLAYER_TURN - Hit/Stand buttons are enabled
// DEALER_TURN - Program "listens" when dealer receives a card and
//               decides whether dealer should take one more card
// RESULTS - Show a popup that tells whether user won/lost
 */
const GameStatuses = {
  DEAL: "deal",
  PLAYER_TURN: "player-turn",
  DEALER_TURN: "dealer-turn",
  RESULTS: "results"
};

const initialState = {
  deck: shuffle(getDeck()),
  dealerHand: [],
  playerHand: [],
  dealerScore: 0,
  playerScore: 0,
  status: GameStatuses.DEAL
};

const handlers = {
  reset: state => () => ({
    ...state,
    deck: shuffle(getDeck()),
    dealerHand: [],
    playerHand: []
  }),
  dealCardToDealer: state => (faceDown = false) => {
    return {
      ...state,
      deck: state.deck.slice(0, -1),
      dealerHand: [
        ...state.dealerHand,
        { ...state.deck.slice(-1)[0], faceDown }
      ]
    };
  },
  dealCardToPlayer: state => (faceDown = false) => ({
    ...state,
    deck: state.deck.slice(0, -1),
    playerHand: [...state.playerHand, { ...state.deck.slice(-1)[0], faceDown }]
  }),
  revealDealerSecondCard: state => () => ({
    ...state,
    dealerHand: [
      state.dealerHand[0],
      { ...state.dealerHand[1], faceDown: false }
    ]
  }),
  lose: state => () => ({
    ...state,
    status: GameStatuses.RESULTS,
    dealerScore: state.dealerScore + 1
  }),
  win: state => () => ({
    ...state,
    status: GameStatuses.RESULTS,
    playerScore: state.playerScore + 1
  }),
  setStatus: state => status => ({
    ...state,
    status
  })
};

const A = block("App", ["theme"]);
const Values = block("Values", ["unknown"]);
const Score = block("Score");

function App() {
  const [state, actions] = useStateWithActions(handlers, initialState);
  const { status, dealerHand, playerHand, dealerScore, playerScore } = state;

  // Let's make hand values to be recomputed automatically after hands change
  const dealerValue = useMemo(() => score(dealerHand), [dealerHand]);
  const playerValue = useMemo(() => score(playerHand), [playerHand]);

  const dealerHasBlackjack = dealerValue === 21;
  const playerHasBlackjack = playerValue === 21;

  const dealerHasBust = dealerValue > 21;
  const playerHasBust = playerValue > 21;

  const dealerHasEnoughCards =
    dealerValue > 16 && dealerValue < 21 && dealerValue > playerValue;

  // Deal cards after component mount
  useEffect(() => {
    setTimeout(() => {
      deal();
    }, 1000);
  }, []);

  // If turn is moving to player, check player's cards
  useEffect(() => {
    if (status === GameStatuses.PLAYER_TURN) {
      if (playerHasBust) {
        actions.lose();
      } else if (playerHasBlackjack) {
        actions.win();
      } else {
        actions.setStatus(GameStatuses.PLAYER_TURN);
      }
    }
  }, [status]);

  // Check dealer takes an additional card, check dealer's cards
  // * It doesn't make sense to divide dealer's turn
  //   into "deal" and "dealer-turn" steps
  useEffect(() => {
    if (status === GameStatuses.DEALER_TURN) {
      checkDealerStatus();
    }
  }, [dealerValue]);

  // Redeal after end of each round
  useEffect(() => {
    if (dealerScore > 0 || playerScore > 0) {
      setTimeout(() => {
        deal();
      }, 1000);
    }
  }, [dealerScore, playerScore]);

  async function deal() {
    actions.reset();
    actions.setStatus(GameStatuses.DEAL);

    await dealCardToPlayer();
    await dealCardToDealer();
    await dealCardToPlayer();
    await dealCardToDealer(true);

    actions.setStatus(GameStatuses.PLAYER_TURN);
  }

  async function hit() {
    actions.setStatus(GameStatuses.DEAL);
    await dealCardToPlayer();
    actions.setStatus(GameStatuses.PLAYER_TURN);
  }

  async function stand() {
    actions.setStatus(GameStatuses.DEALER_TURN);
    actions.revealDealerSecondCard();
    checkDealerStatus();
  }

  async function checkDealerStatus() {
    await timeout();
    if (dealerHasBust) {
      actions.win();
    } else if (dealerHasBlackjack) {
      actions.lose();
    } else if (dealerHasEnoughCards) {
      actions.lose();
    } else {
      dealCardToDealer();
    }
  }

  function dealCardToDealer(faceDown) {
    return new Promise(async resolve => {
      actions.dealCardToDealer(faceDown);
      await timeout();
      resolve();
    });
  }

  function dealCardToPlayer() {
    return new Promise(async resolve => {
      actions.dealCardToPlayer();
      await timeout();
      resolve();
    });
  }

  const dealerHasRevealed = dealerHand[1] && !dealerHand[1].faceDown;

  return (
    <A dark>
      <A.DealerScore as={Score}>
        <Score.Label>Dealer</Score.Label>
        <Score.Value>{dealerScore}</Score.Value>
      </A.DealerScore>
      <A.PlayerScore as={Score}>
        <Score.Label>Player</Score.Label>
        <Score.Value>{playerScore}</Score.Value>
      </A.PlayerScore>
      <Hand
        cards={dealerHand}
        win={status === GameStatuses.RESULTS && dealerHasEnoughCards}
        blackjack={status === GameStatuses.RESULTS && dealerHasBlackjack}
      />
      <Values>
        <Values.DealerValue unknown={!dealerHasRevealed}>
          {dealerHasRevealed ? dealerValue : "?"}
        </Values.DealerValue>
        <Values.Divider as="hr" />
        <Values.PlayerValue>{playerValue}</Values.PlayerValue>
      </Values>
      <Hand
        cards={playerHand}
        win={status === GameStatuses.RESULTS && dealerHasBust}
        blackjack={status === GameStatuses.RESULTS && playerHasBlackjack}
        lose={status === GameStatuses.RESULTS && playerHasBust}
      />
      <A.HitButton
        as={ActionButton}
        disabled={status !== GameStatuses.PLAYER_TURN}
        onClick={hit}
      >
        Hit
      </A.HitButton>
      <A.StandButton
        as={ActionButton}
        disabled={status !== GameStatuses.PLAYER_TURN}
        onClick={stand}
      >
        Stand
      </A.StandButton>
    </A>
  );
}

function timeout(ms = 500) {
  return new Promise(res => setTimeout(res, ms));
}

export default App;
