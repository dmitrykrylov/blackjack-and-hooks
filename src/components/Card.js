import React, { useState, useEffect } from "react";
import { useSpring, animated as a } from "react-spring";
import block from "bem-jsx";

const C = block("Card", ["flipped", "suit"]);

function Card({ rank, suit, faceDown, className, style }) {
  const [flipped, setFlipped] = useState(false);

  const { transform, opacity } = useSpring({
    opacity: flipped ? 0 : 1,
    transform: `perspective(600px) rotateX(${flipped ? 0 : 180}deg)`,
    config: { mass: 5, tension: 500, friction: 80 }
  });

  let sign;

  if (suit === "S") sign = "♠";
  if (suit === "H") sign = "♥";
  if (suit === "D") sign = "♦";
  if (suit === "C") sign = "♣";

  useEffect(() => {
    if (!faceDown && !flipped) {
      setFlipped(true);
    }
  }, [faceDown]);

  return (
    <C className={className} suit={suit}>
      <C.Front
        as={a.div}
        style={{
          opacity: opacity.interpolate(o => 1 - o),
          transform
        }}
        faceDown={faceDown}
      >
        <C.Label>
          <C.Rank>{rank}</C.Rank>
          <C.Suit>{sign}</C.Suit>
        </C.Label>
      </C.Front>
      <C.Back
        as={a.div}
        style={{
          opacity,
          transform: transform.interpolate(t => `${t} rotateX(180deg)`)
        }}
      />
    </C>
  );
}

export default Card;
