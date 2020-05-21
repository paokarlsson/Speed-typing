let xmlDoc;

// object containing all texts. 
let texts = new Array();
let currentText = 0;
let lang = "swedish";
let ignoreCasing = false;
let marker = 0;
let nrOfError = 0;

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

function setCurrentText() {
    let textsElement = document.getElementById("texts");
    currentText = texts[textsElement.value];
    currentText.displayReadArea();

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

function languageChangeEvent() {
    let language = document.getElementsByName("language");
    for (let i = 0; i < language.length; i++) {
        if (language[i].checked) {
            lang = language[i].value;
        }
    }
    populateChooseTexts();
    setCurrentText();
}

function languageChange() {
    let language = document.getElementsByName("language");
    for (let i = 0; i < language.length; i++) {
        language[i].addEventListener("change", languageChangeEvent, false);
    }

}

function ignoreCasingChange() {
    if (document.getElementById("ignoreCasing").checked) {
        ignoreCasing = true;
    } else {
        ignoreCasing = false;
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
    console.log(input[input.length - 1]);
    console.log(currentText.text[marker]);
    if (input[input.length - 1] === currentText.text[marker]) {
        document.getElementById("span" + marker).setAttribute("class", "correct");
    } else {
        document.getElementById("span" + marker).setAttribute("class", "error");
        nrOfError++;
    }
    marker++;
    markNextChar();
}

function spaceHit(e) {
    if (e.keyCode == 32) {
        document.getElementById("typeArea").value = "";
    }
}
let startTime;
let stopTime;
let interval;

function update() {
    document.getElementById("grossWPM").innerHTML = nrOfError;
    let accuracy;
    if (marker !== 0) {
        accuracy = 100 - ((nrOfError / marker) * 100).toFixed(0) + "%";
    } else {
        accuracy = "0%";
    }
    document.getElementById("accuracy").innerHTML = accuracy;
    document.getElementById("netWPM").innerHTML = nrOfError;
    document.getElementById("errors").innerHTML = nrOfError;

    //document.getElementById("stats-time").innerHTML = parseFloat((Date.now() - startTime) / 1000).toFixed(1);
}

function startStopButtonClicked() {

    if (document.getElementById("start-stop").value === "Start") {
        document.getElementById("start-stop").value = "Stop";
        document.getElementById("typeArea").focus();
        document.getElementById("typeArea").value = "";
        marker = 0;
        nrOfError = 0;
        clearMarker();
        update();
        document.getElementById("typeArea").addEventListener("input", typing, false);
        document.getElementById("typeArea").addEventListener("keydown", spaceHit, false);
        markNextChar();
        startTime = Date.now();
        interval = setInterval(update, 50);
        console.log(startTime);
    } else {
        document.getElementById("start-stop").value = "Start";
        document.getElementById("typeArea").removeEventListener("keydown", typing, false);
        clearInterval(interval);
        stopTime = Date.now();
        console.log(stopTime);
    }
    console.log(stopTime - startTime);
}

function start() {
    loadXMLToArray("Texts.xml");
    languageChange();
    populateChooseTexts();
    setCurrentText();
    document.getElementById("ignoreCasing").addEventListener("change", ignoreCasingChange, false);

    document.getElementById("start-stop").addEventListener("click", startStopButtonClicked, false);


}

window.addEventListener("load", start, false);