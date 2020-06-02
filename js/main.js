let xmlDoc;
let texts = new Array();
let currentText;
let lang = "swedish";
let ignoreCasing = false;
let interval;
let marker = 0;
let nrOfError = 0;
let statistics;

class Text {
    constructor(title, author, language, text) {
        this.title = title;
        this.author = author;
        this.language = language;
        this.text = text;
        this.numberOfChars = text.length;
        this.getNumberOfWords();
        this.makeSpan();
    }
    makeSpan() {
        let readArea = document.createElement("temp");
        readArea.innerHTML = "";
        for (let i = 0; i < this.text.length; i++) {
            let newSpan = document.createElement("span");
            newSpan.setAttribute("id", "span" + i);
            newSpan.innerText = this.text[i];
            readArea.appendChild(newSpan);
        }
        this.spannedText = readArea.innerHTML;
    }
    displayReadArea() {
        let title = document.getElementById("read__title");
        let author = document.getElementById("read__author-details");
        let text = document.getElementById("read__content");
        title.innerHTML = this.title;
        author.innerHTML = this.author + " (" + this.numberOfWords + ", " + this.numberOfChars + ")";
        text.innerHTML = this.spannedText;
    }
    getNumberOfWords() {
        let number = 1;
        for (let i = 0; i < this.text.length; i++) {
            if (this.text[i] === " ") {
                number++
            }
        }
        this.numberOfWords = number;
    }
}

// One element in the statistics array. 
class Stat {
    constructor(markerIndex, timeStamp, correct) {
        this.markerIndex = markerIndex;
        this.timeStamp = timeStamp;
        this.correct = correct;
    }
}

// Staticstics class 
class Stats {
    startTime;
    stopTime;
    stats = new Array();
    getElapsedTimeInMinutes() {
        return (Date.now() - this.startTime) / 60000;
    }
    getElapsedTimeInMinutesUpTo(i) {
        if (this.stats[i] !== undefined) {
            return (this.stats[i].timeStamp - this.startTime) / 60000;
        }
    }
    getGrossWPM() {
        let grossWPM = (this.stats.length / 5) / this.getElapsedTimeInMinutes();
        if (this.startTime !== undefined) {
            return grossWPM.toFixed(0);
        } else {
            return 0;
        }
    }
    getGrossWPMUpTo(i) {
        let grossWPM = ((i + 1) / 5) / this.getElapsedTimeInMinutesUpTo(i);
        if (this.startTime !== undefined) {
            return grossWPM;
        } else {
            return 0;
        }
    }
    getNetWPM() {
        let netWPM = this.getGrossWPM() - (this.getNrOfErrors() / this.getElapsedTimeInMinutes());
        if (this.startTime !== undefined && netWPM > 0) {
            return netWPM.toFixed(0);
        } else {
            return 0;
        }
    }

    getAccuracy() {
        if (this.stats.length !== 0) {
            return (100 - (this.getNrOfErrors() / this.stats.length) * 100).toFixed(0) + "%";
        } else {
            return "0%";
        }
    }

    getNrOfErrors() {
        let count = 0;
        for (let i = 0; i < this.stats.length; i++) {
            if (this.stats[i].correct === false) count++;
        }
        return count;
    }
    getNrOfErrorsUpTo(j) {
        let count = 0;
        for (let i = 0; i < j; i++) {
            if (this.stats[i].correct === false) count++;
        }
        return count;
    }
}

// Plays an error sound. 
function errorSound() {
    let errorSound = new Audio("./audio/error.mp3");
    errorSound.play();
}

// Drawing the perforamce diagram on a html canvas. 
function drawCanvas() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    // Very strange. Need to offset by 0.5 pixels in order to make the canvas sharp.
    ctx.translate(0.5, 0.5);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw horizontal bars
    ctx.beginPath();
    ctx.strokeStyle = 'lightgrey';
    ctx.lineWidth = 1;
    ctx.moveTo(0, 80);
    ctx.lineTo(200, 80);
    ctx.moveTo(0, 60);
    ctx.lineTo(200, 60);
    ctx.moveTo(0, 40);
    ctx.lineTo(200, 40);
    ctx.moveTo(0, 20);
    ctx.lineTo(200, 20);
    ctx.stroke();

    // Draw nr of Errors
    ctx.beginPath();
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 2;
    ctx.moveTo(0, 100);
    for (let i = 0; i < statistics.stats.length; i++) {
        let x = i * ((statistics.stats.length / currentText.text.length) * canvas.width) / statistics.stats.length;
        let y = 100 - statistics.getNrOfErrorsUpTo(i);
        ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw gross WPM
    ctx.beginPath();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.moveTo(0, 100);
    for (let i = 0; i < statistics.stats.length; i++) {
        let x = i * ((statistics.stats.length / currentText.text.length) * canvas.width) / statistics.stats.length;
        let y = 100 - statistics.getGrossWPMUpTo(i);
        ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.translate(-0.5, -0.5);
}

function clearMarker() {
    let allSpan = document.getElementById("read__content").children;
    for (let i = 0; i < allSpan.length; i++) {
        allSpan[i].setAttribute("class", "marker-reset");
    }
}

// Updates the statistics table. And the call the canvas function.
function update() {
    document.getElementById("gross-wpm").innerHTML = statistics.getGrossWPM();
    document.getElementById("accuracy").innerHTML = statistics.getAccuracy();
    document.getElementById("net-wpm").innerHTML = statistics.getNetWPM();
    document.getElementById("errors").innerHTML = statistics.getNrOfErrors();
    drawCanvas();
}

function markNextChar() {
    document.getElementById("span" + marker).setAttribute("class", "marker");
}


// This function is triggerd when the player is pressing the space key.
function spaceKeyDown(e) {
    if (e.keyCode == 32) {
        // It clears the input field.
        document.getElementById("type__input").value = "";
    }
}

// This function is triggerd when the player is typing.
function typing(e) {
    let input = e.target.value;
    let a, b;
    if (ignoreCasing === false) {
        a = input[input.length - 1];
        b = currentText.text[marker];
    } else {
        a = input[input.length - 1].toLowerCase();
        b = currentText.text[marker].toLowerCase();
    }
    let correct;
    if (a === b) {
        document.getElementById("span" + marker).setAttribute("class", "correct");
        correct = true;
    } else {
        document.getElementById("span" + marker).setAttribute("class", "error");
        errorSound();
        nrOfError++;
        correct = false;
    }
    // Every keypress is saved in a statistics object. Which is used form drawing the canvas. 
    let stat = new Stat(marker, Date.now(), correct);
    statistics.stats.push(stat);
    marker++;
    // If its the last character in the text the gameStop function is called to terminate the game. 
    if (marker === currentText.text.length) {
        gameStop();
        return;
    }
    markNextChar();
}

// Disableing all functionallity part from typing area and stop button. 
function disableEnable(trueFalse) {
    document.getElementById("ignore-casing").disabled = trueFalse;
    document.getElementById("language-swe").disabled = trueFalse;
    document.getElementById("language-eng").disabled = trueFalse;
    document.getElementById("text-choice__texts").disabled = trueFalse;
    if (trueFalse) {
        document.getElementById("type__input").disabled = false;
    } else {
        document.getElementById("type__input").disabled = true;
    }
}

// Resetting the game. 
function reset() {
    marker = 0;
    clearMarker();
    statistics.stats = [];
    update();
    document.getElementById("type__input").value = "";
}

// This function is triggerd when stop button is clicked and a game is running.
function gameStop() {
    document.getElementById("start-stop").setAttribute("class", "game-control__btn game-control__btn--start");
    document.getElementById("type__input").removeEventListener("keydown", typing, false);
    disableEnable(false);
    // This stops the call for the update function.
    clearInterval(interval);
    update();
    statistics.stopTime = Date.now();
    document.getElementById("start-stop").focus();
}

// This function is triggerd when start button is clicked and a game is not running.
function gameStart() {
    document.getElementById("start-stop").setAttribute("class", "game-control__btn game-control__btn--stop");
    let inputField = document.getElementById("type__input");
    inputField.value = "";
    disableEnable(true);
    inputField.focus();
    reset();
    inputField.addEventListener("input", typing, false);
    inputField.addEventListener("keydown", spaceKeyDown, false);
    markNextChar();
    statistics.startTime = Date.now();
    // This calls the update function every 200 milliseconds. 
    interval = setInterval(update, 200);
}

// This function is triggerd when a new text is choosen.
function setCurrentText() {
    let textsElement = document.getElementById("text-choice__texts");
    currentText = texts[textsElement.value];
    currentText.displayReadArea();
    document.getElementById("start-stop").focus();
    reset();
}

// This function pupulates the text option field and adds eventlistner to it. 
function populateChooseTexts() {
    let textsElement = document.getElementById("text-choice__texts");
    textsElement.innerHTML = "";
    for (let i = 0; i < texts.length; i++) {
        if (texts[i].language == lang) {
            let option = document.createElement("option");
            option.text = texts[i].title;
            option.value = i;
            textsElement.appendChild(option);
        }
    }
    textsElement.addEventListener("change", setCurrentText, false);
}

function startStopButtonEnter() {
    if (event.keyCode === 13) {
        startStopButtonClicked();
    }
}

// This function is triggerd when the start button is clicked.  
function startStopButtonClicked() {
    if (document.getElementById("start-stop").className === "game-control__btn game-control__btn--start") {
        gameStart();
    } else {
        gameStop();
    }
}

// This function is triggerd when the ingnore casing checkbox changes value. 
function ignoreCasingChange() {
    if (document.getElementById("ignore-casing").checked) {
        ignoreCasing = true;
    } else {
        ignoreCasing = false;
    }
    document.getElementById("start-stop").focus();
}

// This function is triggerd when the language radio button changes value. 
function languageChange() {
    let language = document.getElementsByName("language");
    for (let i = 0; i < language.length; i++) {
        if (language[i].checked) {
            lang = language[i].value;
        }
    }
    populateChooseTexts();
    setCurrentText();
    currentText.displayReadArea();
}

function addEventListeners() {
    document.getElementById("language-swe").addEventListener("change", languageChange, false);
    document.getElementById("language-eng").addEventListener("change", languageChange, false);
    document.getElementById("ignore-casing").addEventListener("change", ignoreCasingChange, false);
    document.getElementById("start-stop").addEventListener("click", startStopButtonClicked, false);
    document.getElementById("start-stop").addEventListener("keyup", startStopButtonEnter, false);
    populateChooseTexts();
}

// Populate a array of text objects from an xml file.  
function loadXMLToArray(url) {
    let xml = new XMLHttpRequest();
    xml.open("get", url, false);
    xml.send(null);
    xmlDoc = xml.responseXML;
    let elements = xmlDoc.getElementsByTagName("object");
    console.log(elements[0].getElementsByTagName("title")[0].innerHTML);
    for (let i = 0; i < elements.length; i++) {
        texts[i] = new Text(
            elements[i].getElementsByTagName("title")[0].innerHTML,
            elements[i].getElementsByTagName("author")[0].innerHTML,
            elements[i].getElementsByTagName("language")[0].innerHTML,
            elements[i].getElementsByTagName("text")[0].innerHTML
        );
    }
}

function start() {
    statistics = new Stats();
    loadXMLToArray("Texts.xml");
    addEventListeners();
    setCurrentText();
    currentText.displayReadArea();
    drawCanvas();
}

window.addEventListener("load", start, false);