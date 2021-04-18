let dragN = document.getElementsByClassName(`game`);

function preventCopy(event) {
    event.preventDefault();
}

for (let i of dragN) {
    i.ondragstart = () => false;
    beginStyles.cache = new Map();

    function beginStyles(styles, elem) {
        if (!styles) return;
        if (styles.includes(`(change)`)) {
            elem.style.cssText = styles.split(`(change)`).join(``);
        } else {
            let cacheIn = beginStyles.cache.get(styles);
            let workObj;
            if (cacheIn) {
                workObj = cacheIn;
                console.log(`we had it`);
            } else {
                workObj = styles.split(`;`).map(item => [item.split(`:`)[0].split(` `).join(``), item.split(`:`)[1]]);
                workObj.pop();
                beginStyles.cache.set(styles, workObj);
            }
            for (let [i, j] of workObj) {
                elem.style[i] = j;
            }
        }
    }

    function doBegin(text, target, holder) {
        new Function(`dragElem`, `target`, text)(target, holder);
    }

    i.addEventListener(`mousedown`, function (event) {
        let target = event.target.closest(`[data-dnd]`);
        if (!target || target.allMovePrevented || target.onCanceling) return;
        if (!target.dataset.dndCopy || Boolean(target.dataset.dndCopy)) {
            document.addEventListener(`mousedown`, preventCopy);
            document.addEventListener(`dblclick`, preventCopy);
        }
        let isEverMoved = false;
        let holder = document.getElementById(target.parentElement.dataset.holder);
        target.beginStyles = target.style.cssText;
        target.calcStyles = getComputedStyle(target);
        target.beginStyleObj = Object.assign({}, target.style);
        let move = function (elem, event) {
            elem.style.left = event.pageX - xDifference + `px`;
            elem.style.top = event.pageY - yDifference + `px`;
        }.bind(null, target);
        let mouseCordsStart;
        beginStyles(target.dataset.dndStylebegin, target);
        beginStyles(holder.dataset.dndStylebegin, holder);
        doBegin(target.dataset.dndDobegin, target, holder);
        doBegin(holder.dataset.dndDobegin, target, holder);
        let yDifference = event.pageY - target.getBoundingClientRect().y - pageYOffset;
        let xDifference = event.pageX - target.getBoundingClientRect().x - pageXOffset;
        let a = (target.getBoundingClientRect().y + pageYOffset);
        let cordsStart = [target.getBoundingClientRect().x, a];
        let width = target.getBoundingClientRect().width;
        let height = target.getBoundingClientRect().height;

        function setPosition(event) {
            if (target.allMovePrevented) return;
            isEverMoved = true;
            if (Boolean(target.dataset.dndClone) || target.dataset.dndClone === undefined) {
                console.log(target.dataset.dndClone);
                console.log(Boolean(target.dataset.dndClone));
                target.clone = target.cloneNode(true);
                target.clone.style.visibility = `hidden`;
                target.clone.style.zIndex = `-1`;
                Object.defineProperty(target, `clone`, {writable: false});
                target.clone.removeAttribute(`data-dnd`);
                target.parentElement.append(target.clone);
                beginStyles(target.dataset.dndClonebegin, target.clone);
                target.addEventListener(`clone`, function (event) {
                    target.clone.replaceWith(target);
                }, {once: true});
            }
            mouseCordsStart = [event.pageX, event.pageY];
            target.style.margin = `0px`;
            target.style.position = `absolute`;
            target.style.boxSizing = `border-box`;
            target.style.width = String(width) + `px`;
            target.style.height = String(height) + `px`;
        }

        document.addEventListener(`mousemove`, setPosition, {once: true});
        document.addEventListener(`mousemove`, move);
        let tracker = {
            "-1": (a) => !a,
            "1": (a) => a
        }
        let colors = {
            "1": `0 0 14px 7px #20264d`,
            "-1": `0 0 10px 5px #32468c`
        }
        let i = 1;

        function insideCheck() {
            try {
                let cords = [(target.getBoundingClientRect().left + target.getBoundingClientRect().right) / 2, (target.getBoundingClientRect().top + target.getBoundingClientRect().bottom) / 2];
                target.style.display = `none`;
                if (tracker[i](document.elementFromPoint(...cords).closest(`#${holder.id}`))) {
                    holder.style.boxShadow = colors[i];
                    abilityToChange = !Boolean(i - 1);
                    console.log(abilityToChange);
                    i = -i;
                }
                target.style.display = target.beginStyleObj.display;
            } catch (e) {
            }
        }

        let abilityToChange = false;
        document.addEventListener(`mousemove`, insideCheck);
        document.addEventListener(`mouseup`, function (event) {
            target.allMovePrevented = true;
            target.onCanceling = true;

            function back() {
                target.style.cssText = target.beginStyles;
                holder.style.boxShadow = `none`;
                target.onCanceling = false;
                setTimeout(() => target.allMovePrevented = false, 200);
            }

            function backClone() {
                target.dispatchEvent(new CustomEvent(`clone`));
                back();
                document.removeEventListener(`mousemove`, preventCopy);
                document.removeEventListener(`dblclick`, preventCopy);
            }

            let time = 0;
            console.log(`inside`);
            document.removeEventListener(`mousemove`, move);
            document.removeEventListener(`mousemove`, insideCheck);
            document.removeEventListener(`mousemove`, setPosition, {once: true});
            console.log(`moved`, isEverMoved);
            if (!isEverMoved) {
                back();
                return;
            }
            if (abilityToChange) {
                time = 1000;
                target.querySelector(`[data-changeTarget]`).style.color = `#3b58ad`;
                let changeTarget = holder.querySelector(`[data-changeTarget]`);
                changeTarget.style.color = `#32468c`;
                setTimeout(function () {
                    let a = target.dataset.dndValue;
                    target.dataset.dndValue = holder.dataset.holding;
                    refactorInnerData(target);
                    holder.dataset.holding = a;
                    changeTarget.innerHTML = holder.dataset.holding;
                    target.querySelector(`[data-changeTarget]`).style.color = `#dbdae3`;
                    changeTarget.style.color = `#dbdae3`;
                    refactorInnerCode(holder.closest(`.code`));
                }, 400);
                target.style.transform = `none`;
                holder.style.boxShadow = `0 0 14px 7px #3c7d41`;
            }
            setTimeout(function () {
                target.style.transform = `none`;
                target.style.transitionProperty = `left, top, background-color, transform`;
                target.style.transitionDuration = `0.6s`;
                target.style.left = cordsStart[0] + `px`;
                target.style.top = cordsStart[1] + `px`;
                console.log(target.onCanceling);
                setTimeout(backClone, 600);
            }, time);
        }, {once: true});
    });
}

const codeBlocksText = {
    1: `<p style="">Абзац текста</p>`,
    2: `<p style="background-color: purple;">Это абзац</p>\n<p>Hello!</p>\n<div>Новый контейнер</div>`
}

let codeBlocks = document.querySelectorAll(".code-section");
for (let i of codeBlocks) {
    let lines = codeBlocksText[i.getAttribute("codeindex")].split("\n");
    for (let line of lines) {
        let newLine = document.createElement("div");
        newLine.classList.add("code-line");
        newLine.innerHTML = `<div class="code-block"><pre><code class="code-string"></code></pre></div>`;
        newLine.querySelector("code").innerHTML = hljs.highlightAuto(line).value;
        i.querySelector(".code-block-wrapper").appendChild(newLine);
    }
    i.querySelector(`.screen`).innerHTML = codeBlocksText[i.getAttribute("codeindex")];
}


/*
data-dnd - делвет элемент восприимчивым к атрибутам из dnd
data-dnd-value - способ хранения информации, которая должна юцдет быть использована для dnd
data-dnd-copy - будет ли копироваться текст во время переноса, имеется ввиду текст, по умолчанию false
data-dnd-styleBegin - необходтмо указать стили, которые юудут применены в момент как пользователь захватит мышью элемент, мы указываем
их в css формате, можно указать, нужно ли заменить все свойства на данные либо просто добавить - нужно написать (change) в начале или в конце, а затем указывать свойства, по умолчанию св-ва добавляются
мы можем добавить этот атрибут как и в целевой элемент так и элемент который захватывает пльзователь
data-dnd-doBegin - тут можно написать любой js код, который бцдет выполнен в момент как пользователь захватит мышью элемент,
можно использовать это для пременения классов атриюутов и др. Так же внутри функции dragElem - элемент который захватит позьзователь, а target - цнлнвой эд-т
причем можно написать это и в цель переноса и в сам dragElem
data-dnd-clone - свойство, которое позволяет нам ставить клон элемента который пользователь уберает,жто может быть нужно для того чтотбы
например не дергать flex элементы или по другим целям, true( по умолчанию ), значит ставить, false-не ставить.
data-dnd-cloneBegin - туда мы можем указать свойства которые передадим клону, аналогично с data-dnd-styleBegin
data-dnd-targetHoverStyleT - сюда мы можем записать стили которые
data-dnd-backBeginStyle - вернет самые начальные стили элемента, то есть те которые были до взаимодействия с пользователем
*/