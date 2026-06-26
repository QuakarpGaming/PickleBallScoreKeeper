//Globals//////////
var namesDict = {
    "N1": "",
    "N2": "",
    "S1": "",
    "S2": "",
}
var LastSideOutScores = {
    "N": 0,
    "S": 0
}
var currentSideOutScore = 0;
var nScore = 0;
var sScore = 0;
var serverNumber = 1;
var takeInput = true;
var numberToStringDic = {
    3: "threes",
    4: "fours",
    5: "fives",
    6: "sixes",
    7: "sevens",
    8: "Eights",
    9: "nines",
    10: "tens",
    11: "Elevenies",
}
///////////////////////////
document.addEventListener("DOMContentLoaded", (event) => {
    var namesToLoadStr = window.localStorage.getItem("names")
    if (namesToLoadStr != null && namesToLoadStr.trim() != "") {
        var namesList = namesToLoadStr.split(',');
        var savedNames = document.getElementById("names");

        namesList.forEach(name => {
            if (name != "") {
                var newOption = document.createElement("option");
                newOption.value = name;
                savedNames.appendChild(newOption);
                var newDiv = document.createElement("div")
                newDiv.innerHTML = name + "&nbsp<button style='vertical-align:middle;' onclick='removeName(\"" + name + "\")'>X</button>";
                document.getElementById("nameHistory").appendChild(newDiv);
            }
        })
    }

    var play2 = window.sessionStorage.getItem("PLAYTILL");
    if (play2 != null) {
        document.getElementById("playTill").value = play2
    }

    var winByTwo = window.sessionStorage.getItem("WINBY2");
    if (winByTwo != null) {
        document.getElementById("winBy2").checked = winByTwo == "true";
    }

})
function UpdateServer(place, name) {
    namesDict[place] = name;
}

////////////////////////////
/////////Key Presses////////
////////////////////////////
document.addEventListener("keydown", KeyPress)

function BlockKeyPress() {
    takeInput = false;
}
function AllowKeyPress(setNames = false) {
    takeInput = true;
}

function KeyPress(e) {
    if (takeInput) {
        if (e.code === "Space") {
            UseVoice("SCORE");
        }
        else if (e.code === "ArrowUp") {
            UpScore();
        }
        else if (e.code === "ArrowDown") {
            DownScore();
        }
        else if (e.code === "ArrowRight") {
            NextServer();
        }
        else if (e.code === "ArrowLeft") {
            LastServer();
        }
        else if (e.code === "KeyW") {
            UpOtherScore();
        }
        else if (e.code === "KeyS") {
            DownOtherScore();
        }

    }
}
//////////////////////////////////
//////////////////////////////////
//////////////////////////////////

////////////////////
//////////Names/////
////////////////////
function UpdateServerAndDataList(newName) {
    if (newName != null && newName != "") {
        newName = newName.trim();
        newName = newName.charAt(0).toUpperCase() + newName.slice(1);

        var savedNames = document.getElementById("names");
        if (!(Array.from(savedNames.options).some(option => option.value === newName))) {
            var option = document.createElement('option');
            option.value = newName;
            savedNames.appendChild(option);
            ReorderSavedNames();
        }
    }
}
function ReorderSavedNames() {
    var savedNames = document.getElementById("names");
    var options = Array.from(savedNames.options);
    options.sort((a, b) => {
        return a.value.localeCompare(b.value);
    });
    savedNames.innerHTML = '';

    options.forEach(o => {
        savedNames.appendChild(o)
    });
    updateLocalNamesList();
}

function updateLocalNamesList() {
    var savedNames = document.getElementById("names");
    var options = Array.from(savedNames.options);
    var saveString = '';
    options.forEach(o => {
        saveString += (o.value + ',');
    })
    window.localStorage.setItem("names", saveString);
}
function removeName(name) {
    var savedNames = document.getElementById("names");
    var nameToRemoveOption = Array.from(savedNames.options).find(option => option.value === name)
    savedNames.removeChild(nameToRemoveOption);

    var ulSavedName = document.getElementById("nameHistory")
    var nameToRemoveOption = Array.from(ulSavedName.children).find(option => option.innerHTML.startsWith(name))
    ulSavedName.removeChild(nameToRemoveOption);
    updateLocalNamesList();
}
////////////////////////////////
/////////end of names///////////
////////////////////////////////

////////////////////////////////
//////////scores////////////////
////////////////////////////////

function SetScoreHTML() {
    var scoreHTML = ""
    var serverNameToShow = "";

    var modServerNumber = (serverNumber % 4);
    var scoreServerNumber = (modServerNumber % 2) + 1;

    if (modServerNumber < 2 || serverNumber == 1) //NorthSide First
    {
        scoreHTML = (nScore == 0 ? '<img src="pickleJar.png" class="PickleImg">' : nScore.toString())
            + ' - '
            + (sScore == 0 ? '<img src="pickleJar.png" class="PickleImg">' : sScore.toString())
        if (serverNumber == 1) {
            serverNameToShow = namesDict["N1"]
        }
        else if (isEven(currentSideOutScore)) {
            serverNameToShow = namesDict["N" + scoreServerNumber];
        }
        else {
            serverNameToShow = namesDict["N" + (scoreServerNumber == 1 ? "2" : "1")];
        }
    }
    else //south Side First
    {
        scoreHTML = (sScore == 0 ? '<img src="pickleJar.png" class="PickleImg">' : sScore.toString())
            + ' - '
            + (nScore == 0 ? '<img src="pickleJar.png" class="PickleImg">' : nScore.toString())
        if (isEven(currentSideOutScore)) {
            serverNameToShow = namesDict["S" + scoreServerNumber];
        }
        else {
            serverNameToShow = namesDict["S" + (scoreServerNumber == 1 ? "2" : "1")];
        }
    }
    scoreHTML += ' - ';
    scoreHTML += serverNumber != 1 ? scoreServerNumber.toString() : "2"

    document.getElementById("score").innerHTML = scoreHTML
    document.getElementById("server").innerHTML = serverNameToShow + " To Serve"

}
function UpScore() {
    var modServerNumber = serverNumber % 4
    if (modServerNumber < 2) {
        nScore++;
    }
    else {
        sScore++;
    }
    CheckWinner();
    SetScoreHTML();
}
function DownScore() {
    var modServerNumber = serverNumber % 4
    if (modServerNumber < 2 && nScore != 0) {
        nScore--;
    }
    else if (sScore != 0) {
        sScore--;
    }
    SetScoreHTML()
}

function UpOtherScore() {
    var modServerNumber = serverNumber % 4
    if (modServerNumber < 2) {
        sScore++;
    }
    else {
        nScore++;
    }
    CheckWinner();
    SetScoreHTML();
}
function DownOtherScore() {
    var modServerNumber = serverNumber % 4
    if (modServerNumber < 2 && sScore != 0) {
        sScore--;
    }
    else if (nScore != 0) {
        nScore--;
    }
    SetScoreHTML()
}
function CheckWinner() {
    var modServerNumber = serverNumber % 4;
    var scoreToCheck = modServerNumber < 2 ? nScore : sScore;
    var otherScore = modServerNumber < 2 ? sScore : nScore;
    var playingTill = parseInt(document.getElementById("playTill").value);
    var winBy2 = document.getElementById("winBy2").checked;
    if (scoreToCheck >= playingTill) {
        if (scoreToCheck - otherScore >= 2 || !winBy2) {
            OpenWinnerPopup();
            UseVoice("WIN");
        }
    }
    else if (scoreToCheck == 1) {
        UseVoice("OUTOFJAR")
    }
}
function OpenWinnerPopup() {
    document.getElementById("WinnerText").innerHTML = GetNames() + " Have won the set."
    window.location = "#WinnerPopup";
}
////////////////////////////////
////////////////////////////////
////////////////////////////////

////////////////////////////////
////////////servers/////////////
////////////////////////////////
function LastServer() {
    if (serverNumber != 1) serverNumber--;

    if (serverNumber % 2 == 0) {
        console.log("YES!")
    }
    SetScoreHTML()
}
function NextServer() {
    serverNumber++;
    if (serverNumber % 2 == 0) {
        UseVoice("SIDEOUT")
        SetCurrentSideOutScore();
    }

    SetScoreHTML()
}
function SetCurrentSideOutScore() {
    var modServerNumber = serverNumber % 4;
    currentSideOutScore = modServerNumber < 2 ? nScore : sScore;
}
////////////////////////////////
////////////////////////////////
////////////////////////////////

////////////////////////////////
/////////voice//////////////////
////////////////////////////////
var syth = window.speechSynthesis;
function UseVoice(sayWhat) {

    var stringToSay = ""
    switch (sayWhat) {
        case "WIN":
            stringToSay += (GetNames() + " have won the set");
            break;
        case "SCORE":
            stringToSay += CheckSpecialScore();
            if (stringToSay == "") {
                stringToSay += document.getElementById("score").innerHTML.replaceAll("-", "").replaceAll('<img src="pickleJar.png" class="PickleImg">', '0')

                if (AboutToWin()) {
                    stringToSay += " Game Point. "
                }

                stringToSay += ". ";
                stringToSay += document.getElementById("server").innerHTML;
                if (serverNumber == 1) {
                    if (stringToSay.split("2").length - 1 < 2)
                        stringToSay = stringToSay.replace("2", "Start");
                    else
                        stringToSay = stringToSay.replace("2", "two ").replace("2", "Start");

                }
            }


            break;
        case "SIDEOUT":
            stringToSay += "SIDE OUT!";
            break
        case "OUTOFJAR":
            stringToSay += GetNames() + " are out of the jar!. . . Its all Gravy from here."
            break;
        default:
            break;
    }
    var whatToSay = new SpeechSynthesisUtterance(stringToSay);
    syth.speak(whatToSay);
}
function CheckSpecialScore() {
    var returnStr = "";
    var scoreNumbers = document.getElementById("score").innerHTML.replaceAll("-", "").replaceAll('<img src="pickleJar.png" class="PickleImg">', '0').replaceAll("  ", " ");
    var scoreNumbersArry = scoreNumbers.split(" ");
    var score1 = parseInt(scoreNumbersArry[0]);
    var score2 = parseInt(scoreNumbersArry[1]);
    var modServerNumber = (serverNumber % 4);
    var scoreServerNumber = (modServerNumber % 2) + 1;

    if (scoreNumbers === "1 1 1")
        returnStr += "Ones..."

    else if (scoreNumbers === "1 1 2")
        returnStr += "Ones on a 2..."

    else if (scoreNumbers === "1 0 1")
        returnStr += "1 0 1 Class is in session"

    else if (scoreNumbers === "2 2 2")
        returnStr += "Twos..."

    else if (scoreNumbers === "3 2 1")
        returnStr += "3 2 1 BLAST OFF!"

    else if (scoreNumbers === "2 2 1")
        returnStr += "twos on a 1..."

    else if (score1 > 2 && score1 == score2 && score1 <= 11 && score2 <= 11)
        returnStr += numberToStringDic[scoreNumbersArry[0]] + " on a " + scoreServerNumber.toString();

    else if (scoreNumbers === "4 1 1")
        returnStr += "What is the 4 1 1... its"

    else if (scoreNumbers === "9 1 1")
        returnStr += "9 1 1 what is your emergency... the emergency is "

    else if (score1 == 10 && score2 == 4)
        returnStr += "10 4 over and out on a" + scoreServerNumber.toString();

    else if (score1 == 9 && score2 == 5)
        returnStr += "Working 9 to 5 on a" + scoreServerNumber.toString();

    if (returnStr != "") {
        if (AboutToWin()) {
            returnStr += " Game Point. "
        }
        returnStr += document.getElementById("server").innerHTML;
    }
    return returnStr;
}

function AboutToWin() {
    var scoreNumbers = document.getElementById("score").innerHTML.replaceAll("-", "").replaceAll('<img src="pickleJar.png" class="PickleImg">', '0').replaceAll("  ", " ").split(" ");
    var playingTill = parseInt(document.getElementById("playTill").value);
    var winBy2 = document.getElementById("winBy2").checked;
    var score1 = parseInt(scoreNumbers[0]);
    var score2 = parseInt(scoreNumbers[1])
    if (score1 + 1 == playingTill) {
        if (!winBy2 || score1 - score2 >= 2)
            return true;
    }

    return false;
}
function GetNames() {
    var names = "";
    var modServerNumber = serverNumber % 4
    if (modServerNumber < 2) {
        names += namesDict["N1"] + " and " + namesDict["N2"];
    }
    else {
        names += namesDict["S1"] + " and " + namesDict["S2"];
    }
    return names;
}
////////////////////////////////
////////////////////////////////
////////////////////////////////
function isEven(num) {
    return (num & 1) === 0;
}

function SetSessionStorage(what, value) {
    window.sessionStorage.setItem(what, value);
}