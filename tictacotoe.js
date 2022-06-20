// TIC TAC TOE
// Brittany Cahill
// Tutorial: https://reactjs.org/tutorial/tutorial.html

// SQUARE - renders a single button
function Square(props) {
  // Parent component passes state back to children using props
  // React function components only contain a render method and don't have their own state
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

// BOARD - renders 9 squares
class Board extends React.Component {
  assignSquare() {
    // Assigns a position to each square
    const rows = [];
      // array of 3 rows of squares to be rendered
    for (let col = 0; col < 3; col++) {
      const squares = [];
      for (let row = 0; row < 3; row++) {
        const key = (3*col) + row;
          // converts coordinates (col, row) into keys 0-8
        squares.push(
          <Square
                value={this.props.squares[key]} key={key}
                  // Passes the value of each square to identify which square was clicked
                onClick={() => this.props.onClick(key)}
          />
        )
      }
      rows.push(
          <div className='board-row' key={col}>
              {squares}
          </div>
        );
    }
    return rows;
  }
  
  render() {
    return (
      <div>
        {this.assignSquare()}
      </div>
    );
  }
  
}

// GAME - renders board
class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
          // Initial empty array at move 0
        col: null,
        row: null
          // Initial position at move 0
      }],
      stepNumber: 0,
        // Initiate index = 0
      xIsNext: true,
        // Default 'X' is initial move
    };
  }
 
  handleClick(i) {
    // It’s conventional to use on[Event] names for props which represent events and handle[Event] for the methods which handle the events
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
      // .slice() creates a copy of the history array to modify
    const current = history[history.length - 1];
    const squares = current.squares.slice();
      // Creates a copy of the previous move for each subsequent move
    if (calculateWinner(squares) || squares[i]) {
      // If a winner is calculated OR the clicked square is already full, do nothing
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    const position = calculateColRow(i);
    // console.log(position);
    this.setState({
      history: history.concat([{
        // Concatenates new entries onto history; concat() does not mutate the original array
        squares: squares,
        col: position.col,
        row: position.row
      }]),
      stepNumber: history.length,
        // Ensures the same move is not shown after the new one by updating each turn
      xIsNext: !this.state.xIsNext,
        // Flip boolean xIsNext between 'X' and 'O' on each click
    });
  }
 
  jumpTo(step) {
      // Allows for "time travel" to different steps in history
    this.setState({
      stepNumber: step,
        // stepNumber from the Game's state becomes the selected step stored in history
      xIsNext: (step % 2) === 0,
        // If mod 2 (remainder) is 0, then the value is even; sets xIsNext to true in this case
    });
  }
 
  render() {
    const history = this.state.history;
    // console.log(history);
    // console.log(this.state.stepNumber);
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);
   
    const moves = history.map((step, move) => {
      // Step is the current history value while move is the index (0, 1, 2, etc.)
      // console.log(`Move: ${move}  stepNumber: ${this.state.stepNumber}`);  
      // Can use `string ${value}` instead of 'string'+ value
      // console.log(move === this.state.stepNumber);
      const desc = move ?
            `Go to move # ${move}, Position: (${step.col},${step.row})` :
            'Go to game start';
      if (move === this.state.stepNumber) {
        // If current move, bold the button text
        return (
          // Assigns proper keys for each move in the dynamic list
          <li key={move}> 
            <button onClick={() => this.jumpTo(move)}>
              <b>{desc}</b>
            </button>
          </li>
            // <li> refers to list item 
        );
      }
      else {
        // Display regular (not bold) text for moves other than the current move
        return (
          // Assigns proper keys for each move in the dynamic list
          <li key={move}> 
            <button onClick={() => this.jumpTo(move)}>
              {desc}
            </button>
          </li> 
        );
      }
    });
   
    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }
   
    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

// WINNER - detects 3 in a row
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

// COLROW - calculates the column and row of each move
function calculateColRow(i) {
  const col = i % 3;
  const row = Math.floor(i / 3);
    // Math.floor() returns the largest integer less than or equal to the given number
  // console.log(`Row is: ${row}, col is: ${col}`);
  return{col, row};
    // Returns an object with properties col and row; {} are necessary as opposed to ()
}

// IMMUTABILITY - it is better to make a copy of data to modify as opposed to modifying data directly
  // Saving the history of each move as immutable copies allows for undo and redo by returning to previous versions
  // Whether the object has changed can be detected by simply comparing the immutable object to the copy; if there is a change, React knows to re-render