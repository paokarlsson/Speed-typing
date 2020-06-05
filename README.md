# Projektuppgift
## Utvecklingsmiljö & Verktyg
Webbapplikationen är byggd i VS Code på en Windows 10 laptop och testad i Google Chrome, Microsoft Edge och Firefox.

## Syfte
Det här är den sista uppgiften i kursen Webbprogrammering med HTML5, CSS3 & JavaScript. Syftet med projektet är att bygga ett spel/övningsverktyg som går ut på att skriva fort och rätt på ett tangentbord. Projektet går under namnet Speed typing.

Det finns en lång kravspecifikation för hur och vad som ska implementeras. Dessa är några av de mer intressanta kraven:

* En markör som visar vilken bokstav som ska skrivas in.

* Läsa in texter från en XML-fil.

* I realtid rita upp en graf över skrivhastigheten på en canvas.

## Genomförande
### Markören
Markören är placerad på det tecken som ska skrivas in härnäst då spelet är igång. Markören har en annan backgrundsfärg och ska flyttas fram till nästa tecken så fort användaren trycker ner en tangent. Detta sker oavsett om det är rätt eller fel tecken som skrivits in. För att få detta att fungera så är varje tecken i texten omsluten av en span-tag med ett unikt id. 

``` code
    makeSpan() {
        let readArea = document.createElement("temp");
        for (let i = 0; i < this.text.length; i++) {
            let newSpan = document.createElement("span");
            newSpan.setAttribute("id", "span" + i);
            newSpan.innerText = this.text[i];
            readArea.appendChild(newSpan);
        }
        this.spannedText = readArea.innerHTML;
    }
```
Här ovan är en funktion som gör om en text sträng till en ny text sträng fast med span-taggar runt varje tecken. Funktionen är placerad i Text-klassen.
Först initieras ett tomt temp-element med namn readArea. 'this.text' är texten som ska göras om så varje tecken omsluts av span-taggar. För varje tecken i 'this.text' körs en for-loop. I kroppen på for-loopen skapas en ny span-tag och den tilldelas ett unikt id, t. ex.   'span1'. Som innerText till span taggen sätts det tecken som för tillfället itereras förbi. Därefter används funtionen appendChild för att lägga till span-tagen till readArea. Det sista som görs är att det som står mellan taggarna i readArea, alltså alla span-element, sparas i objektet Text som 'this.spannedText'.

I och med detta är det enkelt att med hjälp av JavaScript komma åt varje bokstav separat genom dess unika id. 

I CSS-filen finns sedan fyra klasser som är förberedda att kunna användas för att manipulera hur ett separat tecken ser ut. Se nedan.

``` code
.marker {
    background-color: skyblue;
    color: black;
}

.marker-reset {
    background-color: transparent;
}

.error {
    color: red;
}

.correct {
    color: #777;
}
```

I JavaScript-filen finns kodsnutten nedan. Längst ner i skriptet initieras en eventlyssnare som lyssnar till förändringar i textfältet där texten skrivs in. 
Eventlyssnaren triggar i sin tur funktionen typing(e). 
Funktionen tar sedan det senast skrivna tecknet och jämför det med aktuellt tecken i text strängen. Beroende på om användaren valt att bocka för 'Ignore casing' bestäms sedan om de båda tecknen är lika eller inte. Om tecknen matchar byter tecknet färg  till mörk grå annars blir det rött. 
Samtidigt lagras även tidpunkten, om det var korrekt och vilket tecken i ordningen det var, till en array i statistik objektet.  
Markör iteratorn stegas upp ett steg och funktionen markNextChar() anropas för att markera sästa tecken på tur. 
Om markör iteratorn är lika med textens längd, det vill säga att texten är slut, anropas gameStop() funktionen som stannar spelet.  

``` code
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
    statistics.stats.push(stat);
    marker++;
    if (marker === currentText.text.length) {
        gameStop();
        return;
    }
    markNextChar();
}

document.getElementById("type__input").addEventListener("input", typing, false);
```
### Texter från XML
Texterna som finns att välja på hämtas dynamiskt från en XML-fil, Texts.xml, och strukturers som ett objekt av Text-klassen. 
Funktionen, loadXMLToArray(url), nedan löser detta. Först tar den emot adressen till XML-filen som ett arrgument till funktionen. Därefter skapas ett nytt XMLHttpRequest objekt och funktionerna .open() och .send() körs. Därefter finns filens innehåll lättåtkommlig i .responseXML.
XML-filen är något omstruktured jämfört med orginalfilen. Varje text, med titel, författare och språk, är nu omsluten av en object-tag som gör den lättare att kommunicera med. I koden nedan visas hur, genom en for-loop, varje objekt itereras förbi och dess innehåll fyller upp en array med Text-objekt. 

``` code
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
```

### Realtidsstatistik på canvas
Nedan är funktionen drawCanvas(). Den har som uppgift att kontinuerligt rita upp all tillgänglig statistik. Den anropas genom funktionen setInterval varje 200 millesekunder då spelet är igång.

Bland det första som funktionen gör är en pixelförskjutning med 0,5 pixlar i y och x-led. Detta är för att få canvasen skarp. Detta nollställs i slutet av funktionen genom att det sätts tillbaka med -0,5 pixlar. 

Därefter körs en clearRect för att radera allt som finns ritat innan nytt innehåll tillkommer. 

För att sedan rita upp själva statistiken så används en for-loop som itererar över all tillgänglig statistik. Ritningen utgår från nedre vänstra hörnet och x kordinaten räknas ut utifrån antalet statistikelement i statistik objektet i förhållande till textens längd. Sedan mappas det till canvasens beredd. För att få fram y kordinaten behövs ingen mappning, här ligger de intressanta dataintervallet inom canvasens höjd. Det ända som behöver göras är att ta 100 och dra ifrån statistiken eftersom canvasen räknar origo från övre vänstra hörnet. 
Förutom statistik för skrivhastighet så markeras även antalet fel ut löpande i grafen. 

```code
function drawCanvas() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    ctx.translate(0.5, 0.5);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    /*
    ...
    */
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
```

### Test
Speed typing är publicerad på studenter.miun.se/~olka0600/speedtyping/ och är testad och verkar funka bra i Google Chrome, Microsoft Edge och Firefox. 


## Diskussion
Projektuppgiften kändes från början lite övermäktig men efter det att jag satt igång så visade det sig att det gick relativt bra ändå. Riktigt kul var momentet med canvas. Det kommer jag ha nytta av. Det var som att kliva över en tröskel. Hade mer tid funnits så hade jag strukturerat om koden så att funktioner som hade med varandra att göra lyfts in i en egen klass. Jag gjorde det för några funktioner och jag gjorde några försök på fler delar men det skapade fler problem än det löste så jag lämnade det därhän. 

Utifrån de i mitt tycke mest intressanta delarna i kravspecifikationen så tycker jag att de är lösta i bemärkelsen att de är implementerade och fungerar. Sedan som jag skrev ovan hade jag gärna jobbat mera med refaktorering. 