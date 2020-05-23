let xmlDoc;

// object containing all texts. 
let texts = new Array();
let currentText = 0;
let lang = "swedish";
let ignoreCasing = false;
let marker = 0;
let nrOfError = 0;
let statsClass;


let interval;
let grossWPM;


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
        let title = document.getElementById("read-title");
        let author = document.getElementById("read-authorAndDetails");
        let text = document.getElementById("read-content");
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
    getNetWPMUpTo(i) {
        let netWPM = this.getGrossWPMUpTo(i) - (this.getNrOfErrorsUpTo(i) / this.getElapsedTimeInMinutesUpTo(i));
        if (this.startTime !== undefined) {
            return netWPM;
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
    getAccuracyUpTo(i) {
        if (this.stats.length !== 0) {
            return 100 - (this.getNrOfErrorsUpTo(i) / i * 100).toFixed(0);
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
    getRealtimeWPMUpTo(i) {
        let k;
        if (i < 5) {
            k = i;
        } else {
            k = 5;
        }
        if (i > 0) {
            let accumulated = this.stats[0].timeStamp - this.startTime;;
            for (let j = 0; j < k; j++) {
                accumulated += this.stats[i - j].timeStamp - this.stats[i - j - 1].timeStamp;
            }
            return 60000 / (5 * accumulated / k);
        } else {
            return 60000 / ((this.stats[0].timeStamp - this.startTime) * 5);
        }
    }
}


function loadXMLToArray(url) {
    let xml = new XMLHttpRequest();
    xml.open("get", url, false);
    xml.send(null);
    xmlDoc = xml.responseXML;
    let elements = xmlDoc.getElementsByTagName("object")[0].children;
    for (let i = 0, j = 0; i < elements.length; i += 4, j++) {
        texts[j] = new Text(elements[i].innerHTML, elements[i + 1].innerHTML, elements[i + 2].innerHTML, elements[i + 3].innerHTML);
    }
}

function addEventListeners() {
    document.getElementById("language-swe").addEventListener("change", languageChange, false);
    document.getElementById("language-eng").addEventListener("change", languageChange, false);
    document.getElementById("ignoreCasing").addEventListener("change", ignoreCasingChange, false);
    document.getElementById("start-stop").addEventListener("click", startStopButtonClicked, false);
    populateChooseTexts();
}

function populateChooseTexts() {
    let textsElement = document.getElementById("texts");
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
    let textsElement = document.getElementById("texts");
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
    if (document.getElementById("ignoreCasing").checked) {
        ignoreCasing = true;
    } else {
        ignoreCasing = false;
    }
}

function gameStart() {
    document.getElementById("start-stop").setAttribute("class", "btn btn-stop");
    document.getElementById("typeArea").value = "";
    disableEnable(true);
    document.getElementById("typeArea").focus();
    reset();
    document.getElementById("typeArea").addEventListener("input", typing, false);
    document.getElementById("typeArea").addEventListener("keydown", spaceHit, false);
    markNextChar();
    statsClass.startTime = Date.now();
    interval = setInterval(update, 200);
}

function gameStop() {
    document.getElementById("start-stop").setAttribute("class", "btn btn-start");
    document.getElementById("typeArea").removeEventListener("keydown", typing, false);
    disableEnable(false);
    clearInterval(interval);
    update();
    statsClass.stopTime = Date.now();
}

function startStopButtonClicked() {

    if (document.getElementById("start-stop").className === "btn btn-start") {
        gameStart();
    } else {
        gameStop();
    }
}

function clearMarker() {
    let allSpan = document.getElementById("read-content").children;
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
    statsClass.stats.push(stat);
    marker++;
    if (marker === currentText.text.length) {
        gameStop();
        return;
    }
    markNextChar();
    console.log(statsClass.getRealtimeWPMUpTo(statsClass.stats.length - 1));
}

function spaceHit(e) {
    if (e.keyCode == 32) {
        document.getElementById("typeArea").value = "";
    }
}

function errorSound() {
    let errorSound = new Audio("./audio/error.mp3");
    errorSound.play();
}

function update() {
    document.getElementById("grossWPM").innerHTML = statsClass.getGrossWPM();
    document.getElementById("accuracy").innerHTML = statsClass.getAccuracy();
    document.getElementById("netWPM").innerHTML = statsClass.getNetWPM();
    document.getElementById("errors").innerHTML = statsClass.getNrOfErrors();
    canvas();
}

function disableEnable(trueFalse) {
    document.getElementById("ignoreCasing").disabled = trueFalse;
    document.getElementById("language-swe").disabled = trueFalse;
    document.getElementById("language-eng").disabled = trueFalse;
    document.getElementById("texts").disabled = trueFalse;
    if (trueFalse) {
        document.getElementById("typeArea").disabled = false;
    } else {
        document.getElementById("typeArea").disabled = true;
    }
}

function reset() {
    marker = 0;
    nrOfError = 0;
    clearMarker();
    statsClass.stats = [];
    update();
    document.getElementById("typeArea").value = "";
}

function canvas() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    ctx.translate(0.5, 0.5);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw horizontal bars
    ctx.beginPath();
    ctx.strokeStyle = 'rgb(255,255,255)';
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

    ctx.beginPath();
    ctx.strokeStyle = 'lightblue';
    ctx.lineWidth = 1;
    ctx.moveTo(0, 100);
    for (let i = 0; i < statsClass.stats.length; i++) {
        let x = i * ((statsClass.stats.length / currentText.text.length) * canvas.width) / statsClass.stats.length;
        let y = 100 - statsClass.getRealtimeWPMUpTo(i);
        ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 1;
    ctx.moveTo(0, 100);
    for (let i = 0; i < statsClass.stats.length; i++) {
        let x = i * ((statsClass.stats.length / currentText.text.length) * canvas.width) / statsClass.stats.length;
        let y = 100 - statsClass.getNetWPMUpTo(i);
        ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 1;
    ctx.moveTo(0, 100);
    for (let i = 0; i < statsClass.stats.length; i++) {
        let x = i * ((statsClass.stats.length / currentText.text.length) * canvas.width) / statsClass.stats.length;
        let y = 100 - statsClass.getNrOfErrorsUpTo(i);
        ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.moveTo(0, 100);
    for (let i = 0; i < statsClass.stats.length; i++) {
        let x = i * ((statsClass.stats.length / currentText.text.length) * canvas.width) / statsClass.stats.length;
        let y = 100 - statsClass.getGrossWPMUpTo(i);
        ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.translate(-0.5, -0.5);
}

function start() {
    loadXMLToArray("Texts.xml");
    addEventListeners();
    statsClass = new Stats();
    setCurrentText();
    currentText.displayReadArea();
    canvas();



}


window.addEventListener("load", start, false);