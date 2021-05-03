var onCreate = false;
var onHolding = false;
var onAddPoint = false;
var quantity = 0;
var currentCurves = [];
var currentCurve = undefined;
var canvasDiv = document.getElementById("canvas");
var canvas = document.getElementById("quadro");
var canvasContext = quadro.getContext("2d");
var onCreateDialog = document.getElementById("onCreateDialog");
var onPointDialog = document.getElementById("onPointDialog");
var finishButton = document.getElementById("finishCurve");
var cancelButton = document.getElementById("deleteCurve");
var addPoint = document.getElementById("addPoint");
var deletePoint = document.getElementById("deletePoint");
var curveText = document.getElementById("curva");
var sidebar = document.getElementById("sidebar");
var selected = -1;
var pointSize = 10;
var yOffset = 0; //2 + canvasTopOffset;
var xOffset = sidebar.getBoundingClientRect().width;//10;
var xMenuOffset = 0;
var yMenuOffset = 0;
console.log(xOffset);

document.addEventListener("DOMContentLoaded", pageLoaded);

function pageLoaded() {
    updatePageElements();
    hideMenus();
}

deletePoint.addEventListener("click", deletePointFunc);

addPoint.addEventListener("click", addPointFunc);

finishButton.addEventListener("click", () => {
    onCreate = false;
    onCreateDialog.style.display = "none";
    updatePageElements();
});

cancelButton.addEventListener("click", () => {
    onCreate = false;
    onCreateDialog.style.display = "none";
    deletarCurva();
    updatePageElements();
});

function isOnEdge(x, y){
    if(x - pointSize <= 0) return true;
    else if(x + pointSize >= canvas.width) return true;
    else if(y - pointSize <= 0) return true;
    else if(y + pointSize >= canvas.height) return true;
    else return false;
}

function isOverPoint(x, y) {
    if (currentCurves.length == 0) return -1;
    for (
        let index = 0;
        index < currentCurves[currentCurve].points.length;
        index++
    ) {
        const point = currentCurves[currentCurve].points[index];
        for (let i = point.x - pointSize; i < point.x + pointSize; i++) {
            for (let j = point.y - pointSize; j < point.y + pointSize; j++) {
                if (i == x && j == y) return index;
            }
        }
    }
    return -1;
}

function mouseDown(event) {
    let mouseX = event.clientX;
    let mouseY = event.clientY;
    let canvasX = mouseX - xOffset;
    let canvasY = mouseY - yOffset;
    if (selected != -1 && onAddPoint) {
        let newPoint = new Point(canvasContext, canvasX, canvasY, pointSize);
        pointIndex = currentCurves[currentCurve].points.splice(
            selected + 1,
            0,
            newPoint
        );
        desenhar();
        onAddPoint = false;
    }
    selected = isOverPoint(canvasX, canvasY);
    if (onCreate) {
        let newPoint = new Point(canvasContext, canvasX, canvasY, pointSize);
        pointIndex = currentCurves[currentCurve].addControlPoint(newPoint);
        desenhar();
        showCreationMenu(canvasX, canvasY, mouseX, mouseY);
    } else if (selected != -1) {
        showPointMenu(canvasX, canvasY, mouseX, mouseY);
    } else {
        hideMenus();
    }
    updatePageElements();
    onHolding = true;
}

function mouseUp(event) {
    onHolding = false;
}

function mouseMove(event) {
    let mouseX = event.clientX;
    let mouseY = event.clientY;
    let canvasX = mouseX - xOffset;
    let canvasY = mouseY - yOffset;
    let onEdge = isOnEdge(canvasX, canvasY);
    if (onHolding && onCreate) {
        currentCurves[currentCurve].points.pop();
        let newPoint = new Point(canvasContext, canvasX, canvasY, pointSize);
        pointIndex = currentCurves[currentCurve].addControlPoint(newPoint);
        desenhar();
        showCreationMenu(canvasX, canvasY, mouseX, mouseY);
    } else if (onHolding && selected != -1 && !onEdge) {
        currentCurves[currentCurve].points[selected].x = canvasX;
        currentCurves[currentCurve].points[selected].y = canvasY;
        desenhar();
        showPointMenu(canvasX, canvasY, mouseX, mouseY);
    }
}

function desenhar() {
    canvas.width = canvasDiv.getBoundingClientRect().width;
    canvas.height = canvasDiv.getBoundingClientRect().height;
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    if (document.getElementById("curvas").checked == true) {
        desenharcurrentCurves();
    }
    if (document.getElementById("linhas").checked == true) {
        desenharLinhas();
    }
    if (document.getElementById("pontos").checked == true) {
        desenharPontos();
    }
    
}

function desenharPontos() {
    for (let j = 0; j < currentCurves.length; j++) {
        if (currentCurves[j].points.length > 0) {
            for (let i = 0; i < currentCurves[j].points.length; i++) {
                if(selected != -1 && i == selected && j== currentCurve) currentCurves[j].points[i].draw("blue");
                else if(j == currentCurve) currentCurves[j].points[i].draw("yellow");
                else currentCurves[j].points[i].draw("black");
            }
        }
    }
}

function desenharLinhas() {
    for (let j = 0; j < currentCurves.length; j++) {
        if (j == currentCurve) currentCurves[j].drawControlLines("green");
        else currentCurves[j].drawControlLines("grey");
    }
}

function criarCurva() {
    if (!onCreate) {
        hideMenus();
        onCreate = true;
        quantity += 1;
        let newCurve = new Curve(canvasContext, quantity + 1, pointSize);
        currentCurves.push(newCurve);
        currentCurve = quantity - 1;
        updatePageElements();
    }
}

function deletarCurva() {
    hideMenus();
    if (quantity > 0) {
        quantity--;

        currentCurves.splice(currentCurve, 1);
        if (currentCurve - 1 < 0) {
            currentCurve = currentCurves.length - 1;
        } else {
            currentCurve--;
        }
        if (quantity == 0) currentCurve = undefined;
        updatePageElements();
        for (let i = 0; i < quantity; i++) {
            currentCurves[i].id = i + 1;
        }
        desenhar();
    }
}

function curvaMenos() {
    if (currentCurve - 1 < 0) {
        currentCurve = currentCurves.length - 1;
    } else {
        currentCurve--;
    }
    desenhar();
    updatePageElements();
}

function curvaMais() {
    currentCurve = (currentCurve + 1) % currentCurves.length;
    desenhar();
    updatePageElements();
}

function desenharcurrentCurves() {
    for (let j = 0; j < currentCurves.length; j++) {
        if (j == currentCurve) currentCurves[j].drawCurves("red");
        else currentCurves[j].drawCurves("black");
    }
}

function showCreationMenu(canvasX, canvasY, mouseX, mouseY) {
    calculateMenuOffset(canvasX, canvasY, onCreateDialog);
    onCreateDialog.style.display = "block";
    onCreateDialog.style.position = "absolute";
    onCreateDialog.style.left = (mouseX + xMenuOffset) + "px";
    onCreateDialog.style.top = (mouseY + yMenuOffset) + "px";
}

function showPointMenu(canvasX, canvasY, mouseX, mouseY) {
    calculateMenuOffset(canvasX, canvasY, onPointDialog);
    onPointDialog.style.display = "block";
    onPointDialog.style.position = "absolute";
    onPointDialog.style.left = (mouseX + xMenuOffset) + "px";
    onPointDialog.style.top = (mouseY + yMenuOffset) + "px";
}

function updatePageElements() {
    if (quantity > 0) curveText.innerHTML = "Curva " + (currentCurve + 1);
    else curveText.innerHTML = "Nenhuma";
    canvas.width = canvasDiv.getBoundingClientRect().width;
    canvas.height = canvasDiv.getBoundingClientRect().height;
    yOffset = canvas.getBoundingClientRect().top;
    xOffset = canvas.getBoundingClientRect().left;
    desenhar();
}

function calculateMenuOffset(canvasX, canvasY, menu){
    if(canvasX + 60 + menu.getBoundingClientRect().width >= canvas.width){
        xMenuOffset = - menu.getBoundingClientRect().width - 60;
    }else{
        xMenuOffset = 60;
    }

    if(canvasY - 60 - menu.getBoundingClientRect().height <= 0){
        yMenuOffset = 60;
    }else{
        yMenuOffset = - menu.getBoundingClientRect().height - 60;
    }
}

function deletePointFunc() {
    currentCurves[currentCurve].points.splice(selected, 1);
    if (currentCurves[currentCurve].points.length == 0) {
        deletarCurva();
    }
    desenhar();
    hideMenus();
}

function addPointFunc(event) {
    onAddPoint = true;
    hideMenus();
}

function hideMenus() {
    onPointDialog.style.display = "none";
    onCreateDialog.style.display = "none";
}


window.addEventListener('resize', updatePageElements);