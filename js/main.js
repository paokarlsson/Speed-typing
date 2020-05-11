window.addEventListener("load", start, false);

function start() {
    loadXML("Texts.xml");
    let titles = xmlDoc.getElementsByTagName("object")[0].children;

    console.log(titles.length);
    for (let i = 0; i < titles.length; i += 4) {
        if (titles[i].tagName == );

    }
    // console.log(titles.length);
    // for (let i = 0; i < titles.length; i++) {
    //     let title = titles[i].childNodes[0].nodeValue;

    // }
}

let xmlDoc;
let texts;

class Texts {
    constructor(title, author, language, text) {
        this.title = title;
        this.author = author;
        this.language = language;
        this.text = text;
    }
}

function loadXML(url) {
    let xml = new XMLHttpRequest();
    xml.open("get", url, false);
    xml.send(null);
    xmlDoc = xml.responseXML;
}