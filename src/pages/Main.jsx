import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import characterClass from '../characterClass';

function Main() {
    const [dead, setDead] = useState(false);
    const [isAnimated, setAnimated] = useState(false);
    const [currentSelected, setCurrentSelected] = useState('');
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [selectedPattern, setSelectedPattern] = useState('');
    const [races, setRaces] = useState({
        space_marines: { use: false, number: 1, speed: 5, pattern: null },
        necrons: { use: false, number: 1, speed: 5, pattern: null },
        aeldari: { use: false, number: 1, speed: 5, pattern: null },
        tyranids: { use: false, number: 1, speed: 5, pattern: null }
    });
    const [whoWon, setwhoWon] = useState('');
    // const [image, setImage] = useState('http://localhost:8000/images/spaceparanoids.png');
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth * 0.98;
        canvas.height = window.innerHeight * 0.98;
        const canvasHeight = canvas.height;
        const canvasWidth = canvas.width;
        console.log(canvasHeight);
        console.log(canvasWidth);
        const charSize = canvasWidth / 42;
        // Create instances of BouncingCharacter
        let spaceMarine = null;
        if (races.space_marines.use) spaceMarine = new characterClass(canvasWidth / 11, canvasHeight / 5, races.space_marines.speed, 4, 'S', charSize, 'blue', races.space_marines.number, races.space_marines.pattern);
        let necron = null;
        if (races.necrons.use) necron = new characterClass(canvasWidth - canvasWidth / 12, canvasHeight - canvasHeight / 5, races.necrons.speed, 2, 'N', charSize, 'black', races.necrons.number, races.necrons.pattern);
        let aeldari = null;
        if (races.aeldari.use) aeldari = new characterClass(canvasWidth / 11, canvasHeight - canvasHeight / 5, races.aeldari.speed, 3, 'A', charSize, 'red', races.aeldari.number, races.aeldari.pattern);
        let tyranid = null;
        if (races.tyranids.use) tyranid = new characterClass(canvasWidth - canvasWidth / 12, canvasHeight / 5, races.tyranids.speed, 3, 'T', charSize, 'purple', races.tyranids.number, races.tyranids.pattern);
        let animationId; // Store the animation frame ID
        let factions = 0;
        for (let key in races) {
            if (!races[key].use) {
                factions += 1;
            }
        }
        if (factions === 4) { setAnimated(false); return }
        function draw() {
            // Clear the canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // get all characters' positions and draw & update animation
            let spaceMarine_pos;
            (spaceMarine !== null) ? spaceMarine_pos = spaceMarine.get() : spaceMarine_pos = null;
            let necron_pos;
            (necron !== null) ? necron_pos = necron.get() : necron_pos = null;
            let aeldari_pos;
            (aeldari !== null) ? aeldari_pos = aeldari.get() : aeldari_pos = null;
            let tyranid_pos;
            (tyranid !== null) ? tyranid_pos = tyranid.get() : tyranid_pos = null;
            // Printing out who won
            let winning_race = {};
            if (spaceMarine !== null) {
                spaceMarine.draw(ctx);
                spaceMarine.update(ctx, canvas, { necron: necron_pos, aeldari: aeldari_pos, tyranid: tyranid_pos }, dead);
                winning_race["Space Marines"] = spaceMarine_pos[0]; // for printing out who won
            }
            if (necron !== null) {
                necron.draw(ctx);
                necron.update(ctx, canvas, { spaceMarine: spaceMarine_pos, aeldari: aeldari_pos, tyranid: tyranid_pos }, dead);
                winning_race["Necrons"] = necron_pos[0];
            }
            if (aeldari !== null) {
                aeldari.draw(ctx);
                aeldari.update(ctx, canvas, { spaceMarine: spaceMarine_pos, necron: necron_pos, tyranid: tyranid_pos }, dead);
                winning_race["Aeldari"] = aeldari_pos[0];
            }
            if (tyranid !== null) {
                // draw and update animation
                tyranid.draw(ctx);
                tyranid.update(ctx, canvas, { spaceMarine: spaceMarine_pos, aeldari: aeldari_pos, necron: necron_pos }, dead);
                winning_race["Tyranids"] = tyranid_pos[0];
            }

            // Continue animation only if isAnimated is true
            if (isAnimated) {
                animationId = requestAnimationFrame(draw);
            }
            winning_race = Object.fromEntries(Object.entries(winning_race).filter(([_, pos]) => pos.length > 0)); // Remove empty winning_race
            if (Object.keys(winning_race).length === 2 && factions !== 2) {
                let prev = null;
                for (let race in winning_race) {
                    if (prev !== null) {
                        if (winning_race[race].length > winning_race[prev].length) {
                            setwhoWon(`The ${race} win!!`);
                        } else if (winning_race[race].length < winning_race[prev].length) {
                            setwhoWon(`The ${prev} win!!`);
                        } else {
                            setwhoWon(`It's a draw between the ${race} and ${prev}`)
                        }
                    }
                    prev = race;
                }
            } else if (factions === 2) {
                const deathmatch = Object.keys(winning_race);
                const race1 = deathmatch[0];
                const race2 = deathmatch[1];
                if (!winning_race[race1]) {
                    setwhoWon(`The ${race2} win the deathmatch!`);
                } else if (!winning_race[race2]) {
                    setwhoWon(`The ${race1} win the deathmatch!`);
                }
            }
        }
        if (isAnimated) {
            // Start the animation
            animationId = requestAnimationFrame(draw);
        }
        // Cleanup to stop animation on component unmount
        return () => cancelAnimationFrame(animationId);
    }, [isAnimated]); // Only restart the effect when isAnimated changes

    // Dead mode
    const toggleDead = () => {
        const death = !dead;
        setDead(death);
    }

    // For multi dropdown select
    const handleSelectChange = (event) => {
        const options = Array.from(event.target.selectedOptions, option => option.value);
        setSelectedOptions(options);
        for (let race of options) {
            setCurrentSelected(race);
            races[race].use = !races[race].use;
        }
    };
    // for speed
    const handleSpeedChange = (event, current) => {
        const speed = event.target.value;
        if (!isNaN(speed) && !isNaN(parseFloat(speed))) {
            races[current].speed = parseInt(event.target.value);
        } else {
            event.target.value = null;
        }
    }
    // for number of units in army
    const handleNumberChange = (event, current) => {
        const number = event.target.value;
        if (!isNaN(number) && !isNaN(parseFloat(number))) {
            races[current].number = parseInt(event.target.value);
        } else {
            event.target.value = null;
        }
    }
    // for pattern of army faction
    const handlePatternChange = (event) => {
        const pattern = event.target.value;
        races[currentSelected].pattern = pattern;
    }
    const animationStop = () => {
        setAnimated(!isAnimated);
        setwhoWon('');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            {(isAnimated) ? (
                <h1>Fight! {name}</h1>
            ) : (<h1>Russell's Warhammer 40K Simulation</h1>)}

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <button onClick={toggleDead}>Dead mode</button>
                <button id="toggleButton" onClick={animationStop}>Stop/Start</button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <select multiple value={selectedOptions} onChange={handleSelectChange} style={{ minHeight: '5rem', minWidth: '10rem', marginLeft: '1rem', marginRight: '1rem' }}>
                    {(!races.space_marines.use) ? (<option value="space_marines">Space Marines</option>) : (<option value="space_marines">Space Marines    ✓</option>)}
                    {(!races.necrons.use) ? (<option value="necrons">Necrons</option>) : (<option value="necrons">Necrons    ✓</option>)}
                    {(!races.aeldari.use) ? (<option value="aeldari">Aeldari</option>) : (<option value="aeldari">Aeldari    ✓</option>)}
                    {(!races.tyranids.use) ? (<option value="tyranids">Tyranids</option>) : (<option value="tyranids">Tyranids    ✓</option>)}
                </select>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input style={{ maxWidth: '10rem' }} onChange={(e) => handleSpeedChange(e, currentSelected)} placeholder={`Enter Speed for ${currentSelected}`} />
                    <input style={{ maxWidth: '10rem' }} onChange={(e) => handleNumberChange(e, currentSelected)} placeholder={`Enter # units for ${currentSelected}`} />
                </div>

                <select value={selectedPattern} onChange={handlePatternChange} style={{ maxHeight: '2rem', maxWidth: '10rem' }}>
                    <option value="default">Default</option>
                    <option value="sin">Sin</option>
                    <option value="cos">Cos</option>
                    <option value="circular">Circular</option>
                </select>
            </div>

            <div style={{ justifyContent: 'center', alignItems: 'center', marginBottom: '1rem' }}>
                <canvas ref={canvasRef} style={{ border: '1px solid black', maxWidth: '50rem' }} />
            </div>

            {(whoWon !== '') && (
                <h1>{whoWon}</h1>
            )}
        </div>
        /* <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <img src={image} alt="Dynamic Image Example" style={{ maxWidth: '60rem', maxHeight: '60rem' }} />
        </div> */
    );
}

export default Main;