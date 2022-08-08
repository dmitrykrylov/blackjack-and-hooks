import React, { useEffect } from "react";
import { useStore } from "effector-react";
import block from "bem-jsx";

import ActionButton from "./components/ActionButton";
import Hand from "./components/Hand";

import {
  $dealerHand,
  $dealerScore,
  $dealerValue,
  $playerHand,
  $playerScore,
  $playerValue,
  $status,
  GameStatuses,
  hit,
  stand,
  startNewGameFx
} from "./model";

import "./App.scss";

const A = block("App", ["theme"]);
const Values = block("Values", ["unknown"]);
const Score = block("Score");

function App({ deck }) {
  useEffect(() => {
    startNewGameFx(deck);
  }, []);

  const dealerHand = useStore($dealerHand);
  const playerHand = useStore($playerHand);

  const status = useStore($status);

  const dealerScore = useStore($dealerScore);
  const playerScore = useStore($playerScore);

  const dealerValue = useStore($dealerValue);
  const playerValue = useStore($playerValue);

  const dealerHasBlackjack = dealerValue === 21;
  const playerHasBlackjack = playerValue === 21;

  const dealerHasBust = dealerValue > 21;
  const playerHasBust = playerValue > 21;

  const dealerHasEnoughCards =
    dealerValue > 16 && dealerValue < 21 && dealerValue > playerValue;

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
        testid="dealer-hand"
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
        testid="player-hand"
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

export default App;
