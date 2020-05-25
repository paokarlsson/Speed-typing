let xmlDoc;
let texts = new Array();
let currentText;
let lang = "swedish";
let ignoreCasing = false;
let statistics;
let interval;
let game;

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

class Stat {
    constructor(markerIndex, timeStamp, correct) {
        this.markerIndex = markerIndex;
        this.timeStamp = timeStamp;
        this.correct = correct;
    }
}

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
        if (this.startTime !== undefined) {
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

function setCurrentText() {
    let textsElement = document.getElementById("text-choice__texts");
    currentText = texts[textsElement.value];
    currentText.displayReadArea();
    document.getElementById("start-stop").focus();
    reset();
}

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

function ignoreCasingChange() {
    if (document.getElementById("ignore-casing").checked) {
        ignoreCasing = true;
    } else {
        ignoreCasing = false;
    }
}

function gameStart() {
    document.getElementById("start-stop").setAttribute("class", "game-control__btn game-control__btn--stop");
    document.getElementById("type__input").value = "";
    disableEnable(true);
    document.getElementById("type__input").focus();
    reset();
    document.getElementById("type__input").addEventListener("input", typing, false);
    document.getElementById("type__input").addEventListener("keydown", spaceHit, false);
    markNextChar();
    game.statistics.startTime = Date.now();
    interval = setInterval(update, 200);
}

function gameStop() {
    document.getElementById("start-stop").setAttribute("class", "game-control__btn game-control__btn--start");
    document.getElementById("type__input").removeEventListener("keydown", typing, false);
    disableEnable(false);
    clearInterval(interval);
    update();
    game.statistics.stopTime = Date.now();
}

function startStopButtonClicked() {

    if (document.getElementById("start-stop").className === "game-control__btn game-control__btn--start") {
        gameStart();
    } else {
        gameStop();
    }
}

function clearMarker() {
    let allSpan = document.getElementById("read__content").children;
    for (let i = 0; i < allSpan.length; i++) {
        allSpan[i].setAttribute("class", "marker-reset");
    }
}

function markNextChar() {
    document.getElementById("span" + marker).setAttribute("class", "marker");
}

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
    let stat = new Stat(marker, Date.now(), correct);
    game.statistics.stats.push(stat);
    marker++;
    if (marker === currentText.text.length) {
        gameStop();
        return;
    }
    markNextChar();
}

function spaceHit(e) {
    if (e.keyCode == 32) {
        document.getElementById("type__input").value = "";
    }
}

function errorSound() {
    let errorSound = new Audio("./audio/error.mp3");
    errorSound.play();
}

function update() {
    document.getElementById("gross-wpm").innerHTML = game.statistics.getGrossWPM();
    document.getElementById("accuracy").innerHTML = game.statistics.getAccuracy();
    document.getElementById("net-wpm").innerHTML = game.statistics.getNetWPM();
    document.getElementById("errors").innerHTML = game.statistics.getNrOfErrors();
    canvas();
}

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

function reset() {
    marker = 0;
    nrOfError = 0;
    clearMarker();
    game.statistics.stats = [];
    update();
    document.getElementById("type__input").value = "";
}

function canvas() {
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
    for (let i = 0; i < game.statistics.stats.length; i++) {
        let x = i * ((game.statistics.stats.length / currentText.text.length) * canvas.width) / game.statistics.stats.length;
        let y = 100 - game.statistics.getNrOfErrorsUpTo(i);
        ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw gross WPM
    ctx.beginPath();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.moveTo(0, 100);
    for (let i = 0; i < game.statistics.stats.length; i++) {
        let x = i * ((game.statistics.stats.length / currentText.text.length) * canvas.width) / game.statistics.stats.length;
        let y = 100 - game.statistics.getGrossWPMUpTo(i);
        ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.translate(-0.5, -0.5);
}

class Game {
    statistics = new Stats();
}

function addEventListeners() {
    document.getElementById("language-swe").addEventListener("change", languageChange, false);
    document.getElementById("language-eng").addEventListener("change", languageChange, false);
    document.getElementById("ignore-casing").addEventListener("change", ignoreCasingChange, false);
    document.getElementById("start-stop").addEventListener("click", startStopButtonClicked, false);
    populateChooseTexts();
}

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
    loadXMLToArray("Texts.xml");
    addEventListeners();
    game = new Game();
    //game.statistics = new Stats();

    setCurrentText();
    currentText.displayReadArea();
    canvas();

}


window.addEventListener("load", start, false);