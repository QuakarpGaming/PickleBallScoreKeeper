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
var useV2 = false;
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
    var checkV2 = document.getElementById("useV2Code");
    if (checkV2 != null && checkV2 != undefined && checkV2.checked == true) {
        useV2 = checkV2.checked;
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
        if (useV2 != null && useV2 != undefined && useV2 == true) {
            KeyPressV2(e);
            return;
        }
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
   
    if (useV2 != null && useV2 != undefined && useV2 == true) {
        SetScoreHTMLV2();
        return;
    }
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
    var winnerStr = "";
    if (useV2) {
        if (currentServingSide == "N") {
            winnerStr = northServers[0] + " and " + northServers[1];
        }
        else {
            winnerStr = southServers[0] + " and " + southServers[1];
        }
    }
    else {
        winnerStr = GetNames();
    }
    winnerStr += " Have won the set."
    document.getElementById("WinnerText").innerHTML = winnerStr;

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
            if (useV2) {
                if (currentServingSide == "N") {
                    stringToSay += northServers[0] + " and " + northServers[1] + " have won the set";
                }
                else {
                    stringToSay += southServers[0] + " and " + southServers[1] + " have won the set";
                }
            }
            else {
                stringToSay += (GetNames() + " have won the set");
            }
            break;
        case "SCORE":
            if (useV2) {
                stringToSay += CheckSpecialScore();
            }
            else {
                stringToSay += CheckSpecialScore();
                if (serverNumber == 1) {
                    if (stringToSay.split("2").length - 1 < 2)
                        stringToSay = stringToSay.replace("2", "Start");
                    else
                        stringToSay = stringToSay.replace("2", "two ").replace("2", "Start");

                }
                if (stringToSay == "") {

                  

                    stringToSay += ". ";
                    stringToSay += document.getElementById("server").innerHTML;
                    
                }
            }

            break;
        case "SIDEOUT":
            stringToSay += "SIDE OUT!";
            break
        case "OUTOFJAR":
            if (useV2) {
                if (currentServingSide == "N") {
                    stringToSay += northServers[0] + " and " + northServers[1];
                }
                else {
                    stringToSay += southServers[0] + " and " + southServers[1];
                }
                stringToSay += " are out of the jar!. . . Its all Gravy from here."
            }
            else {
                stringToSay += GetNames() + " are out of the jar!. . . Its all Gravy from here."
            }

            break;
        default:
            break;
    }
    var whatToSay = new SpeechSynthesisUtterance(stringToSay);
    syth.speak(whatToSay);
}
function CheckSpecialScore() {
    if (useV2) {
        if (currentServingSide == "N") {
            return processSpecialScoreStr(nScore + " " + sScore + " " + currentServerNumber, nScore, sScore,currentServerNumber) + document.getElementById("server").innerHTML;
        }
        else {
            return processSpecialScoreStr(sScore + " " + nScore + " " + currentServerNumber, sScore, nScore,currentServerNumber) + document.getElementById("server").innerHTML;
        }
    }
    else {
    var scoreNumbers = document.getElementById("score").innerHTML.replaceAll("-", "").replaceAll('<img src="pickleJar.png" class="PickleImg">', '0').replaceAll("  ", " ");
    var scoreNumbersArry = scoreNumbers.split(" ");
    var score1 = parseInt(scoreNumbersArry[0]);
    var score2 = parseInt(scoreNumbersArry[1]);
    var modServerNumber = (serverNumber % 4);
    var scoreServerNumber = (modServerNumber % 2) + 1;

        return processSpecialScoreStr(scoreNumbers, score1, score2, scoreServerNumber) + document.getElementById("server").innerHTML;
    }
}
function processSpecialScoreStr(scoreNumbers, score1, score2, scoreServerNumber) {
    var returnStr = "";

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
        returnStr += numberToStringDic[score1] + " on a " + scoreServerNumber.toString();

    else if (scoreNumbers === "4 1 1")
        returnStr += "What is the 4 1 1... its"

    else if (scoreNumbers === "9 1 1")
        returnStr += "9 1 1 what is your emergency... the emergency is "

    else if (score1 == 10 && score2 == 4)
        returnStr += "10 4 over and out on a" + scoreServerNumber.toString();

    else if (score1 == 9 && score2 == 5)
        returnStr += "Working 9 to 5 on a" + scoreServerNumber.toString();

    if (returnStr != "") {
        if (AboutToWin() || AbouttowinV2()) {
            returnStr += " Game Point. "
        }
    }
    else {
        returnStr = scoreNumbers + " ";
    }


    if (!useV2 && serverNumber == 1)
    {
        if (returnStr.split("2").length - 1 < 2)
            returnStr = returnStr.replace("2", "Start");
        else
            returnStr = returnStr.replace("2", "two ").replace("2", "Start");
    }
    else if (useV2 == true && onStart == true)
    {
        if (returnStr.split("1").length - 1 < 2)
            returnStr = returnStr.replace("1", "Start");
        else
            returnStr = returnStr.replace("1", "one ").replace("1", "Start");
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


///////////////////////////////////////
//v2 code
///////////////////////////////////////

var northServers = ["", ""];
var southServers = ["", ""];
var currentServingSide = "N";
var currentServerNumber = 1;
var lastSideOutNScore = 0;
var lastSideOutSScore = 0;
var onStart = true;
var serverNameSet = false;
var scoreHistory = new Array();
var setTeamNames = false;
function SetScoreHTMLV2() {
    //set up the server text box at the bottom of the screen
    var ServerName = GetServerNameV2();
    document.getElementById("server").innerHTML = `${ServerName} To Serve`


    //set up the text boxes for the server names

    var SL = document.getElementById("southLeftSide").value = southServers[isEven(sScore) ? 1 : 0] + " " + (southServers[isEven(sScore) ? 1 : 0] == ServerName ? "<--" : "");
    var SR = document.getElementById("southRightSide").value = southServers[isEven(sScore) ? 0 : 1] + " " + (southServers[isEven(sScore) ? 0 : 1] == ServerName ? "<--" : "");

    var NL = document.getElementById("northLeftSide").value = northServers[isEven(nScore) ? 1 : 0] + " " + (northServers[isEven(nScore) ? 1 : 0] == ServerName ? "<--" : "");
    var NR = document.getElementById("northRightSide").value = northServers[isEven(nScore) ? 0 : 1] + " " + (northServers[isEven(nScore) ? 0 : 1] == ServerName ? "<--" : "");
    
    //set up team names
    if(setTeamNames)
    {
        document.getElementById("southTeamName").innerHTML = `${southServers[0]} & ${southServers[1]}:`;
        document.getElementById("northTeamName").innerHTML = `${northServers[0]} & ${northServers[1]}:`;
    }
}
function GetServerNameV2() {
    var serverNumberSlotToShow = 0;
    if (currentServingSide == "N" && isEven(lastSideOutNScore) && currentServerNumber == 2) {
        serverNumberSlotToShow = 1;
    }
    else if (currentServingSide == "N" && !isEven(lastSideOutNScore) && currentServerNumber == 1) {
        serverNumberSlotToShow = 1;
    }
    else if (currentServingSide == "S" && isEven(lastSideOutSScore) && currentServerNumber == 2) {
        serverNumberSlotToShow = 1;
    }
    else if (currentServingSide == "S" && !isEven(lastSideOutSScore) && currentServerNumber == 1) {
        serverNumberSlotToShow = 1;
    }

    var ServerName = "";
    if (onStart) {
        ServerName = northServers[0];
    }
    else if (currentServingSide == "N") {
        ServerName = northServers[serverNumberSlotToShow];
    }
    else if (currentServingSide == "S") {
        ServerName = southServers[serverNumberSlotToShow];
    }

    return ServerName;
}
function UpdateServerV2(place, name) {
    if (place.startsWith("N")) {
        northServers[parseInt(place.slice(1)) - 1] = name;
    } else if (place.startsWith("S")) {
        southServers[parseInt(place.slice(1)) - 1] = name;
    }
}
function KeyPressV2(e) {
    //the check if we can take the input is done in the parent function , so we don't need to check it here
    if (e.code === "Space") {
        UseVoice("SCORE");
    }
    else if (e.code === "ArrowUp") {
        UpScoreV2();
    }
    else if (e.code === "ArrowDown") {
        DownScoreV2();
    }
    else if (e.code === "ArrowRight") {
        NextServerV2();
    }
    else if (e.code === "ArrowLeft") {
        LastServerV2();
    }
    else if (e.code === "KeyW") {
        UpOtherScoreV2();
    }
    else if (e.code === "KeyS") {
        DownOtherScoreV2();
    }
}
function AbouttowinV2() {
    var returnVal = false;  
    if (useV2) {
        var playingTill = parseInt(document.getElementById("playTill").value);
        var winBy2 = document.getElementById("winBy2").checked;
        if (currentServingSide == "N") {
            if(nScore + 1 >= playingTill && ( !winBy2 || nScore - sScore >= 2 )) {
                returnVal = true;
            }
        }
        else {
            if (sScore + 1 >= playingTill && (!winBy2 || sScore - nScore >= 2)) {
                returnVal = true;
            }
        }
    }
    return returnVal;
}
function UpScoreV2() {
    if (currentServingSide == "N") {
        nScore++;
        document.getElementById("northScore").value = nScore;
    }
    else {
        sScore++;
        document.getElementById("southScore").value = sScore;
    }
    if (CheckWinnerV2()) {
        OpenWinnerPopup()
    }
    else if (PlayOutOfJarV2()) {
        UseVoice("OUTOFJAR")
    }

    SetScoreHTMLV2();
}
function CheckWinnerV2() {
    var returnVal = false;
    var playingTill = parseInt(document.getElementById("playTill").value);
    var winBy2 = document.getElementById("winBy2").checked;

    if (currentServingSide == "N") {
        if (nScore >= playingTill && (!winBy2 || nScore - sScore >= 2)) {
            returnVal = true;
        }
    }
    else {
         if (sScore >= playingTill && (!winBy2 || sScore - nScore >= 2)) {
            returnVal = true;
        }
    }
    return returnVal;
}

function PlayOutOfJarV2() {
    var returnVal = false;
    if (currentServingSide == "N" && nScore == 1) {
        returnVal = true;
    }
    else  if (currentServingSide == "S" && sScore == 1) {
            returnVal = true;
        }
    return returnVal;
}
function DownScoreV2() {
    if (currentServingSide == "N") {
        nScore--;
        if (nScore < 0) nScore = 0;
        document.getElementById("northScore").value = nScore;
    }
    else {
        sScore--;
        if (sScore < 0) sScore = 0;
        document.getElementById("southScore").value = sScore;
    }

    //no need to check for winner or out of jar here since we are going down in score

    //update the score display
    SetScoreHTMLV2();
}
function UpOtherScoreV2() {
    if (currentServingSide == "N") {
        sScore++;
        document.getElementById("southScore").value = sScore;
    }
    else {
        nScore++;
        document.getElementById("northScore").value = nScore;
    }
    SetScoreHTMLV2();
}

function DownOtherScoreV2() {
    if (currentServingSide == "N") {
        sScore--;
        if (sScore < 0) sScore = 0;
        document.getElementById("southScore").value = sScore;
    }
    else {
        nScore--;
        if (nScore < 0) nScore = 0;
        document.getElementById("northScore").value = nScore;
    }
    //update the score display
    SetScoreHTMLV2();
}
function NextServerV2() {
    AddHistoryRow();
    currentServerNumber++;
    if (currentServerNumber > 2 || onStart) {
        currentServerNumber = 1;
        onStart = false;
        if (currentServingSide == "N") {
            lastSideOutNScore = nScore;
        }
        else {
            lastSideOutSScore = sScore;
        }
        currentServingSide = currentServingSide == "N" ? "S" : "N";
        UseVoice("SIDEOUT");

    }
    SetScoreHTMLV2();
}
function AddHistoryRow() {
    var scoreToSave = "";
    var scoreArray = CheckSpecialScore().match(/\d/g)?.slice(0, 3);
    for (var i = 0; i < scoreArray.length; i++) {
        scoreToSave += ((i === scoreArray.length && onStart) ? "Start" : scoreArray[i]) + (i !== scoreArray.length - 1 ? "-" : "");
    }
    scoreHistory.push(`"Server": "${GetServerNameV2()}", "Score": "${scoreToSave}${scoreArray.length === 2 ? "-Start" : ""}", "lastSideOutScore": ${currentServingSide === "N" ? lastSideOutNScore : lastSideOutSScore}`);
}
function LastServerV2() {
    if (!onStart) {
        currentServerNumber--;
        if (currentServerNumber < 1) {
            currentServerNumber = 2;
            var lastServerData = JSON.parse("{" + scoreHistory.pop() + "}");
            currentServingSide = currentServingSide == "N" ? "S" : "N";
            if (currentServingSide == "N") {
                lastSideOutNScore = lastServerData.lastSideOutScore;
            }
            else {
                lastSideOutSScore = lastServerData.lastSideOutScore;
            }

            if (lastServerData.Score.includes("Start")) {
                onStart = true;
                currentServerNumber = 1;
            }
        }
        SetScoreHTMLV2();
    }
}

function checkDupServerNames() {
    var allNames = northServers.concat(southServers).reverse();
    var foundNames = {};

    for (var i = 0; i < allNames.length; i++) {
        if (foundNames[allNames[i]]) {
            foundNames[allNames[i]]++;
        } else {
            foundNames[allNames[i]] = 1;
        }
    }
    

    Object.keys(foundNames).forEach(function (key) {
        let o = 1;
        let stoppingPoint = foundNames[key];
        if (stoppingPoint  > 1) {
            while (o <= stoppingPoint) {
                var index = allNames.lastIndexOf(key);
                switch (index) {
                    case 3:
                        northServers[0] = northServers[0] + ` (${o})`;
                        break;
                    case 2:
                        northServers[1] = northServers[1] + ` (${o})`;
                        break;
                    case 1:
                        southServers[0] = southServers[0] + ` (${o})`;
                        break;
                    case 0:
                        southServers[1] = southServers[1] + ` (${o})`;
                        break
                    default:
                        break;
                }
                o++;
                delete allNames[index];
            }
        }
    })
    
}

function GetHistory() {
    var container = document.getElementById("setHistory");
    var contentStr = "<ul class='popupText'>";
    scoreHistory.forEach((row) => {
        rowJSON = JSON.parse("{" + row + "}");
        contentStr += `<li>Server: ${rowJSON.Server}, Score: ${rowJSON.Score}</li>`;
    })
    contentStr += "</ul>";

    container.innerHTML = contentStr;
}

