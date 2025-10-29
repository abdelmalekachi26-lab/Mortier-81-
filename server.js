const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/calculer-correction', (req, res) => {
    const { distanceObs, directionObs, distanceCible } = req.body;
    
    const correctionPortee = -Math.round(distanceObs / (distanceCible / 1000));
    const correctionDirection = -Math.round(directionObs / (distanceCible / 1000));
    
    let changementCharge = "";
    if (Math.abs(distanceObs) > 150) {
        changementCharge = distanceObs > 0 ? "Diminuer la charge" : "Augmenter la charge";
    }
    
    res.json({
        success: true,
        correctionPortee,
        correctionDirection,
        changementCharge,
        message: `Correction: ${correctionPortee} mils portée, ${correctionDirection} mils direction`
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Simulateur Mortier démarré sur le port ${PORT}`);
});
