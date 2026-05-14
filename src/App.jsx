import * as Sentry from '@sentry/react'
import { useState } from 'react'
import './App.css'

function Square({ value, onClick, highlight }) {
  return (
    <button className={`square${highlight ? ' highlight' : ''}`} onClick={onClick}>
      {value}
    </button>
  )
}

function Board({ squares, onClick, winLine }) {
  return (
    <div className="board">
      {squares.map((val, i) => (
        <Square
          key={i}
          value={val}
          onClick={() => onClick(i)}
          highlight={winLine && winLine.includes(i)}
        />
      ))}
    </div>
  )
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ]
  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] }
    }
  }
  return null
}

function App() {
  const [squares, setSquares] = useState(Array(9).fill(null))
  const [xIsNext, setXIsNext] = useState(true)

  const result = calculateWinner(squares)
  const winner = result?.winner
  const winLine = result?.line
  const isDraw = !winner && squares.every(Boolean)

  function handleClick(i) {
    if (squares[i] || winner) return
    const mark = xIsNext ? 'X' : 'O'
    Sentry.startSpan(
      {
        name: 'Set square',
        op: 'game.board.move',
        attributes: {
          'game.square_index': i,
          'game.mark': mark,
        },
      },
      () => {
        const next = squares.slice()
        next[i] = mark
        setSquares(next)
        setXIsNext(!xIsNext)
        Sentry.logger.info("Board square played", {
          squareIndex: i,
          mark,
        })
      },
    )
  }

  function handleReset() {
    setSquares(Array(9).fill(null))
    setXIsNext(true)
    Sentry.logger.info("New game")
  }

  function sendTestSentryError() {
    Sentry.logger.warn("Manual test error button clicked")
    Sentry.captureException(new Error('Manual test error from tic-tac-toe app'))
  }

  let status
  if (winner) {
    status = `Winner: ${winner}`
  } else if (isDraw) {
    status = "It's a draw!"
  } else {
    status = `Next player: ${xIsNext ? 'X' : 'O'}`
  }

  return (
    <div className="game">
      <h1>Tic-Tac-Toe</h1>
      <div className="status">{status}</div>
      <Board squares={squares} onClick={handleClick} winLine={winLine} />
      <div className="actions">
        <button type="button" className="reset" onClick={handleReset}>
          New Game
        </button>
        <button type="button" className="sentry-demo" onClick={sendTestSentryError}>
          Send test error to Sentry
        </button>
      </div>
    </div>
  )
}

export default App
