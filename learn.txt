let codeBlocks = document.getElementsByClassName(`code`);
document.querySelector(`.advice`).scrollIntoView(`top`)
function refactorInnerData(i){
    i.querySelector(`[data-changeTarget]`).innerText = i.dataset.dndValue;
}
function refactorInnerCode(i){
    i.querySelector(`.screen`).innerHTML = ``;
    i.querySelector(`.screen`).insertAdjacentHTML(`afterbegin`,i.querySelector(`.codeBlock`).innerText);
}
for (let i of codeBlocks){
    refactorInnerCode(i);
}
function changeInners(dragElem, target){
    target.info.changeTarget = target.querySelector(`[data-changeTarget="${dragElem.querySelector(`[data-changeTarget]`).dataset.changetarget}"]`);
    dragElem.info.time = 1000;
    target.info.changeTarget.style.color = `#32468c`;
    setTimeout(function (){
        let a = dragElem.dataset.dndValue;
        dragElem.dataset.dndValue = target.info.changeTarget.innerText;
        refactorInnerData(dragElem);
        target.dataset.holding = a;
        target.info.changeTarget.innerHTML = target.dataset.holding;
        dragElem.querySelector(`[data-changeTarget]`).style.color = `#dbdae3`;
        target.info.changeTarget.style.color = `#dbdae3`;
        refactorInnerCode(target.closest(`.code`));
    }, 400);
}
function resetPos(dragElem, target){
    setTimeout(function (){
        dragElem.style.transform = `none`;
        dragElem.style.transitionProperty = `left, top, background-color, transform`;
        dragElem.style.transitionDuration = `0.6s`;
        dragElem.style.left = dragElem._info.cordsStart[0]+`px`;
        dragElem.style.top = dragElem._info.cordsStart[1]+`px`;
        setTimeout(function (){dragElem.style.cssText = dragElem._info.beginStyles;
            target.style.boxShadow = `none`; DND.end(dragElem)}, 600);
    }, dragElem.info.time);
}
document.querySelector(`.closeBar`).addEventListener(`click`, function (event){
    new Function(`elem`, this.dataset.closeanimation)(this);
});
let counter = 0;
function success({detail:{elem: elem}}){
    counter++;
    num.style.color = `transparent`;
    setTimeout(()=>{
        num.style.color = ` #293168`;
        num.innerHTML = counter;
        elem.querySelector(`.success`).classList.add(`animate`);
    }, 500);
}
for (let i of document.querySelectorAll(`.test .slideTest`)){
    i.addEventListener(`success`, success, {once: true});
}
let love = {
    get edition(){
        if (confirm(`Ты точно Катя???????`)) alert(`ну ладно...`)
        else return;
        for (let i of document.querySelectorAll(`.inside`)){
            i.innerText = `love you`;
        }
        for (let i of codeBlocks){
            refactorInnerCode(i);
        }
        return `i love you`;
    }
}
document.getElementById(`topLeft`).addEventListener(`mousedown`, function (event){document.getElementById(`topRight`).addEventListener(`click`, ()=>document.getElementById(`bottomRight`).addEventListener(`click`, document.getElementById(`bottomLeft`).addEventListener(`click`, ()=>{text(`i love you, kate`); setTimeout(()=>document.getElementById(`par`).style.color = `transparent`, 8000)}, {once:true}), {once:true}), {once:true})}, {once:true});