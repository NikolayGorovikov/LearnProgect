"use strict";
let letterArray = [null, `l`,`o`,`v`,`e`,` `,`y`,`o`,`u`];
let hatec = [null, `a`,`n`,`y`,` `,`t`,`e`,`x`,`t`];
function randomInteger(min, max) {
    let rand = min - 0.5 + Math.random() * (max - min + 1);
    return Math.round(rand);
}
function changeAlpha(length,array,actualDate){
    if (new Date() - actualDate > 5000){
        clearInterval(text.timeouter);
        for (let i = 1; i<= length; i++){
            document.querySelector(`#par span:nth-of-type(${i})`).innerHTML = array[i];
        }
    }
    let randomLetter = randomInteger(1,length);
    if (new Date() - actualDate > 4420 - (length-7)*100){
        document.querySelector(`#par span:nth-of-type(${randomLetter}`).innerHTML = array[randomLetter];
    }
    else{
        document.querySelector(`#par span:nth-of-type(${randomLetter}`).innerHTML = String.fromCodePoint(randomInteger(33,126));
    }
}
function text(...args){
    document.getElementById(`par`).innerHTML = ``;
    for (let i of args[0]){
        document.getElementById(`par`).append(document.createElement(`span`));
    }
    args[1] = (0+args[0]).slice(``);
    args[0] = args[1].length-1;
    args[2] = new Date();
    text.timeouter = setInterval(changeAlpha, 30, ...args);
}