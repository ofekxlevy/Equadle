# Equadle

**Equadle** is a Wordle-inspired equation guessing game built with **React** and **TypeScript**.

Instead of guessing a word, the player tries to discover a hidden mathematical equation.  
After every valid guess, each tile is colored to indicate how closely the guessed token matches the hidden equation.

---

## 🎓 Project Purpose

One of the main goals of **Equadle** is to practice and apply **functional programming principles** in a real-world TypeScript and React project.

For this reason, the project's core logic is intentionally written in a **functional programming style** whenever practical.

The implementation emphasizes:

- **Pure functions** — functions should depend only on their inputs and return a result without causing unnecessary side effects.
- **Immutability** — existing game data is not modified directly; new values and states are created instead.
- **Function composition** — complex operations are divided into smaller functions with clearly defined responsibilities.
- **Declarative transformations** — operations such as `map`, `filter`, and `reduce` are preferred when they express the intent more clearly than imperative loops.
- **Separation of concerns** — parsing, validation, evaluation, game-state management, and UI logic are kept separate.
- **Explicit state transitions** — game operations receive the current state and return a new state rather than mutating the existing one.


React itself requires some stateful behavior and side effects, so the project does not attempt to eliminate them completely. Instead, they are kept mainly at the UI boundaries, while the core game logic remains as pure and functional as possible.

This architecture makes **Equadle** both a game project and a practical exercise in applying functional programming concepts to a complete application.

---

## 🎯 How to Play

The goal is to guess the hidden equation.

Enter a valid mathematical equation and submit your guess. Each guess must contain exactly the required number of tiles.

After submitting a valid equation, every tile receives feedback:

- 🟩 **Green** — the token is correct and in the correct position.
- 🟨 **Yellow** — the token exists in the equation but is in a different position.
- ⬜ **Gray** — the token does not belong in the equation, or all occurrences of that token have already been matched.

Repeated tokens are handled carefully, so the feedback never marks more occurrences of a token than actually exist in the hidden equation.

---

## 🧮 Supported Operations

Equadle currently supports:

| Operation | Symbol |
|---|---|
| Addition | `+` |
| Subtraction | `−` |
| Multiplication | `·` |
| Division | `/` |
| Square | `x²` |
| Equality | `=` |
| Parentheses | `(` `)` |

Digits from `0` to `9` are also supported.

The square operation is represented internally as a single `^2` token, even though it is displayed visually as a superscript.

---

## 📏 Equation Rules

A guess must be a syntactically and mathematically valid equation.

Some of the important rules are:

- The equation must contain exactly one `=`.
- Both sides of the equation must be mathematically valid.
- The two sides must evaluate to the same value.
- The right-hand side must be a single number.
- Numbers cannot contain unnecessary leading zeroes.
- The left-hand side cannot consist only of `0`.
- The square operator must follow a valid atomic expression.
- Parentheses must be balanced and correctly placed.
- Every equation must contain the required number of game tiles.

Invalid equations are rejected before they are evaluated as guesses.

---

## 🎮 Game Flow

A typical game works as follows:

1. A hidden equation is selected from the equation collection.
2. The player builds an equation using the on-screen keyboard.
3. The equation is validated.
4. If valid, it is compared with the hidden equation.
5. The board displays the result using colored tiles.
6. The keyboard remembers the best information discovered for each token.
7. The game continues until the equation is guessed or all attempts are used.

A **New Game** button starts a new game with a newly selected equation.

The game also includes a **How to Play** interface explaining the rules to the player.

---

## 🧠 Guess Evaluation

Guess evaluation follows Wordle-style matching rules.

The algorithm uses two passes.

### First Pass — Exact Matches

Tokens that are identical and appear in the same position are marked as green.

These occurrences are consumed immediately.

### Second Pass — Misplaced Matches

The remaining tokens are checked against the unmatched tokens in the hidden equation.

If an available matching token exists, the tile is marked yellow.

Otherwise, it is marked gray.

This two-pass approach is important when an equation contains the same digit or operator multiple times.

For example, if the secret equation contains a token only once, guessing that token multiple times cannot produce multiple yellow matches.

---

## ⌨️ Keyboard Feedback

The on-screen keyboard reflects everything discovered so far.

Each key stores its **best known state**:

```text
Green > Yellow > Gray > Unknown
```

Therefore, information is never downgraded.

For example, if a token was previously yellow and later discovered in its correct position, its keyboard key becomes green and remains green.

---

## 🏗️ Project Structure

The project separates the game logic from the React user interface.

```text
src/
├── components/
│   ├── Board
│   ├── Game
│   └── Keyboard
│
├── game/
│   ├── basicValidators
│   ├── equation
│   ├── evaluateGuess
│   ├── gameState
│   ├── parser
│   ├── types
│   └── validateEquation
│
├── App.tsx
└── main.tsx
```

### `game/`

Contains the core game logic.

The goal is to keep this layer independent from React whenever possible.

Important responsibilities include:

- equation representation
- parsing
- validation
- mathematical evaluation
- guess evaluation
- game-state transitions
- equation selection

### `components/`

Contains the React user interface.

The main components are responsible for:

- displaying the board
- handling player interaction
- rendering the keyboard
- displaying game status
- starting new games
- showing the How to Play interface

---

## 🔍 Parsing and Validation

Equation validation is intentionally separated into multiple stages instead of relying on a single large validation function.

Conceptually, the pipeline is:

```text
Tokens
   ↓
Basic validation
   ↓
Parsing
   ↓
AST
   ↓
Semantic validation
   ↓
Evaluation
   ↓
Valid equation
```

The parser converts the token sequence into a structured representation of the mathematical expression.

This makes it easier to distinguish between:

- valid syntax
- invalid syntax
- mathematically incorrect equations
- equations that violate Equadle-specific rules

This structure also keeps the validation logic easier to test and extend.

---

## 🌳 Abstract Syntax Tree

Mathematical expressions are represented internally using an **Abstract Syntax Tree (AST)**.

For example:

```text
3 + 5 · 6
```

can conceptually be represented as:

```text
      +
     / \
    3   ·
       / \
      5   6
```

Using an AST allows the project to handle operator precedence and nested expressions without relying on JavaScript's `eval`.

It also makes future extensions to the equation language easier to implement.

---

## 🧩 Game State

Game progression is handled through a dedicated game-state layer.

The state tracks information such as:

- the hidden equation
- submitted guesses
- feedback for each guess
- whether the player has won
- whether the game has ended

Game-state operations return updated state rather than directly modifying existing state.

This keeps the core game logic predictable and easier to test.

---

## 🧪 Testing

Core game logic is covered with automated tests.

Tests focus especially on behavior where subtle bugs are likely to occur.

Examples include:

- valid equations
- invalid equations
- malformed expressions
- repeated tokens
- duplicate matching behavior
- exact matches
- misplaced matches
- game-state transitions
- win detection
- invalid guesses

Example test files include:

```text
evaluateGuess.test.ts
validateEquation.test.ts
gameState.test.ts
```

The project favors testing the game logic independently from the UI.

---

## 🛠️ Technologies

The project is built with:

- **React**
- **TypeScript**
- **Vite**
- **Vitest**
- **CSS**

---

## 🚀 Running the Project

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will start the local development environment and provide the address where the game can be opened in the browser.

---

## 🧪 Running Tests

Run the test suite with:

```bash
npm test
```

Depending on the configured scripts, tests can also be executed directly through Vitest:

```bash
npx vitest
```

---

## 📦 Production Build

Create a production build with:

```bash
npm run build
```

This performs the project's production compilation and generates the optimized application files.

---

## 💡 Design Principles

Several principles guide the implementation of Equadle:

### Separate Logic from UI

Game rules should not depend on React components.

This makes the core logic easier to understand, reuse, and test.

### Prefer Pure Functions

Whenever practical, game operations receive data and return new data rather than modifying existing objects.

```ts
newState = operation(oldState);
```

This reduces hidden side effects and makes state transitions easier to reason about.

### Validate Before Evaluating

User input should never be assumed to represent a valid mathematical expression.

The project first validates and parses the equation and only then evaluates it.

### Model the Equation Language Explicitly

Equadle treats equations as a small language with its own:

- tokens
- grammar
- parser
- AST
- semantic rules

This is more robust than manipulating the equation as an arbitrary string.

### Test the Rules, Not the Implementation

Tests focus primarily on observable game behavior.

This allows internal implementations to change without unnecessarily breaking tests.

---

## 📄 License

This project is currently intended for educational and personal use.