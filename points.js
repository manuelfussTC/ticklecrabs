let friendIndex = 1;

function updateScore() {
    // Punktestand aktualisieren
    const scoreElement = document.getElementById('score-board');
    const scoreValue = document.getElementById('score');
    const newScore = parseInt(scoreValue.textContent) + 1;

    scoreValue.textContent = newScore;

    // Punktestand wackeln lassen
    scoreElement.classList.add('shake');
    setTimeout(() => {
        scoreElement.classList.remove('shake');
    }, 500);

    // Pacman wackeln lassen
    const pacmanCell = document.querySelector('.pacman');
    pacmanCell.classList.add('shake');
    setTimeout(() => {
        pacmanCell.classList.remove('shake');
    }, 500);

    // Grannys hüpfen lassen und Feuerwerk-Animation anzeigen bei jedem fünften Punkt
    if (newScore % 5 === 0) {
        showFireworks();
        jumpGrannies();
    }

    // Freund hinzufügen
    addFriend();

    // Überprüfen, ob alle Freunde gefunden wurden
    if (friendIndex > 16) {
        setTimeout(() => {
            showCongratsOverlay();
        }, 1500); // Verzögerung, um das letzte Feuerwerk zu sehen
    }
}

function addFriend() {
    if (friendIndex <= 16) {
        const friend = document.getElementById(`friend${friendIndex}`);
        friend.style.backgroundImage = `url('images/f${friendIndex}.png')`;
        friend.style.backgroundColor = 'transparent'; // Entferne Platzhalterfarbe

        friendIndex++;
    }
}

function showFireworks() {
    const fireworksContainer = document.createElement('div');
    fireworksContainer.id = 'fireworks-container';
    document.body.appendChild(fireworksContainer);

    fireworksContainer.innerHTML = `
        <div class="firework firework1"></div>
        <div class="firework firework2"></div>
        <div class="firework firework3"></div>
        <div class="firework firework4"></div>
        <div class="firework firework5"></div>
        <div class="firework firework6"></div>
    `;

    setTimeout(() => {
        fireworksContainer.remove();
    }, 1500);
}

function jumpGrannies() {
    const grannyBingo = document.getElementById('granny-bingo');
    const grannyBluey = document.getElementById('granny-bluey');
    grannyBingo.classList.add('jump');
    grannyBluey.classList.add('jump');
    setTimeout(() => {
        grannyBingo.classList.remove('jump');
        grannyBluey.classList.remove('jump');
    }, 500);
}

function resetFriends() {
    const friends = document.querySelectorAll('.friend');

    friends.forEach(friend => {
        friend.classList.add('fade-out');
        setTimeout(() => {
            friend.style.backgroundImage = ''; // Entferne Bild
            friend.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'; // Platzhalterfarbe
            friend.classList.remove('fade-out');
        }, 1000);
    });

    friendIndex = 1;
}

function showCongratsOverlay() {
    // Erstelle das Overlay
    const overlay = document.createElement('div');
    overlay.id = 'congrats-overlay';
    overlay.innerHTML = `
        <div class="congrats-message">
            <h1>Herzlichen Glückwunsch, geschafft!</h1>
            <button id="close-overlay">OK</button>
        </div>
    `;
    document.body.appendChild(overlay);

    // Event-Listener für den Schließen-Button
    document.getElementById('close-overlay').addEventListener('click', () => {
        overlay.remove();
        resetFriends();
        resetGame();
        document.getElementById('score').textContent = '0'; // Reset Score
        friendIndex = 1;
        startGame(); // Spiel neu starten
    });

    // Zeige ein größeres Feuerwerk an
    const fireworksContainer = document.createElement('div');
    fireworksContainer.id = 'fireworks-container';
    document.body.appendChild(fireworksContainer);

    fireworksContainer.innerHTML = `
        <div class="firework firework1"></div>
        <div class="firework firework2"></div>
        <div class="firework firework3"></div>
        <div class="firework firework4"></div>
        <div class="firework firework5"></div>
        <div class="firework firework6"></div>
    `;

    setTimeout(() => {
        fireworksContainer.remove();
    }, 3000);

    // Spiel pausieren
    stopGame();
}

function showOhNoOverlay() {
    // Erstelle das Overlay
    const overlay = document.createElement('div');
    overlay.id = 'ohno-overlay';
    overlay.innerHTML = `
        <div class="ohno-message">
            <h1>Schade, die Möwe hat euch gefangen! Macht nichts, nochmal versuchen!</h1>
            <button id="close-ohno-overlay">OK</button>
        </div>
    `;
    document.body.appendChild(overlay);

    // Event-Listener für den Schließen-Button
    document.getElementById('close-ohno-overlay').addEventListener('click', () => {
        overlay.remove();
        resetFriends();
        resetGame();
        document.getElementById('score').textContent = '0'; // Reset Score
        friendIndex = 1;
        startGame(); // Spiel neu starten
    });

    // Spiel pausieren
    stopGame();
}

// Exportiere die Funktionen für die Verwendung in anderen Skripten
window.updateScore = updateScore;
window.resetFriends = resetFriends;
window.showOhNoOverlay = showOhNoOverlay;
window.showCongratsOverlay = showCongratsOverlay;
