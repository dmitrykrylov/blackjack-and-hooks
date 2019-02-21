Made with [Create React App](https://github.com/facebook/create-react-app) and [bem-jsx](https://github.com/dmitrykrylov/bem-jsx).

### Why I created this?

I just wanted to

- Try out the declarative approach brought by React Hooks by building a little app with non-trivial business logic.
- Test my own idea of the golden mean between BEM and CSS-in-JS approaches which is embodied in [bem-jsx](https://github.com/dmitrykrylov/bem-jsx) library.
- Design something different from the things I usually work on.
- Exploit the famous meme for the sake of the goals mentioned above.

### What I have found out when building this app?

- There are so many varieties of blackjack rules. I decided to simplify this implementation as much as possible.
- If you are going to implement the full set of blackjack rules including all the concepts like "double down" and "split", perhaps it's better to manage app state with something like Redux, Mobx or Overmind.
- In my opinion, managing app state with `useReducer` is quite verbose. If you have complex logic in your component, your code starts to consist of `dispatch({ type: '...', ... })` noise. It's probably worth to implement [a custom hook](https://github.com/dmitrykrylov/blackjack-and-hooks/blob/703eccc8d031909338dcd7251509ea0d2d826c5b/src/hooks/useStateWithActions.js#L3) with something like`mapDispatchToProps` underhood.
- It turns out that development of a little game can require a lot of async stuff to make your UX (gameplay) a bit more dynamic. Also, when you build a game you begin to realize how really UX affects your code.
- It's not easy to switch your mind from classes to hooks. There is a temptation to implement **everything** in an extremely declarative way listening for state changes and running side effects using `useEffect` hook. Don't forget that many things are simpler if they are imperative, find the balance.

### How to run this app on your machine?

```
git clone https://github.com/dmitrykrylov/blackjack-and-hooks.git
cd blackjack-and-hooks
yarn
yarn start
```

### I'm open to feedback

This app doesn't pretend to be perfect. If you find a bug or know how to make code or design better, let me know.

MIT © [dmitrykrylov](https://github.com/dmitrykrylov)

2019
