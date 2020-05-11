let xmlDoc;

// object containing all texts. 
let texts = new Array();
let currentText = 0;
let lang = "swedish";
let ignoreCasing = false;

class Text {
    constructor(title, author, language, text) {
        this.title = title;
        this.author = author;
        this.language = language;
        this.text = text;
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
    currentText = textsElement.value;
    makeSpan(texts[currentText].text);
    document.getElementById("span3").setAttribute("class", "marker");

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

function makeSpan(text) {
    let readArea = document.getElementById("read");
    readArea.innerHTML = "";
    for (let i = 0; i < text.length; i++) {
        let newSpan = document.createElement("span");
        newSpan.setAttribute("id", "span" + i);
        newSpan.innerText = text[i];
        readArea.appendChild(newSpan);
    }
}

function start() {
    loadXMLToArray("Texts.xml");
    languageChange();
    populateChooseTexts();
    setCurrentText();
    document.getElementById("ignoreCasing").addEventListener("change", ignoreCasingChange, false);


}

window.addEventListener("load", start, false);