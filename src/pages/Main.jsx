import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import characterClass from '../characterClass';
import './Main.css';

function Main() {
    const [dead, setDead] = useState(false);
    const [isAnimated, setAnimated] = useState(false);
    const [currentSelected, setCurrentSelected] = useState('');
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [selectedPattern, setSelectedPattern] = useState('');
    const [imageUrl, setImageUrl] = useState('');
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
        canvas.width = window.innerWidth * 0.90;
        canvas.height = window.innerHeight * 0.80;
        const canvasHeight = canvas.height;
        const canvasWidth = canvas.width;
        const charSize = canvasWidth / 42;
        // Create instances of BouncingCharacter for each faction
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

    // Hook for when current selected race changes
    useEffect(() => {
        switch(currentSelected) {
            case 'space_marines':
                setImageUrl("https://cdn.focus-home.com/fhi-fastforward-admin/custom/space-marine-2/section1-1.jpg");
                break;
            case 'necrons':
                setImageUrl("https://i.pinimg.com/originals/ec/87/06/ec8706b50395fbcd8fb6482e6cc8950b.jpg");
                break;
            case 'aeldari':
                setImageUrl("https://static1.thegamerimages.com/wordpress/wp-content/uploads/2023/01/aeldari-buying-guide.jpg");
                break;
            case 'tyranids':
                setImageUrl("https://uploads.worldanvil.com/uploads/images/e61fdd2ead63caeb7d157f9ab01434ab.jpg");
                break;
            default:
                console.log("Unknown faction");
        }
    }, [currentSelected])
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
    // for changing attributes
    const handleAttributeChange = (event, race, type) => {
        const value = event.target.value; // Get the full input value
        // Create a new copy of the races object to avoid direct mutation
        let updatedRaces = { ...races };
        switch(type) {
            case "speed":
                if (!isNaN(value)) { // Ensure the value is a number
                    updatedRaces[race].speed = parseInt(value, 10);
                } else {
                    console.log('Invalid input for speed', value);
                }
                break;
            case "number":
                if (!isNaN(value)) { // Ensure the value is a number
                    updatedRaces[race].number = parseInt(value, 10);
                } else {
                    console.log('Invalid input for number');
                }
                break;
            case "pattern":
                updatedRaces[race].pattern = value; // Set the pattern (assuming it's a string)
                break;
            default:
                console.log("Something went wrong");
        }
        // Set the updated races object in state
        setRaces(updatedRaces);
    };

    const animationStop = () => {
        setAnimated(!isAnimated);
        setwhoWon('');
    };
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '40vh', marginTop: '12rem' }}>
            {(isAnimated) ? (
                <h1>Fight! {name}</h1>
            ) : (<h1>Russell's Warhammer 40K Simulation</h1>)}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <button onClick={toggleDead}>Dead mode</button>
                <button id="toggleButton" onClick={animationStop}>Stop/Start</button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <img src={imageUrl} alt="Faction Image" style={{ maxWidth: '250px', maxHeight: '250px'}} />
                <select multiple value={selectedOptions} onChange={handleSelectChange} style={{ minHeight: '5rem', minWidth: '7rem', marginLeft: '1rem', marginRight: '1rem' }}>
                    {(!races.space_marines.use) ? (<option value="space_marines">Space Marines</option>) : (<option value="space_marines">Space Marines    ✓</option>)}
                    {(!races.necrons.use) ? (<option value="necrons">Necrons</option>) : (<option value="necrons">Necrons    ✓</option>)}
                    {(!races.aeldari.use) ? (<option value="aeldari">Aeldari</option>) : (<option value="aeldari">Aeldari    ✓</option>)}
                    {(!races.tyranids.use) ? (<option value="tyranids">Tyranids</option>) : (<option value="tyranids">Tyranids    ✓</option>)}
                </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {Object.keys(races).map((race) => {
                    if (races[race].use) { // if races is used
                        return (
                            <div key={race} style={{ display: 'flex', flexDirection: 'row', gap: '0.25rem', alignItems: 'center' }}>
                                <p style={{marginRight:'1.0rem'}}>{race[0].toUpperCase() + race.slice(1)}</p>
                                <strong>Speed:</strong>
                                <input
                                    style={{ maxWidth: '1rem', maxHeight: '1rem'}}
                                    onChange={(e) => handleAttributeChange(e, race, "speed")}
                                    placeholder={`Enter Speed for ${race}`}
                                    value={races[race].speed || 0}
                                />
                                <strong>Number:</strong>
                                <input
                                    style={{ maxWidth: '1rem', maxHeight: '1rem' }}
                                    onChange={(e) => handleAttributeChange(e, race, "number")}
                                    placeholder={`Enter # units for ${race}`}
                                    value={races[race].number || 0}
                                />
                                <strong>Pattern:</strong>
                                <select
                                    value={races[race]?.pattern || 'default'}
                                    onChange={(e) => handleAttributeChange(e, race, "pattern")}
                                    style={{ maxHeight: '5rem', maxWidth: '5rem' }}
                                >
                                    <option value="default">Default</option>
                                    <option value="sin">Sin</option>
                                    <option value="cos">Cos</option>
                                    <option value="circular">Circular</option>
                                </select>
                            </div>
                        );
                    }
                    return null;
                })}
            </div>
            <div style={{ justifyContent: 'center', alignItems: 'center', marginBottom: '1rem' }}>
                <canvas ref={canvasRef} style={{ border: '1px solid black', maxWidth: '50rem' }} />
            </div>

            {(whoWon !== '') && (
                <h1>{whoWon}</h1>
            )}
        </div>
    );
}
export default Main;