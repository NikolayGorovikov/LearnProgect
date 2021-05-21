let tests = document.querySelectorAll(`.test .slideTest`);
let test = document.querySelector(`.test`);
let actualTestNum = 1;
let timer = false;
function goLeft(){
    if (actualTestNum === tests.length||timer) return;
    change(actualTestNum, actualTestNum, document.querySelector(`.test div:nth-of-type(2)`), document.querySelector(`.test div:first-of-type`));
    ++actualTestNum;
}
function goRight(){
    if (actualTestNum === 1||timer) return;
    change(actualTestNum, actualTestNum-2, document.querySelector(`.test div:first-of-type`), document.querySelector(`.test div:nth-of-type(2)`));
    --actualTestNum;
}
function change(actualTestNum, move, button, buttonUnpressed){
    timer = true;
    setTimeout(()=>timer=false, 2000);
    test.dispatchEvent(new CustomEvent(`checkLight`, {detail: [move, button, buttonUnpressed]}));
    tests[actualTestNum-1].style.opacity = `0`;
    tests[actualTestNum-1].style.transform = `translateY(-100px)`;
    setTimeout(()=>tests[actualTestNum-1].style.visibility=`hidden`, 1000);
    setTimeout(function (){
        tests[move].style.visibility=`visible`;
        tests[move].style.opacity = `1`;
        tests[move].style.transform = `none`;
    }, 1000)
}
test.addEventListener(`checkLight`, function (event){
    if (event.detail[0] === tests.length-1||event.detail[0] === 0){
        event.detail[1].classList.add(`gray`);
        event.detail[1].classList.remove(`button`);
    }
    else{
        event.detail[1].classList.remove(`gray`);
        event.detail[2].classList.remove(`gray`);
        event.detail[1].classList.add(`button`);
        event.detail[2].classList.add(`button`);
    }

}, {passive: true});
document.querySelector(`.test div:first-of-type`).addEventListener(`click`,goRight);
document.querySelector(`.test div:nth-of-type(2)`).addEventListener(`click`,goLeft);

for (let i = 1; i<tests.length; i++){
    let j = tests[i].style;
    j.opacity = `0`;
    j.transform = `translateY(-100px)`;
    j.visibility=`hidden`;
}
