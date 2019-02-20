const SUITS = ["H", "D", "S", "C"];
const RANKS = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K"
];

export default function getDeck(deck) {
  return RANKS.reduce(
    (acc, rank) => [...acc, ...SUITS.map(suit => ({ rank, suit }))],
    []
  );
}
