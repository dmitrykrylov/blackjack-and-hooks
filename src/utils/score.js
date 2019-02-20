export default function score(cards) {
  // A flag to determine whether the hand has an ace
  let ace;

  let sum = cards.reduce((acc, card) => {
    let value = 0;

    if (card.rank === "J" || card.rank === "Q" || card.rank === "K") {
      value = 10;
    } else if (card.rank === "A") {
      value = 1;
      ace = true;
    } else {
      value = parseInt(card.rank, 10);
    }

    return acc + value;
  }, 0);

  // Treat the ace as an 11 if the hand will not bust
  if (ace && sum < 12) {
    sum += 10;
  }

  return sum;
}
