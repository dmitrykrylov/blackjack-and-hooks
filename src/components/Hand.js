import React from "react";
import block from "bem-jsx";
import Card from "./Card";

const H = block("Hand", ["win", "lose", "push"]);

function Hand({ cards = [], blackjack, win, lose, testid }) {
  return (
    <H win={blackjack || win} lose={lose} data-testid={testid}>
      <H.Container>
        {cards.map((card, index) => (
          <H.Card
            as={Card}
            key={index}
            rank={card.rank}
            suit={card.suit}
            faceDown={card.faceDown}
          />
        ))}
        {win && <H.Result>WIN</H.Result>}
        {blackjack && <H.Result>BLACKJACK</H.Result>}
        {lose && <H.Result>LOSE</H.Result>}
      </H.Container>
    </H>
  );
}

export default Hand;
