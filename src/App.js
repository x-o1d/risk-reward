import './App.css';
import { useEffect, useState, useRef, useCallback } from 'react';
import Robot from './components/Robot.js'

const MAP_SIZE = 40;
const BLOCK_SIZE = 20;
const COST_OF_RISK = 25;

const COLORS = [
  '#8ac926',
  '#ffca3a',
  '#1982c4'
]

const PLAYER_COLORS = [
  '#6a4c9e',
  '#ff59fe'
]

function App() {

  const [render, setRender] = useState(false);
  const [generateMap, setGenerateMap] = useState(false);

  const players = useRef([[0, 0, 1, 0.7, 0],[0, 0, 1, 0.3, 0]]);
  const mapReady = useRef(false);
  const gameRunning = useRef(false);
  const startBlock = useRef(0);
  const randomMap = useRef([[]]);
  
  // initialize map
  useEffect(() => {
    const initialMap = new Array(MAP_SIZE).fill([]);
    players.current = [[0, 0, 1, 0.5, 0],[0, 0, 1, 0.5, 0]];

    randomMap.current = initialMap.map((row, index) => {
      if(!(index%2)) {
        const randomIndex = Math.floor(Math.random()*MAP_SIZE)
        return new Array(MAP_SIZE).fill(1).map((_, index2) => {
          if(index2 == randomIndex) {
            // start position
            if(index == 0) {
              players.current.forEach((_, index3, p) => {
                p[index3][1] = index2;
              });
              return 2;
            } 
            // open path
            else return 0;
          } 
          // wall
          else return 1;
        });
      } else {
        return new Array(MAP_SIZE).fill(0);
      }
    })

    // set start and end locations
    startBlock.current = randomMap.current[0][0];
    mapReady.current = true;
    setRender(r => !r);
  }, [generateMap])

  // path finding
  useEffect(() => {
    const interval = setInterval(() => {
      if(!gameRunning.current) return;

      players.current.forEach((player, index) => {

        // if player reached end row, end game
        if(player[0] === (MAP_SIZE -1)) {
          gameRunning.current = false;
          mapReady.current = false;
          return;
        }

        // if player crossing wall, do nothing for COST_OF_RISK frames
        if((player[4] > 0) && (player[4] < COST_OF_RISK)) {
          player[4]++;
          return;
        } else if(player[4] > COST_OF_RISK) {
           player[4] = 0;
        }

        // if player is headed forward
        if(player[2] == 1) {
          // if open head forward
          if(randomMap.current[player[0] + 1][player[1]] === 0) {
            player[0] = player[0] + 1;
          } 
          // if closed change heading to up or down randomly
          else {
            if(Math.random() > 0.5) {
              player[2] = 0;
            } else {
              player[2] = 2;
            }
          }
        }
        // if player is headed up
        if(player[2] == 0) {
          // if player at edge change heading
          if(player[1] === 0) {
            player[2] = 2;
          } else {
            // if left is open change heading to left
            if(randomMap.current[player[0] + 1][player[1]] === 0) {
              player[2] = 1;
            }
            // if up is open move up or take risk
            else {
              // take risk
              if(Math.random() < 2/MAP_SIZE*player[3]) {
                player[4] = 1;
                player[0] = player[0] + 1;
              } 
              // move up if open
              else if(randomMap.current[player[0]][player[1] - 1] === 0) {
                player[1] = player[1] - 1;
              }
            }
          }
          
        }
        // if player headed down
        if(player[2] == 2) {
          // if player at edge change heading
          if(player[1] === (MAP_SIZE - 1)) {
            player[2] = 1;
          }
          // if left is open change heading to left
          if(randomMap.current[player[0] + 1][player[1]] === 0) {
            player[2] = 1;
          }
          // if up is open move up
          else {
            // take risk
            if(Math.random() < 2/MAP_SIZE*player[3]) {
              player[4] = 1;
              player[0] = player[0] + 1;
            } 
            // move up if open
            else if(randomMap.current[player[0]][player[1] + 1] === 0) {
              player[1] = player[1] + 1;
            }
          }
        }
      })
      setRender((r) => !r);
    }, 50);

    return () => clearInterval(interval);
  }, [])

  return (
    <div className="App">
      <div className='game-area'>
        <div className='column'>
          <div className='game-description'>
            this simulation can only be viewed in a desktop screen.
            <br></br>
            <br></br>
            a player would attempt to reach the final column by seeking the
            door to the next column at each turn.
            <br></br>
            if a door is not found a player might choose to cross the wall 
            instead of finding the door.
            <br></br>
            crossing the wall costs five times more time than a single move.
            the rate at which a player will take a risk is determined by the
            risk factor for each player.
            <br></br>
            <br></br>
            the intention of this simulation is to simulate if taking a higher
            risk would increase the player's chance of winning a game consistently.
            <br></br>
            results can be only be probabalistic over atleast a hundred rounds 
            of the game.
          </div>
        </div>
        <div className='arena'>
          {
            randomMap.current.map((row, i1) => {
              return (
                <div 
                  className='map-row' 
                  key={i1}>
                  {row.map((element, i2) => {
                    return (
                      <div 
                        className='block' 
                        style={{backgroundColor: COLORS[element]}}
                        key={i2}>
                           
                      </div>
                    )
                  })}
                </div>)
            })
          }
          {players.current.map((p, index) => {
            return (
              <Robot 
                key={index}
                x={p[0]}
                y={p[1]}
                blockSize={BLOCK_SIZE}
                color={PLAYER_COLORS[index]}>
              </Robot>
            )
          })}
        </div>
        <div className='column'>
          <div className='game-settings'>
            <div className='setting'>
              <div className='input-text'>
                Black player Risk factor (0~1)
              </div>
              <input 
                value={players.current[0][3]} 
                onChange={(e) => {
                  if(e.target.value > 0 || e.target.value < 1) {
                    players.current[0][3] = e.target.value;
                    players.current[1][3] = 1-e.target.value;
                    setRender(r => !r);
                  }
                }}
                disabled={gameRunning.current}/>
            </div>
            <div className='setting'>
              <div className='input-text'>
                Pink player Risk factor
              </div>
              <input 
                value={players.current[1][3]}
                disabled={true}/>
            </div>
            <div className='setting'>
              <button 
                onClick={() => setGenerateMap(g => !g)}
                disabled={gameRunning.current}>
                regenerate map
              </button>
            </div>
            <div className='setting'>
              <button 
                onClick={() => gameRunning.current = true}
                disabled={!mapReady.current || gameRunning.current}>
                start game
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
