let dragN = document.getElementsByClassName(`game`);
function preventCopy(event){
    event.preventDefault();
}
let DND = {
    end(element){
        document.removeEventListener(`mousedown`,element._info.preventCopy);
        document.removeEventListener(`dblclick`,element._info.preventCopy);
        if (element.dataset.dndDeletecloneend === undefined || element.dataset.dndDeletecloneend){
            element.dispatchEvent(new CustomEvent(`clone`));
        }
        element.onCanceling = false;
        setTimeout(()=>element.allMovePrevented = false, 50);
        element.info = undefined;
        element._info = undefined;
    }
}
for (let i of dragN){
    i.ondragstart = ()=>false;
    i.style.touchAction = `none`;
    let hoverBehavior = {
        mouse(event, elem){
            return [[event.clientX, event.clientY]];
        },
        center(event, elem){

            return [[(elem.getBoundingClientRect().left + elem.getBoundingClientRect().right)/2, (elem.getBoundingClientRect().top + elem.getBoundingClientRect().bottom)/2]];
        },
        // corners(event, elem){
        //     return [[elem.getBoundingClientRect().top, elem.getBoundingClientRect().left], [elem.getBoundingClientRect().top, elem.getBoundingClientRect().right], [elem.getBoundingClientRect().bottom, elem.getBoundingClientRect().right], [elem.getBoundingClientRect().bottom, elem.getBoundingClientRect().left]];
        // },
        // inside(event, elem){
        //     return this.corners(event, elem);
        // },
        "undefined": function (event, elem){
            if (elem.parentElement.dataset.dndHoverbehavior) return this[elem.parentElement.dataset.dndHoverbehavior](event, elem);
            else return this.center(event, elem);
        }
    }
    beginStyles.cache = new Map();
    function beginStyles(styles, elem, type){
        if (!styles && styles !== undefined) return;
        if (styles === undefined) {if (type === null) return;beginStyles(elem.parentElement.dataset[type], elem, null); return;}
        if (styles.includes(`(change)`)){
            elem.style.cssText = styles.split(`(change)`).join(``);
        }
        else{
            let cacheIn = beginStyles.cache.get(styles);
            let workObj;
            if (cacheIn){
                workObj = cacheIn;
            }
            else{
                workObj = styles.split(`;`).map(item=>[item.split(`:`)[0].split(` `).join(``), item.split(`:`)[1]]);
                workObj.pop();
                beginStyles.cache.set(styles, workObj);
            }
            for (let [i,j] of workObj){
                elem.style[i] = j;
            }
        }
    }
    doBegin.cache = new Map();
    function doBegin(text, target, holder, type, owner){
        if (text === undefined&& type!== null){
            doBegin(owner.parentElement.dataset[type], target, holder, null, null);
            return;
        }
        let cacheIn = doBegin.cache.get(text);
        if (cacheIn) cacheIn(target, holder);
        else{
            let F = new Function(`dragElem`, `target`, text);
            doBegin.cache.set(text, F);
            F(target, holder);
        }
    }

    i.addEventListener(`pointerdown`, function (event){
        let target = event.target.closest(`[data-dnd]`);
        if (!target || target.allMovePrevented || target.onCanceling || !event.isPrimary) return;
        target.setPointerCapture(event.pointerId);
        document.documentElement.classList.add(`unselectable`);
        target._info = {
            get clone(){
                return target._system.clone;
            },
            letCopy(){
                document.addEventListener(`mousedown`,target._info.preventCopy);
                document.addEventListener(`dblclick`,target._info.preventCopy);
            }
        };
        target.info = {};
        if (target._system === undefined) target._system = {};
        target._info.preventCopy = preventCopy.bind(null);
        if (!target.dataset.dndCopy || Boolean(target.dataset.dndCopy)){
            document.addEventListener(`mousedown`,target._info.preventCopy);
            document.addEventListener(`dblclick`,target._info.preventCopy);
        }
        let isEverMoved = false;
        let holder = document.getElementById(target.parentElement.dataset.holder);
        holder._info = {};
        holder.info = {};
        target._info.beginStyles = target.style.cssText;
        target._info.calcBeginStyles = getComputedStyle(target);
        target._info.beginStyleObj = Object.assign({}, target.style);
        holder._info.beginStyles = holder.style.cssText;
        holder._info.calcBeginStyles = getComputedStyle(holder);
        holder._info.beginStyleObj = Object.assign({}, holder.style);
        let move = function (elem, event){
            if (!event.isPrimary) return;
            elem.style.left = event.clientX - xDifference - elem.offsetParent.getBoundingClientRect().x+ `px`;
            elem.style.top = event.clientY - yDifference-elem.offsetParent.getBoundingClientRect().y+`px`;
            target._info.moveStyles = target.style.cssText;
            target._info.calcMoveStyles = getComputedStyle(target);
            target._info.moveStyleObj = Object.assign({}, target.style);
            colorsTarget = {
                "1": target.dataset.dndHoverstyle,
                "-1": `(change) `+target._info.moveStyles
            }
            doBegin(target.dataset.dndOnmove, target, holder, `dndOnmove`, target);
            doBegin(holder.dataset.dndOnmove, target, holder, `dndOnmove`, holder);
        }.bind(null, target);
        let mouseCordsStart;
        beginStyles(target.dataset.dndStylebegin, target, `dndStylebegin`);
        beginStyles(holder.dataset.dndStylebegin, holder, `dndStylebegin`);
        doBegin(target.dataset.dndDobegin,target, target, `dndDobegin`, target);
        doBegin(holder.dataset.dndDobegin,target, holder, `dndDobegin`, holder);
        let yDifference = event.pageY - target.getBoundingClientRect().y - pageYOffset;
        let xDifference = event.pageX - target.getBoundingClientRect().x - pageXOffset;
        let a= (target.getBoundingClientRect().y - target.offset);
        target._info.cordsStart = [target.offsetLeft, target.offsetTop];
        let width = target.getBoundingClientRect().width;
        let height = target.getBoundingClientRect().height;
        function setPosition(event){
            if (target.allMovePrevented) return;
            isEverMoved = true;
            if (Boolean(target.dataset.dndClone) || target.dataset.dndClone === undefined || !target._system.clone){
                target._system.clone = target.cloneNode(true);
                target._system.clone.style.visibility = `hidden`;
                target._system.clone.style.zIndex=`-1`;
                Object.defineProperty(target, `clone`, {writable: false});
                target._system.clone.removeAttribute(`data-dnd`);
                target.parentElement.append(target._system.clone);
                beginStyles(target.dataset.dndClonebegin, target._system.clone, null);
                target.addEventListener(`clone`, function (event){
                    target._system.clone.replaceWith(target);
                }, {once: true});
            }
            mouseCordsStart = [event.pageX, event.pageY];
            target.style.margin = `0px`;
            target.style.position = `absolute`;
            target.style.boxSizing = `border-box`;
            target.style.width = String(width) + `px`;
            target.style.height = String(height) + `px`;
            target.style.zIndex = 10000;
            holder._info.moveStyles = holder.style.cssText;
            holder._info.calcMoveStyles = getComputedStyle(holder);
            holder._info.moveStyleObj = Object.assign({}, holder.style);
            colorsHolder = {
                "1": holder.dataset.dndHoverstyle,
                "-1": `(change) `+holder._info.moveStyles
            }
            colorsTarget = {
                "1": target.dataset.dndHoverstyle,
                "-1": `(change) `+target._info.moveStyles
            }
        }
        document.addEventListener(`pointermove`,setPosition , {once: true});
        document.addEventListener(`pointermove`, move);
        let tracker,colorsHolder,colorsTarget;
        tracker = {
            "-1": (a)=>!a,
            "1": (a)=>a
        }
        let i = 1;
        function insideCheck(event){
            if (!event.isPrimary) return;
            try{
                let cords = hoverBehavior[String(target.dataset.dndHoverbehavior)](event, target);
                target.style.display = `none`;
                let a = 0;
                for (let n of cords){
                    // Эта секция не рабоатет..................
                    // if (target.dataset.dndHoverbehavior === `inside`){
                    //     if (tracker[i](document.elementFromPoint(...n).closest(`#${holder.id}`))){
                    //         a++;
                    //     }
                    //     if (a === 3){
                    //         beginStyles(colorsHolder[i], holder);
                    //         beginStyles(colorsTarget[i], target);
                    //         abilityToChange = !Boolean(i-1);
                    //         i = -i;
                    //     }
                    // }
                    // ..........................................
                     if (tracker[i](document.elementFromPoint(...n).closest(`#${holder.id}`))){
                            beginStyles(colorsTarget[i], target, null);
                            beginStyles(colorsHolder[i], holder, null);
                            doBegin(target.dataset.dndDohover, target, holder, null,null);
                            doBegin(holder.dataset.dndDohover, target, holder, null, null);
                            target.style.display = ``;
                            abilityToChange = !Boolean(i-1);
                            i = -i;
                            break;
                        }

                    target.style.display = ``;
                }
            }
            catch (e){
                target.style.display = ``;
                console.log(target.style.display);
                beginStyles(colorsTarget[i], target, null);
                beginStyles(colorsHolder[i], holder, null);
                doBegin(target.dataset.dndDohover, target, holder, null, null);
                doBegin(holder.dataset.dndDohover, target, holder, null, null);
                document.dispatchEvent(new MouseEvent(`pointerup`));
                console.log(e);
            }
        }
        let abilityToChange = false;
        document.addEventListener(`pointermove`, insideCheck);
        document.addEventListener(`pointerup`, function (event){
            if (!event.isPrimary) return;
            target.allMovePrevented = true;
            target.onCanceling = true;
            doBegin(target.dataset.Doanywaybefore, target, holder, `Doanywaybefore`, target);
            doBegin(holder.dataset.Doanywaybefore, target, holder, `Doanywaybefore`, holder);
            document.removeEventListener(`pointermove`, move);
            document.removeEventListener(`pointermove`, insideCheck);
            document.removeEventListener(`pointermove`, setPosition, {once: true});
            if (!isEverMoved) {
                if (target.dataset.dndStylenomove!==undefined){
                    beginStyles(target.dataset.dndStylenomove, target, `dndStylenomove`);
                }
                else{
                    target.style.cssText = target._info.beginStyles;
                }
                if (holder.dataset.dndStylenomove!==undefined){
                    beginStyles(holder.dataset.dndStylenomove, target, `dndStylenomove`);
                }
                else{
                    holder.style.cssText = holder._info.beginStyles;
                }
                if (target.dataset.dndDonomove!==undefined || holder.dataset.dndDonomove!==undefined){
                    doBegin(target.dataset.dndDonomove, target, holder, `dndDonomove`, target);
                    doBegin(holder.dataset.dndDonomove, target, holder, `dndDonomove`, holder);
                }
                else{
                    doBegin(target.dataset.Doanywaybefore+`/n`+target.dataset.dndDoanywayafter, target,holder, `dndDoanywayafter`, target);
                    doBegin(holder.dataset.Doanywaybefore+`/n`+holder.dataset.dndDoanywayafter, target,holder, `dndDoanywayafter`, holder);
                }
            }
            if (abilityToChange) {
                beginStyles(target.dataset.dndSuccessstyle, target, `dndSuccessstyle`);
                beginStyles(holder.dataset.dndSuccessstyle, holder, `dndSuccessstyle`);
                doBegin(target.dataset.dndDosuccess, target, holder, `dndDosuccess`, target);
                doBegin(holder.dataset.dndDosuccess, target, holder, `dndDosuccess`, holder);
            }
            else{
                beginStyles(target.dataset.dndNotsuccessstyle, target, `dndNotsuccessstyle`);
                beginStyles(holder.dataset.dndNotsuccessstyle, holder, `dndNotsuccessstyle`);
                doBegin(target.dataset.dndDonotsuccess, target, holder, `dndDonotsuccess`, target);
                doBegin(holder.dataset.dndDonotsuccess, target, holder, `dndDonotsuccess`, holder);
            }
            doBegin(target.dataset.dndDoanywayafter, target, holder, `dndDoanywayafter`, target);
            doBegin(holder.dataset.dndDoanywayafter, target, holder, `dndDoanywayafter`, holder);
            document.documentElement.classList.remove(`unselectable`);
        }, {once: true});
    });
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
data-dnd-hoverBehavior - то каким образом будеи опредиляться находится ли в перетаскиваемый эдт внутри цели, есть 4 знаечения
mouse - опредиляется если мышь внутри, center - опредиляется елси центр перетягиваемого элемента внутри, corners - опредиляется если
хотябы один угол внутри, inside - усли полностью внутри.
data-dnd-HoverStyle - сюда мы можем записать стили которые мы даем элементу в момент наведения
data-dnd-doHover - cюда мы можеи передать функцию которая выполнитс в момент наведения, аргументы такиеже как и в
data-dnd-onMove - выполняется когда движется захватываемый элемент
data-dnd-successStyle - стили которые будут применены если элемент был перетащен в цель
data-dnd-DoSuccess - то что быдет сделано во время успешного перетаскивания
data-dnd-notSuccessStyle - стили которые юудут применены в случае если пользователь не дотянет до целевого элемента
data-dnd-doNotSuccess - юудет выполнена в случве не успешного перетаскивания
data-dnd-doAnywayAfter - будет выполнено в люом исходе после success или notSuccess
data-dnd-doAnywayBefore - будкт выполнено в любом случае перед success или notSUCCESS
data-dnd-doNoMove - будет выполнено в случае если элемент будет кликнут но никуда не сдвинут, по умолчанию произойдет before after
data-dnd-StyleNoMove - стили будут применены в случае если кликнут но не потянут, по умолчанию жто полный сброс стилей до тех который были у элемента до того как он его кликнул, причем изменяется
толкто styles, классы и тп остаются прежними
data-dnd-deleteCloneEnd - если true то удалит клона при DND.end(), если false то не удалит, но тогда новый клон не юудет создан при сле
дующем захвате элемента, ведь у элемента может быть тоько один клон, по умолчаниюон удалется
Y жлемента который захватил пользователь есть специальные обьекты которые создаются на всемя drag-n-drop а затем обнуляются.
*/