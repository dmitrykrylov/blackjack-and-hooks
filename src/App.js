import React, { useEffect } from "react";
import { useStore } from "effector-react";
import block from "bem-jsx";

import ActionButton from "./components/ActionButton";
import Hand from "./components/Hand";

import {
  $dealerHand,
  $dealerScore,
  $dealerValue,
  $gameResult,
  $playerHand,
  $playerScore,
  $playerValue,
  $status,
  GameResults,
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

  const gameResult = useStore($gameResult);

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
        win={gameResult === GameResults.DEALER_WIN}
        blackjack={gameResult === GameResults.DEALER_HAS_BLACKJACK}
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
        win={gameResult === GameResults.PLAYER_WIN}
        blackjack={gameResult === GameResults.PLAYER_HAS_BLACKJACK}
        lose={gameResult === GameResults.LOSE}
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
