import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Patterns } from '../utils/Patterns';
import Modal from '../components/Modal'
import '../styles/cross.css';
import { useAuth } from '../utils/ContextAPI';

let playerId;
let currentPlayer;
let otherPlayer;
let playerName;
let player;
let players = [];
let activeGame = {};
let turn;
let roomId;
let name = "";
let opposite;
let dropzone;
let dropzoneId;
let boxId;

const Quick = ({ socket }) => {
    const [board, setBoard] = useState(["", "", "", "", "", "", "", "", ""]);
    const [info, setInfo] = useState("");
    const [start, setStart] = useState(false);
    const [game, setGame] = useState({});

    let turnElement = document.getElementById("turn");
    useEffect(() => {
        socket.on('playerName', (name) => {
            console.log(name)
            // playerName = name;
            // document.getElementById('playerName').innerText = `You are ${playerName}`;
        });
    }, [socket]);

    useEffect(() => {
        socket.on('drop', async ({ data, dropzoneId }) => {
            let temp = await document.getElementById(data);
            const allBox = document.querySelectorAll(".dropBox");
            let found = allBox[dropzoneId];
            data && await found.appendChild(temp);
            console.log(turn);
        });
        checkWin();
    }, [socket, dropzone]);

    useEffect(() => {
        // Listen for the 'turn' event
        socket.on('turn', (turn) => {
            console.log(`Current Turn: ${turn}`);
            // Enable the 'End Turn' button only for the active player
            // document.getElementById('endTurnButton').disabled = turn % 2 !== players.indexOf(playerName);
        });
        socket.on('socket', (data) => {
            playerId = data;
            console.log("your player id is => " + playerId);
        })
        socket.on('gameStart', (game) => {
            console.log(`Current game: ${game}`);
            setTimeout(() => {
                activeGame = game;
                players = game.players;
                player = activeGame.find(item => item.socketId === playerId);
                otherPlayer = activeGame.find(item => item.socketId !== playerId);
                // calcTurn(game.currentTurn)
                console.log(player);
                console.log(otherPlayer);
                console.log(players);
            }, 1000);
        })

        // Listen for the 'playerDisconnected' event
        socket.on('playerDisconnected', (disconnectedPlayer) => {
            console.log(`Player ${disconnectedPlayer} disconnected`);
        });
    }, []);

    function calcTurn(current) {
        console.log(current);
        console.log(0 % 2, "0 % 2");
        console.log(1 % 2, "1 % 2");
        console.log(2 % 2, "2 % 2");
        console.log(3 % 2, "3 % 2");
    }
    function refreshPage() {
        window.location.reload();
    }

    function onChange(e) {
        name = e.target.value;
    }

    function airDrop(e) {
        e.preventDefault();
    }

    function Drop(e, square) {
        e.preventDefault();
        var data = e.dataTransfer.getData("text");
        dropzone = e.target;
        dropzoneId = e.target.id;
        // const newPosition = { x: e.clientX, y: e.clientY };
        // Send the movePiece event to the server
        // socket.emit('movePiece', { data, newPosition });
        e.target.appendChild(document.getElementById(data));
        socket.emit('drop', { data, dropzoneId, otherId: otherPlayer.socketId });
        socket.emit('endTurn', otherPlayer.socketId);

        setBoard(board.map((val, idx) => {
            if (idx === square && val === "") {
                return player
            }
            return val;
        }))

        checkWin();
    }

    function Drag(e) {
        e.dataTransfer.setData("text", e.target.id);
    }

    function checkWin() {
        const allBox = document.querySelectorAll(".dropBox");
        Patterns.forEach(item => {
            const Xwins = item.every(square => allBox[square].firstChild?.classList.contains('cross'))
            if (Xwins) {
                setInfo("Player X wins");
                alert("Player X wins")
                allBox.forEach(tin => tin.replaceWith(tin.cloneNode(true)));
                return;
            }
        });

        Patterns.forEach(item => {
            const Owins = item.every(square => allBox[square].firstChild?.classList.contains('circle'))
            if (Owins) {
                setInfo("Player O wins");
                alert("Player O wins")
                allBox.forEach(tin => tin.replaceWith(tin.cloneNode(true)));
                return;
            }
        });
    }

    const handleSave = async () => {
        await socket.emit("quickPlayFind", name);
        calcTurn(0)
    };

    return (
        <div className='relative flex items-center flex-col h-screen min-h-screen justify-center py-2 w-full bg-amber-500'>
            <div className='flex w-full justify-between items-center px-4'>
                <div className='p-1 bg-black text-white rounded'>
                    <h1 className="uppercase font-bold">Opponent: {activeGame[0]}: {opposite}</h1>
                </div>
                <span className="p-2 my-1 bg-stone-500 text-white font-bold rounded-full">VS</span>
                <div className='bg-black text-white p-1 rounded'>
                    <h1 className="uppercase font-bold">{activeGame[1]}: {name}</h1>
                </div>
            </div>
            <span id="turn" className="p-1 my-1 bg-stone-500 text-white font-bold">It's #'s Turn</span>
            <div className='flex justify-center items-center h-full w-full'>
                <div className='drag flex relative justify-center items-center flex-col h-[420px] w-[100px] gap-2 mx-10 cursor-grab'>
                    <div className="dragbox p-4 bg-slate-900/50">
                        <button className="cross relative w-12 h-12 flex justify-center items-center before:absolute before:w-1 before:h-full before:bg-white before:rotate-45 after:absolute after:w-full after:h-1 after:bg-white after:rotate-45" draggable={true} onDragStart={Drag} id='X1'>X</button>
                    </div>
                    <div className="dragbox p-4 bg-slate-900/50">
                        <button className="cross relative w-12 h-12 flex justify-center items-center before:absolute before:w-1 before:h-full before:bg-white before:rotate-45 after:absolute after:w-full after:h-1 after:bg-white after:rotate-45" draggable={true} onDragStart={Drag} id='X2'>X</button>
                    </div>
                    <div className="dragbox p-4 bg-slate-900/50">
                        <button className="cross relative w-12 h-12 flex justify-center items-center before:absolute before:w-1 before:h-full before:bg-white before:rotate-45 after:absolute after:w-full after:h-1 after:bg-white after:rotate-45" draggable={true} onDragStart={Drag} id='X3'>X</button>
                    </div>
                </div>
                <div className="relative grid grid-cols-3">
                    <div className="dropBox relative w-[140px] h-[140px] border-r-4 border-white border-b-4 p-3 flex justify-center items-center cursor-default scale-105" onDrop={(e) => Drop(e, 0)} onDragOver={airDrop} id='0'></div>
                    <div className="dropBox relative w-[140px] h-[140px] border-r-4 border-white border-b-4 p-3 flex justify-center items-center cursor-default scale-105" onDrop={(e) => Drop(e, 1)} onDragOver={airDrop} id='1'></div>
                    <div className="dropBox relative w-[140px] h-[140px] border-white border-b-4 p-3 flex justify-center items-center cursor-default scale-105" onDrop={(e) => Drop(e, 2)} onDragOver={airDrop} id='2'></div>
                    <div className="dropBox relative w-[140px] h-[140px] border-r-4 border-white border-b-4 p-3 flex justify-center items-center cursor-default scale-105" onDrop={(e) => Drop(e, 3)} onDragOver={airDrop} id='3'></div>
                    <div className="dropBox relative w-[140px] h-[140px] border-r-4 border-white border-b-4 p-3 flex justify-center items-center cursor-default scale-105" onDrop={(e) => Drop(e, 4)} onDragOver={airDrop} id='4'></div>
                    <div className="dropBox relative w-[140px] h-[140px] border-white border-b-4 p-3 flex justify-center items-center cursor-default scale-105" onDrop={(e) => Drop(e, 5)} onDragOver={airDrop} id='5'></div>
                    <div className="dropBox relative w-[140px] h-[140px] border-r-4 border-white p-3 flex justify-center items-center cursor-default scale-105" onDrop={(e) => Drop(e, 6)} onDragOver={airDrop} id='6'></div>
                    <div className="dropBox relative w-[140px] h-[140px] border-r-4 border-white p-3 flex justify-center items-center cursor-default scale-105" onDrop={(e) => Drop(e, 7)} onDragOver={airDrop} id='7'></div>
                    <div className="dropBox relative w-[140px] h-[140px] p-3 flex justify-center items-center cursor-default scale-105" onDrop={(e) => Drop(e, 8)} onDragOver={airDrop} id='8'></div>
                </div>
                <div className='drag flex relative justify-center items-center flex-col h-[420px] w-[100px] gap-2 mx-10 cursor-grab'>
                    <div className="dragbox bg-slate-900/50 p-2">
                        <button className="circle relative w-12 h-12 border-4 border-white rounded-full" onDragStart={Drag} draggable={true} id='O1'></button>
                    </div>
                    <div className="dragbox bg-slate-900/50 p-2">
                        <button className="circle relative w-12 h-12 border-4 border-white rounded-full" onDragStart={Drag} draggable={true} id='O2'></button>
                    </div>
                    <div className="dragbox bg-slate-900/50 p-2">
                        <button className="circle relative w-12 h-12 border-4 border-white rounded-full" onDragStart={Drag} draggable={true} id='O3'></button>
                    </div>
                </div>
            </div>
            <span>{info}</span>
            <button className='reset py-2 px-6 bg-black text-white cursor-pointer' onClick={refreshPage}>Reset</button>
            {!start && (
                <Modal>
                    <h1 className="text-3xl font-bold text-center">Quick Game Mode</h1>
                    <p className='text-sm text-center'>
                        <em>
                            Play with any random player available online
                        </em>
                    </p>
                    <div className='flex w-full p-3 h-full'>
                        <div className='f1 p-2 flex flex-col'>
                            <input
                                className="border-2 p-1 "
                                type="text"
                                placeholder="name"
                                name='name'
                                onChange={onChange}
                            />
                            <button onClick={handleSave} className="border my-2 p-2 text-xl">
                                Create Game Room
                            </button>
                        </div>
                    </div>
                </Modal>)}
        </div>
    )
}

export default Quick