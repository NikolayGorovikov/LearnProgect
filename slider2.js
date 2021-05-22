"use strict";
let slides = document.querySelectorAll(`.slider > .slider-in > div`);
let slider = document.querySelector(`.slider-in`);
let actualSlide = 1;
let prevSlide = actualSlide;
let visitedSlides = new Set([1]);
let buttons = document.querySelector(`.buttons`);
for (var i = 1; i < slides.length+1; i++){
    buttons.insertAdjacentHTML(`beforeend`, `<div class="innerButton" data-number="${i}"></div>`);
}
document.body.style.overflow = `hidden`;
let a;
let advices = function (detail){
    a = setInterval(()=>{detail.focus.classList.add(`onHover`);setTimeout(()=>detail.focus.classList.remove(`onHover`), 1000)}, 4000);
    detail.focus.addEventListener(`click`, ()=>{clearInterval(a); detail.focus.classList.remove(`onHover`);}, {once: true});
    if (detail.action !== `close`) document.addEventListener(`makeAdvice`, function (event){advices(event.detail)}, {once: true});
}
document.addEventListener(`makeAdvice`, function (event){advices(event.detail)}, {once: true});
document.dispatchEvent(new CustomEvent(`makeAdvice`, {detail: {action: `slide`, focus: document.getElementById(`rb`)}}));
function reload(){
    slider.style.transitionDuration = `0s`;
    Array.from(slides).forEach((item)=>{if (item === slides[actualSlide-1]) return undefined; item.style.display = `none`});
    slider.style.transform = `none`;
    slides[actualSlide-1].style.left = `0`;
    elem.style.animationName = ``;
}
buttons.style.left = `calc((100% - ${buttons.getBoundingClientRect().width}px) / 2)`;
let ability = true;
function slideLeft(){
    if (ability){
        let number = actualSlide + 1;
        if (number === slides.length+1) {number = 1;}
        inside(number);
    }
}
function slideRight(){
    if (ability){
        let number = actualSlide - 1;
        if (number === 0) number = slides.length;
        inside(number);
    }
}
function inside2(a, b, c, j, number, d, minus1, minus2, checkVal, checkChange){
    for (let i = actualSlide+a; i!==number+b;i = i+c, j++){
        if (i === checkVal){
            i = checkChange;
        }
        slides[i+d].style.display = `block`;
        slides[i+d].style.left = `${minus1}${(j+1)*100}%`;
    }
    actualSlide = number;
    if (visitedSlides.size === 1) document.getElementById(`rb`).dispatchEvent(new Event(`click`));
    visitedSlides.add(number);
    if (visitedSlides.size >= slides.length) document.dispatchEvent(new CustomEvent(`makeAdvice`, {detail: {action: `close`, focus: document.getElementById(`closeBar1`)}}));
    slider.style.transform = `translateX(${minus2}${j*100}%)`;
}
function inside(number){
    if (number){
        if (number === actualSlide) return;
        ability = false;
        setTimeout(()=>ability = true, 1000);
        prevSlide = actualSlide;
        slider.style.transitionDuration = `1s`;
        elem.style.animationName = `move`;
        // firstElemButtonLeft + (number-1)*(parseInt(getComputedStyle(buttons.firstElementChild).marginLeft) + parseInt(getComputedStyle(buttons.firstElementChild).borderLeftWidth) + parseInt(getComputedStyle(buttons.firstElementChild).width)/2)*2
        setTimeout(()=>elem.style.left = buttons.querySelector(`:nth-of-type(${number})`).getBoundingClientRect().x - buttons.getBoundingClientRect().x + `px`, 200);
        setTimeout(reload, 1000);
        if (number > actualSlide){
            if (number - actualSlide <= (i-1)/2){
                inside2(0, 0, 1, 0, number, 0, ``, `-`);
                return;
            }
            inside2(-1, -1, -1, 0, number, -1, `-`, ``, 0, slides.length);
            return;
        }
        if (actualSlide - number <= (i-1)/2){
            inside2(0, 0, -1, 0, number, -2, `-`, ``);
            return;
        }
        inside2(1, 1, 1, 0, number, -1, ``, `-`, slides.length+1,1);
    }
}
function buttonSlide(event){
    if (ability){
        inside(Number(event.target.dataset.number));
    }
}
let elem = document.createElement(`div`);

// let firstElemButtonLeft = parseInt(getComputedStyle(buttons.firstElementChild).marginLeft) + parseInt(getComputedStyle(buttons.firstElementChild).borderLeftWidth) - 1;
let firstElemButtonLeft= buttons.firstElementChild.getBoundingClientRect().x - buttons.getBoundingClientRect().x;
elem.style.cssText = `left: ${firstElemButtonLeft}px; top: 0; width: ${buttons.firstElementChild.getBoundingClientRect().width}px; border-radius: ${buttons.firstElementChild.getBoundingClientRect().width}px; transition-property: left; transition-duration: 0.6s; animation-duration: 1s; animation-fill-mode: forwards; position: absolute; z-index: -1;`;
elem.className = `point`;
elem.style.height = elem.style.width;
buttons.append(elem);
document.getElementById(`lb`).addEventListener(`mousedown`, slideRight);
document.getElementById(`rb`).addEventListener(`mousedown`, slideLeft);
buttons.addEventListener(`mousedown`, buttonSlide);
