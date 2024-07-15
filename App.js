import React, { useState, useEffect } from "react";
import Die from "./Die";
import { nanoid } from "nanoid";
import Confetti from "react-confetti";

export default function App() {
    const [dice, setDice] = useState(allNewDice());
    const [tenzies, setTenzies] = useState(false);
    const [rolls, setRolls] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [bestTime, setBestTime] = useState(() => {
        return localStorage.getItem("bestTime") ? Number(localStorage.getItem("bestTime")) : null;
    });
    
    
    useEffect(() => {
        let interval = null;
        if (isActive) {
            interval = setInterval(() => {
                setSeconds(prevSeconds => prevSeconds + 1);
            }, 1000);
        } else if (!isActive && seconds !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, seconds]);

    useEffect(() => {
        const allHeld = dice.every(die => die.isHeld);
        const firstValue = dice[0].value;
        const allSameValue = dice.every(die => die.value === firstValue);
        if (allHeld && allSameValue) {
            setTenzies(true);
            setIsActive(false);
            
            const currentBestTime = localStorage.getItem("bestTime");
            if (!currentBestTime || seconds < currentBestTime) {
                localStorage.setItem("bestTime", seconds);
                setBestTime(seconds);
            }
        }
    }, [dice]);

    function generateNewDie() {
        return {
            value: Math.ceil(Math.random() * 6),
            isHeld: false,
            id: nanoid()
        };
    }

    function allNewDice() {
        const newDice = [];
        for (let i = 0; i < 10; i++) {
            newDice.push(generateNewDie());
        }
        return newDice;
    }

    function rollDice() {
        if (!tenzies) {
            setDice(oldDice =>
                oldDice.map(die => {
                    return die.isHeld ? die : generateNewDie();
                })
            );
            setRolls(prevRolls => prevRolls + 1);
            if (rolls === 0) {
                setIsActive(true);
            }
        } else {
            setTenzies(false);
            setDice(allNewDice());
            setRolls(0);
            setSeconds(0);
            setIsActive(true);
        }
    }

    function holdDice(id) {
        setDice(oldDice =>
            oldDice.map(die => {
                if (die.id === id) {
                    return {
                        id: die.id,
                        value: die.value,
                        isHeld: !die.isHeld
                    };
                } else {
                    return die;
                }
            })
        )
    }
    

    const diceElements = dice.map(die => (
        <Die
            key={die.id}
            value={die.value}
            isHeld={die.isHeld}
            holdDice={() => holdDice(die.id)}
        />
    ));

    return (
        <main>
            {tenzies && <Confetti />}
            <h1 className="title">Tenzies</h1>
            <p className="instructions">
                {tenzies
                    ? `Amount of rolls needed to win: ${rolls} | Time spent playing: ${seconds} seconds | Fastest time: ${bestTime}` 
                    : "Roll until all dice are the same. Click each die to freeze it at its current value between rolls."
                }
            </p>
            <div className="dice-container">{diceElements}</div>
            <button className="roll-dice" onClick={rollDice}>
                {tenzies ? "New Game" : "Roll"}
            </button>
        </main>
    );
}
