const battlefield = document.getElementById('battlefield');
const target = document.getElementById('target');
const impact = document.getElementById('impact');
const coordinates = document.getElementById('coordinates');
const azimutInput = document.getElementById('azimut');
const porteeInput = document.getElementById('portee');
const chargeInput = document.getElementById('charge');
const boutonTir = document.getElementById('bouton-tir');
const ecartDistance = document.getElementById('ecart-distance');
const ecartDirection = document.getElementById('ecart-direction');
const boutonCorrection = document.getElementById('bouton-correction');
const resultatCorrection = document.getElementById('resultat-correction');
const entreesJournal = document.getElementById('entrees-journal');

let impactX = 0;
let impactY = 0;
const targetX = battlefield.offsetWidth * 0.7;
const targetY = battlefield.offsetHeight * 0.5;
let compteurTirs = 0;

target.style.left = `${targetX}px`;
target.style.top = `${targetY}px`;

boutonTir.addEventListener('click', simulerTir);
boutonCorrection.addEventListener('click', calculerCorrection);
battlefield.addEventListener('mousemove', mettreAJourCoordonnees);

function simulerTir() {
    compteurTirs++;
    
    const azimut = parseInt(azimutInput.value) || 1420;
    const portee = parseInt(porteeInput.value) || 1250;
    const charge = parseInt(chargeInput.value) || 2;
    
    const erreurAzimut = (azimut - 1420) * 0.5;
    const erreurPortee = (portee - 1250) * 0.3;
    
    impactX = targetX + erreurAzimut + (Math.random() - 0.5) * 50;
    impactY = targetY + erreurPortee + (Math.random() - 0.5) * 50;
    
    impact.style.left = `${impactX}px`;
    impact.style.top = `${impactY}px`;
    impact.style.display = 'block';
    
    const ecartX = Math.round(impactX - targetX);
    const ecartY = Math.round(impactY - targetY);
    
    ecartDistance.value = ecartY;
    ecartDirection.value = ecartX;
    
    ajouterEntreeJournal(`Tir #${compteurTirs}: Azimut ${azimut}, Portée ${portee}, Charge ${charge}`);
    
    if (Math.abs(ecartX) < 15 && Math.abs(ecartY) < 15) {
        ajouterEntreeJournal('🎯 CIBLE NEUTRALISÉE! Mission accomplie!', 'success');
    }
}

async function calculerCorrection() {
    const distance = parseInt(ecartDistance.value) || 0;
    const direction = parseInt(ecartDirection.value) || 0;
    
    try {
        const response = await fetch('/api/calculer-correction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                distanceObs: distance,
                directionObs: direction,
                distanceCible: 1250
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            let html = `
                <strong>Corrections calculées:</strong><br>
                📏 Portée: ${data.correctionPortee} mils<br>
                🧭 Direction: ${data.correctionDirection} mils
            `;
            
            if (data.changementCharge) {
                html += `<br>⚡ ${data.changementCharge}`;
            }
            
            html += `<br><br>
                <button onclick="appliquerCorrection(${data.correctionPortee}, ${data.correctionDirection})" 
                        style="background:#2c5530;color:white;border:none;padding:8px 15px;border-radius:5px;cursor:pointer;">
                    Appliquer
                </button>
            `;
            
            resultatCorrection.innerHTML = html;
            resultatCorrection.style.display = 'block';
            
            ajouterEntreeJournal(`Correction calculée: ${data.correctionPortee}m portée, ${data.correctionDirection}m direction`);
        }
    } catch (error) {
        calculerCorrectionLocale(distance, direction);
    }
}

function calculerCorrectionLocale(distance, direction) {
    const correctionPortee = -Math.round(distance / 1.25);
    const correctionDirection = -Math.round(direction / 1.25);
    
    let changementCharge = "";
    if (Math.abs(distance) > 150) {
        changementCharge = distance > 0 ? "Diminuer la charge" : "Augmenter la charge";
    }
    
    let html = `
        <strong>Corrections calculées:</strong><br>
        📏 Portée: ${correctionPortee} mils<br>
        🧭 Direction: ${correctionDirection} mils
    `;
    
    if (changementCharge) {
        html += `<br>⚡ ${changementCharge}`;
    }
    
    html += `<br><br>
        <button onclick="appliquerCorrection(${correctionPortee}, ${correctionDirection})" 
                style="background:#2c5530;color:white;border:none;padding:8px 15px;border-radius:5px;cursor:pointer;">
            Appliquer
        </button>
    `;
    
    resultatCorrection.innerHTML = html;
    resultatCorrection.style.display = 'block';
}

function appliquerCorrection(correctionPortee, correctionDirection) {
    const nouvelAzimut = parseInt(azimutInput.value) + correctionDirection;
    const nouvellePortee = parseInt(porteeInput.value) + correctionPortee;
    
    azimutInput.value = nouvelAzimut;
    porteeInput.value = nouvellePortee;
    
    resultatCorrection.style.display = 'none';
    ajouterEntreeJournal(`Corrections appliquées: ${correctionDirection}m azimut, ${correctionPortee}m portée`);
}

function mettreAJourCoordonnees(e) {
    const rect = battlefield.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const distX = Math.round((x - targetX) / 2);
    const distY = Math.round((targetY - y) / 2);
    
    coordinates.textContent = `Position: ${distX}m (${distX > 0 ? 'Droite' : 'Gauche'}), ${distY}m (${distY > 0 ? 'Au-delà' : 'En deçà'})`;
}

function ajouterEntreeJournal(message, type = 'info') {
    const maintenant = new Date();
    const heure = `${maintenant.getHours().toString().padStart(2, '0')}:${maintenant.getMinutes().toString().padStart(2, '0')}:${maintenant.getSeconds().toString().padStart(2, '0')}`;
    
    const entree = document.createElement('div');
    entree.className = 'entree-journal';
    entree.innerHTML = `
        <div style="color:#a8d5a8; font-size:12px;">${heure}</div>
        <div>${message}</div>
    `;
    
    if (type === 'success') {
        entree.style.borderLeft = '4px solid #4CAF50';
    }
    
    entreesJournal.prepend(entree);
    
    if (entreesJournal.children.length > 10) {
        entreesJournal.removeChild(entreesJournal.lastChild);
    }
}

setTimeout(() => {
    ajouterEntreeJournal('Mission: Neutraliser cible à 1250m');
    simulerTir();
}, 1000);
