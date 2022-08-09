import React from "react";
import App from "./App";
import "@testing-library/jest-dom";
import { render, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { fork } from "effector";

jest.useFakeTimers();

afterEach(() => {
  jest.clearAllTimers();
});

function renderApp(deck) {
  const view = render(<App deck={deck} />);

  const hit = view.getByTestId("Hit");
  const stand = view.getByTestId("Stand");

  const waitForPlayerTurn = () =>
    waitFor(() => {
      expect(stand).toBeEnabled();
    });

  return { ...view, hit, stand, waitForPlayerTurn };
}

test("player wins", async () => {
  const view = renderApp([
    { rank: "10", suit: "S" },
    { rank: "9", suit: "H" }, // D2
    { rank: "10", suit: "H" }, // P1
    { rank: "9", suit: "D" }, // D2
    { rank: "10", suit: "D" } // P1
  ]);

  await view.waitForPlayerTurn();

  fireEvent.click(view.stand);

  const playerHand = view.getByTestId("player-hand");
  const message = await view.findByText(/win/i);

  expect(playerHand).toContainElement(message);
});

test("dealer wins", async () => {
  const view = renderApp([
    { rank: "10", suit: "S" },
    { rank: "10", suit: "H" }, // D1
    { rank: "9", suit: "H" }, // P2
    { rank: "10", suit: "D" }, // D1
    { rank: "9", suit: "D" } // P1
  ]);

  await view.waitForPlayerTurn();

  fireEvent.click(view.stand);

  const dealerHand = view.getByTestId("dealer-hand");
  const message = await view.findByText(/win/i);

  expect(dealerHand).toContainElement(message);
});

test("player has bust", async () => {
  const view = renderApp([
    { rank: "10", suit: "S" },
    { rank: "10", suit: "H" }, // D1
    { rank: "9", suit: "H" }, // P2
    { rank: "10", suit: "D" }, // D1
    { rank: "9", suit: "D" } // P1
  ]);

  await view.waitForPlayerTurn();

  fireEvent.click(view.hit);

  const playerHand = view.getByTestId("player-hand");
  const message = await view.findByText(/lose/i);

  expect(playerHand).toContainElement(message);
});

test("dealer has bust", async () => {
  const view = renderApp([
    { rank: "10", suit: "S" },
    { rank: "9", suit: "H" }, // D1
    { rank: "10", suit: "H" }, // P2
    { rank: "9", suit: "D" }, // D1
    { rank: "10", suit: "D" } // P1
  ]);

  await view.waitForPlayerTurn();

  fireEvent.click(view.stand);

  const playerHand = view.getByTestId("player-hand");
  const message = await view.findByText(/win/i);

  expect(playerHand).toContainElement(message);
});

test("dealer has blackjack", async () => {
  const view = renderApp([
    { rank: "10", suit: "S" },
    { rank: "A", suit: "H" }, // D1
    { rank: "10", suit: "H" }, // P2
    { rank: "10", suit: "D" }, // D1
    { rank: "10", suit: "D" } // P1
  ]);

  await view.waitForPlayerTurn();

  fireEvent.click(view.stand);

  const dealerHand = view.getByTestId("dealer-hand");
  const message = await view.findByText(/blackjack/i);

  expect(dealerHand).toContainElement(message);
});

test("player has blackjack", async () => {
  const view = renderApp([
    { rank: "10", suit: "S" },
    { rank: "10", suit: "H" }, // D1
    { rank: "10", suit: "H" }, // P2
    { rank: "10", suit: "D" }, // D1
    { rank: "A", suit: "D" } // P1
  ]);

  const playerHand = view.getByTestId("player-hand");
  const message = await view.findByText(/blackjack/i);

  expect(playerHand).toContainElement(message);
});

test("player has blackjack after hit", async () => {
  const view = renderApp([
    { rank: "A", suit: "S" },
    { rank: "10", suit: "H" }, // D1
    { rank: "10", suit: "H" }, // P2
    { rank: "10", suit: "D" }, // D1
    { rank: "10", suit: "D" } // P1
  ]);

  await view.waitForPlayerTurn();

  fireEvent.click(view.hit);

  const playerHand = view.getByTestId("player-hand");
  const message = await view.findByText(/blackjack/i);

  expect(playerHand).toContainElement(message);
});
