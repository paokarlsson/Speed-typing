# Projektuppgift
## Utvecklingsmiljö & Verktyg
Webbapplikationen är byggd i VS Code på en Windows 10 laptop.

## Syfte
Det här är den sista projektuppgiften i kursen Webbprogrammering med HTML5, CSS3 & JavaScript. Syftet med projektet är att bygga ett spel/övningsverktyg som går ut på att skriva fort och rätt på ett tangentbord. Projektet går under namnet Speed typing. Speed typing går alltså ut på att skriva av ett text stycke. I texten ska det finnas en markör som visar vilken bokstav som ska skrivas härnest och vid knapptryckning så ska markören hoppa fram ett steg. 
Det finns en lång kravspecifikation för hur och vad som ska implementeras. Dessa är några av de mer intressanta kraven: 
- En markör som visar vilken bokstav som ska skrivas in.
- Läsa in texter från en separat XML-fil.
- I realtid rita upp en graf över skrivhastigheten på en canvas.

## Genomförande
### Markören
Markören är det tecken som ska skrivas in härnäst då spelet är igång. Markören har en annan backgrundsfärg än övriga bokstäver och ska flyttas fram till nästa tecken så fort användaren trycker ner en tangent. För att få detta att fungera så är varje tecken i texten omsluten av en span-tag med ett unikt id. 

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
Här ovan är en funktion som är placerad i Text-klassen.
Först initieras ett tomt temp-element med namn readArea. 'this.text' är texten som ska göras om så varje tecken omsluts av span-taggar. För varje tecken i 'this.text' körs en for-loop. I kroppen på for-loopen skapas en ny span-tag och den tilldelas ett unikt id, 'span1' tex. Som innerText till span taggen sätts det tecken som för tillfället itereras förbi. Därefter används funtionen appendChild för att lägga till span-tagen till readArea. Det sista som görs är att det som står mellan taggarna i readArea, alltså alla span-element, sparas i objektet Text som 'this.spannedText'.

I och med detta är det enkelt att komma åt varje bokstav separat genom dess unika id. 

I CSS-filen finns sedan fyra klasser som är förberedda att kunna användas för att manipulera hur ett separat tecken ser ut. 

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



### Test
Speed typing är publicerad på studenter.miun.se/~olka0600/speedtyping/ och är testad och verkar funka bra i Google Chrome, Microsoft Edge och Firefox. 


## Diskussion
Projektuppgiften kändes från början lite övermäktig men efter det att jag satt igång så visade det sig att det gick relativt bra ändå.

Hade mer tid funnits så hade jag strukturerat om koden så att funktioner som hade med varandra att göra lyfts in i en egen klass. Jag gjorde några försök på detta men det skapade fler problem än det löste så jag lämnade det därhän. 