var assets = 'http://127.0.0.1:5500/FabricJs/assets/';

var printList = [];

var initial = document.querySelector('.initial');

var prPreview = document.createElement('div');
prPreview.className = 'prPreview';

initial.append(prPreview);

var editorApp = document.createElement('div');
editorApp.className = 'editorApp hidden';

var popupEditor = document.createElement('div');
popupEditor.className = 'popupEditor';

editorApp.append(popupEditor);

var canvaBox = document.createElement('div');
canvaBox.className = 'canvaBox';

var onTopApp = document.createElement('div');
onTopApp.className = 'onTopApp';

var popupBtnWrap = document.createElement('div');
popupBtnWrap.className = 'popupBtnWrap';

var closeApp = document.createElement('button');
closeApp.className = 'close';

[closeApp].forEach(e => {
    e.addEventListener('click', ()=> {
        editorApp.classList.add('hidden');
        setPreviews();
    });
});

onTopApp.append(popupBtnWrap, closeApp);

var appMain = document.createElement('div');
appMain.className = 'appMain';

var mainMenu = document.createElement('div');
mainMenu.className = 'mainMenu';

mainMenu.sub = document.createElement('div');
mainMenu.sub.className = 'hidden';

mainMenuList = document.createElement('div');
mainMenuList.className = 'iconListBox';

mainMenu.append(mainMenu.sub, mainMenuList);

function addMainMenu(className, text, func, canSelect = false) {
    var button = document.createElement('button');
    button.className = `iconBtn ${className}`;
    button.tittle = text;
    button.onclick = ()=> {
        typeof func === 'function' && func();
        selectMenu(mainMenu, button, canSelect);
    };
    var span = document.createElement('span');
    span.textContent = text;
    button.append(span);
    mainMenuList.append(button);
    return button;
}

function selectMenu(parent, target, canSelect = false) {
    if (parent.selected === target) {
        parent.selected.classList.remove('selected');
        parent.sub.classList.add('hidden');
        parent.selected.box && parent.selected.box.remove();
        parent.selected = undefined;
    } else {
        if(parent.selected) {
            parent.selected.classList.remove('selected');
            parent.selected.box && parent.selected.box.remove();
        }
        if (canSelect) {
            target.classList.add('selected');
            if (target.box) {
                parent.sub.classList.remove('hidden');
                parent.sub.append(target.box);
                if (parent.sub.tittle) {
                    parent.sub.tittle.textContent = target.tittle;
                }
            } else {parent.sub.classList.add('hidden')}
            parent.selected = target;
        } else {
            parent.sub.classList.add('hidden');
            parent.selected = undefined;
        }
    }
}

var mainDesign = document.createElement('div');
mainDesign.className = 'mainDesign toDown';

mainDesign.close = document.createElement('div');
mainDesign.close.icon = document.createElement('button');
mainDesign.close.icon.className = 'close';
mainDesign.close.append(mainDesign.close.icon);

var mainEdit = document.createElement('div');
mainEdit.className = 'mainEdit';

mainDesign.append(mainDesign.close, mainEdit);

var adjustBox = document.createElement('div');
adjustBox.className = 'adjustBox toDown';

appMain.append(mainMenu, mainDesign, adjustBox);

popupEditor.append(canvaBox, onTopApp, appMain);

var pageBtnWrap = document.createElement('div');
pageBtnWrap.className = 'pageBtnWrap';

var showPopup = document.createElement('button');
showPopup.className = 'showPopup';
showPopup.textContent = 'Personalizar';

[prPreview, showPopup].forEach(e => {
    e.addEventListener('click', ()=> {
        editorApp.classList.remove('hidden');
    });
});

var addCartBtn = document.createElement('button');
addCartBtn.className = 'addCartBtn';
addCartBtn.textContent = 'Adicionar ao carrinho';

var buyBtn = document.createElement('button');
buyBtn.className = 'buyBtn';
buyBtn.textContent = 'Comprar agora';
buyBtn.onclick = ()=> {createPrint()};

pageBtnWrap.append(showPopup, addCartBtn, buyBtn);

initial.append(pageBtnWrap);

document.body.append(editorApp);

function createPrint() {
    printList.forEach(node => {
        var visible = node.isVisible();
        if (!visible) node.show();
        var target = node.print;
        var scale = target.scale();
        target.setAttrs({scale: {x:1, y:1}});
        new Promise((resolve) => {
            target.toBlob({
                ...target.size(),
                x: target.x(),
                y: target.y(),
                callback(blop) {
                    var fileList = new DataTransfer();
                    fileList.items.add(new File([blop], node.name));
                    target.input.files = fileList.files;
                    resolve();
                }
            });
        });
        target.setAttr('scale', scale);
        if (!visible) node.hide();
    });
}

var onShow = mainMenu;
var previous;

function toShow(show, refreshing = false) {
    if (show.selected) {
        show.selected.classList.remove('selected');
        show.selected.box && show.selected.box.remove();
        show.sub.classList.add('hidden');
        show.selected = undefined;
    }
    if (show === onShow && refreshing === false) {
        return;
    }
    onShow.classList.add('toDown');
    if (show !== onShow) {
        previous = onShow;
    }
    show === mainMenu && dragOff();
    setTimeout(() => {
        if (typeof refreshing === 'function') {
            refreshing();
        }
        show.classList.remove('toDown');
        onShow = show;
    }, 300);
}

addMainMenu('callDesign', 'Design', ()=> {toShow(mainDesign)});

addMainMenu('initial', 'Enquadrar', ()=> {
    stage.setAttrs({x:0, y:0, scale: {x:1, y:1}});
});

mainDesign.close.onclick = ()=> {
    toShow(mainMenu);
}

jscolor.presets.default = {
    width: Math.min(460, Math.max(window.innerWidth - 57)), height:165, 
    closeButton: true, closeText: '', sliderSize: 15
};
var colorPickers = [];

Konva.hitOnDragEnabled = true;

var stage = new Konva.Stage({
    container: canvaBox,
    width: Math.min(769, Math.max(window.innerWidth)),
    height: window.innerHeight,
    draggable: true,
});

var minScale = 1;
var maxScale = 4;

stage.on('wheel', function (e) {
    e.evt.preventDefault();
    var scaleBy = 1.1;
    var oldScale = stage.scaleX();

    var pointer = stage.getPointerPosition();

    var mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
    };

    // Calcula o novo valor de escala
    var newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

    // Limita o valor da escala entre 1 e 5
    newScale = Math.max(minScale, Math.min(newScale, maxScale));

    // Aplica a nova escala
    stage.scale({ x: newScale, y: newScale });

    var newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
    };

    stage.position(newPos);
    stage.batchDraw();
});

function getDistance(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function getCenter(p1, p2) {
    return {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2,
    };
}

var lastCenter = null;
var lastDist = 0;
var dragStopped = false;
var minPinchDistance = 10;


stage.on('touchmove', function (e) {
    e.evt.preventDefault();
    var touch1 = e.evt.touches[0];
    var touch2 = e.evt.touches[1];

    // Restaura o drag se ele foi interrompido
    if (touch1 && !touch2 && !stage.isDragging() && dragStopped) {
        stage.startDrag();
        dragStopped = false;
    }

    if (touch1 && touch2) {
        // Se o stage estava sob drag & drop, precisamos parar
        if (stage.isDragging()) {
            dragStopped = true;
            stage.stopDrag();
        }

        var p1 = {
            x: touch1.clientX,
            y: touch1.clientY,
        };
        var p2 = {
            x: touch2.clientX,
            y: touch2.clientY,
        };

        // Calcula a distância inicial entre os dois toques
        var dist = getDistance(p1, p2);

        // Apenas inicia o zoom se a distância for suficiente para evitar toques acidentais
        if (dist < minPinchDistance) return;

        if (!lastCenter) {
            lastCenter = getCenter(p1, p2);
            lastDist = dist;
            return;
        }

        var newCenter = getCenter(p1, p2);

        // Localiza as coordenadas do centro do zoom
        var pointTo = {
            x: (newCenter.x - stage.x()) / stage.scaleX(),
            y: (newCenter.y - stage.y()) / stage.scaleX(),
        };

        // Calcula a nova escala, e limita entre os valores permitidos
        var scale = stage.scaleX() * (dist / lastDist);
        scale = Math.max(minScale, Math.min(maxScale, scale)); // Limita entre minScale e maxScale

        // Aplica a nova escala
        stage.scale({ x: scale, y: scale });

        // Calcula o novo posicionamento do stage
        var dx = newCenter.x - lastCenter.x;
        var dy = newCenter.y - lastCenter.y;

        var newPos = {
            x: newCenter.x - pointTo.x * scale + dx,
            y: newCenter.y - pointTo.y * scale + dy,
        };

        stage.position(newPos);
        stage.batchDraw();

        // Atualiza as variáveis para a próxima iteração
        lastDist = dist;
        lastCenter = newCenter;
    }
});

stage.on('touchend', function (e) {
    lastDist = 0;
    lastCenter = null;
});

var layer = new Konva.Layer({
    y: 52,
});
stage.add(layer);

function setPrColor(target, url, fillColor, size) {
    var img = new Image();
    img.onload = function() {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.draw = (color)=> {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = color;
            ctx.drawImage(img, 0, 0);
            ctx.globalCompositeOperation = "source-in";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = "source-over";
            target.getLayer().draw();
        }
        canvas.draw(fillColor);

        target.setAttrs({
            image: canvas,
            ...size,
            shadowColor: 'black',
            shadowBlur: 10,
            shadowOffset: { x: 5, y: 5},
            shadowOpacity: 0.3,
            listening: false,
        });
    };
    img.src = url;
}

function setPrOverlay(target, url) {
    var img = new Image();
    img.onload = function() {
        target.setAttrs({
            image: img,
            globalCompositeOperation: 'multiply',
            listening: false,
        });
    };
    img.src = url;
}

function objectCover(node, object, parent) {
    var objectWidth = object.width;
    var objectHeight = object.height;
    var width = parent.width();
    var height = parent.height();
    
    var scaleX = width / objectWidth;
    var scaleY = height / objectHeight;
    var scale = Math.max(scaleX, scaleY);

    var newWidth = objectWidth * scale;
    var newHeight = objectHeight * scale;
    var newX = (width - newWidth) / 2;
    var newY = (height - newHeight) / 2;

    node.setAttrs({
        x: newX,
        y: newY,
        scaleX: scale,
        scaleY: scale
    });
}

function clickTap(target, callback) {
    target.on('click', callback);
    target.on('tap', callback);
}

var previewList = [];

function setPreviews() {
    var parent = prPreview;
    stage.setAttrs({x:0, y:0, scale: {x:1, y:1}});
    printList.forEach((node, index) => {
        var visible = node.isVisible();
        node.toImage({
            ...node.size(),
            x: node.x(),
            y: 52,
            callback(img) {
                img.style = 'width: 100%';
                img.width = Math.min(500, Math.max(img.width));
                parent.children[index] ? parent.replaceChild(img, parent.children[index]) : parent.append(img);
            }
        });
        node.toBlob({
            ...node.size(),
            x: node.x(),
            y: 52,
            callback(blop) {
                var fileList = new DataTransfer();
                fileList.items.add(new File([blop], 'Preview' + node.name));
                node.input.files = fileList.files;
            }
        });
        visible || node.hide();
    });
}

var layerMath = Math.min(layer.height() - 90 - 52, Math.max(layer.width()));
var productLayer = new Konva.Group({
    layerMath: layerMath,
    width: layerMath,
    height: layerMath,
    x: (layer.width() / 2) - (layerMath / 2) ,
    y: 0,
});
layer.add(productLayer);

function createLoading() {
    var loadingContainer = document.createElement('div');
    loadingContainer.className = "LoadingCustom hidden ProductLoad";
    var loadGif = document.createElement('div');
    loadGif.className = "loadGif";
    var loadMessage_1 = document.createElement('div');
    loadMessage_1.className = "loadMessage";
    loadMessage_1.innerText = "Criando sua obra de arte";
    var loadMessage_2 = document.createElement('div');
    loadMessage_2.className = "loadMessage";
    loadMessage_2.innerText = "Enviando para o carrinho";
    var loaderDots = document.createElement('div');
    loaderDots.className = "loaderDots";
    Array.from({length: 3}, () => {
        var dot = document.createElement('div');
        dot.className = "dot";
        loaderDots.appendChild(dot);
    });
    loadingContainer.appendChild(loadGif);
    loadingContainer.appendChild(loadMessage_1);
    loadingContainer.appendChild(loadMessage_2);
    loadingContainer.appendChild(loaderDots);
    document.body.appendChild(loadingContainer);
    window.loadOn = function(type) {
        if (type === 0) {
            loadingContainer.classList.remove('message1', 'message2');
            loadingContainer.classList.add('ProductLoad');
        };
        if (type === 1) {
            loadingContainer.classList.remove('ProductLoad', 'message2');
            loadingContainer.classList.add('message1');
        };
        if (type === 2) {
            loadingContainer.classList.remove('ProductLoad', 'message1');
            loadingContainer.classList.add('message2');
        };
        loadingContainer.classList.remove('hidden');
    };
    window.loadOff = function() {
        loadingContainer.classList.add('hidden');
    }
}
createLoading();

var nodeTarget = [];

var updateSets = ()=>{};

    //  TRANSFORMER //

var anchors = {
    none: [],
    basic: [
        'top-left', 
        'top-right',
        'bottom-left',
        'bottom-right',
    ],
    all: [
        'top-left', 
        'top-center', 
        'top-right', 
        'middle-right', 
        'middle-left', 
        'bottom-left', 
        'bottom-center', 
        'bottom-right'
    ],
}

var transformer = new Konva.Transformer({
    shouldOverdrawWholeArea: true,
    rotationEnabled: false,
    anchorSize: 10,
    anchorStyleFunc: (anchor) => {
        anchor.cornerRadius(10);
        if (anchor.hasName('top-center') || anchor.hasName('bottom-center')) {
          anchor.height(16);
          anchor.offsetY(8);
          anchor.width(40);
          anchor.offsetX(20);
        }
        if (anchor.hasName('middle-left') || anchor.hasName('middle-right')) {
          anchor.height(40);
          anchor.offsetY(20);
          anchor.width(16);
          anchor.offsetX(8);
        }
    },
});
transformer.rotateEnabled(false);
layer.add(transformer);
transformer.hide();

var dontMove = () => {
    transformer.centeredScaling(true);
    transformer.setAttrs({
        enabledAnchors: anchors.all
    });
    let initialPositions = transformer.nodes().map((node) => node.position());
    transformer.on('transformend', () => {
        initialPositions = transformer.nodes().map((node) => node.position());
    });
    transformer.on('dragstart', (e) => {
        transformer.nodes().forEach((shape, index) => {
            shape.position(initialPositions[index]);
        });
        transformer.getLayer().batchDraw();
    });
    transformer.on('dragmove', () => {
        //stopDrag();
        transformer.nodes().forEach((shape, index) => {
            shape.position(initialPositions[index]);
        });
        transformer.getLayer().batchDraw();
    });
};

function dragOn(target) {
    nodeTarget = target;
    nodeTarget[0].onSelect();
    transformer.setAttrs({
        nodes: nodeTarget,
        enabledAnchors: nodeTarget[0].getAttr('anchors') ? nodeTarget[0].getAttr('anchors') : anchors.basic,
    });
    transformer.show();
}

function dragOff() {
    if (nodeTarget.length > 0) {
        onSelect();
        nodeTarget = [];
    }
    transformer.nodes([]);
    transformer.hide();
}

var canSelect = [];

clickTap(stage, (e)=> {
    if (canSelect.includes(e.target)) {
        dragOn(e.target.dragOn);
        toShow(adjustBox, updateSets);
        return;
    }
    toShow(mainMenu);
});

function setAttrs(t, a) {
    var p = t.getParent();
    if (a.width === 'full') {
        a.width = p.width();
    }
    if (a.height === 'full') {
        a.height = p.height();
    }
    if (a.x === 'center') {
        a.x = (p.width() / 2) - ((a.width ? a.width: t.width()) / 2);
    }
    if (a.y === 'center') {
        a.y = (p.height() / 2) - ((a.height ? a.height: t.height()) / 2);
    }
    t.setAttrs(a);
}

var needDraw = ['imgFill', 'brightness', 'contrast'];

function newUpload(e, parent, icon, attrs) {
    var file = e.target.files[0];
    var reader = new FileReader();
    parent.destroyChildren();
    icon.innerHTML = '';
    reader.onload = function () {
        var img = new Image();
        img.onload = function () {
            var canvas = document.createElement('canvas');
            canvas.ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;

            var noEdit = {...attrs.noEdit};
            var edit = {...attrs.edit};
            Object.assign(edit, { brightness: 1, contrast: 1, moveable: true });

            var kvImg = new Konva.Image({
                image: canvas,
                icon: icon,
                ...noEdit,
                ...edit,
                edit: Object.keys(edit),
            });

            colorAnalize(kvImg, noEdit);

            var filters = ['brightness', 'contrast'];
            var filter = filters.map(e => `${e}(\${kvImg.getAttr('${e}')})`).join(' ');
            canvas.draw = () => {
                canvas.ctx.globalCompositeOperation = 'source-over';
                canvas.ctx.filter = eval("`" + filter + "`");
                canvas.ctx.drawImage(img, 0, 0);
                if (kvImg.getAttr('imgFill')) {
                    canvas.ctx.fillStyle = kvImg.getAttr('imgFill');
                    canvas.ctx.globalCompositeOperation = 'source-in';
                    canvas.ctx.drawImage(img, 0, 0);
                    canvas.ctx.globalCompositeOperation = 'color';
                    canvas.ctx.fillRect(0, 0, kvImg.width(), kvImg.height());
                }
            };
            canvas.draw();
            objectCover(kvImg, img, parent);
            parent.add(kvImg);
            kvImg.onSelect = ()=> {onSelect(kvImg)};
            canSelect.push(kvImg);
            kvImg.dragOn = [kvImg];
            icon.appendChild(img);
            icon.node = [kvImg];
            iconsList.selected = undefined;
            nodesBox.selected = undefined;
            e.target.value = '';
            dragOn([kvImg]);
            toShow(adjustBox, updateSets);
        };
        img.src = reader.result;
    };

    reader.readAsDataURL(file);
};

function newFont(name, url) {
    var font = new FontFace(name, `url(${url})`);
    font.load().then(() => {
        document.fonts.add(font);
    }).catch((error) => {
        console.error(`Erro ao carregar fonte '${name}'`, error);
    });
}

function createMenuColor(parent, color, id) {
    var jscolorButton = document.createElement('input');
    new JSColor(jscolorButton, {
        value: color,
        closeButton: false,
    });
    jscolorButton.targets = [];
    jscolorButton.id = id;
    menuColorList.push(jscolorButton);
    colorPickers.push(jscolorButton);
    
    var button = addMainMenu('jsColor color', `Cor ${id}`, ()=> {
        if (mainMenu.selected !== button) {
            jscolorButton.jscolor.show();
        }
    }, true);
    button.style.setProperty('--color', color);

    button.append(jscolorButton);
    parent.append(button);

    let timeout;

    jscolorButton.oninput = () => {
        var newColor = jscolorButton.jscolor.toHEXString();
        button.style.setProperty('--color', newColor);
        clearTimeout(timeout);
        jscolorButton.targets.forEach(e => {
            e.clearCache();
            e.onColor[id].forEach(attr => {
                e.setAttr(attr, newColor);
                if (needDraw.includes(attr)) {
                    e.image().draw();
                }
            });
        });
        timeout = setTimeout(() => {
            jscolorButton.targets.forEach(e => {
                e.cache();
            });
            console.log('cache');
        }, 1000);
    };

}

function colorAnalize(target, attrs) {
    if (attrs.jsColor) {
        target.onColor = target.onColor || {};
        attrs.jsColor.forEach(a => {
            menuColorList.forEach(btn => {
                if (btn.id == a.id) {
                    function finish() {
                        target.onColor[a.id] = a.attrs;
                        a.attrs.forEach(attr => {
                            target.setAttr(attr, btn.jscolor.toHEXString());
                        });
                        btn.targets = btn.targets.filter(node => node.parent !== null);
                        btn.targets.push(target);
                    }
                    if (btn.jscolor && typeof btn.jscolor.toHEXString === 'function') {
                        finish();
                    } else{
                        var interval = setInterval(() => {
                            if (btn.jscolor && typeof btn.jscolor.toHEXString === 'function') {
                                clearInterval(interval);
                                finish();
                            }
                        }, 200);
                    }
                }
            })
        });
    }
}

function getPath(url) {
    return fetch(url)
    .then(response => response.text())
    .then(svgText => {
        var parser = new DOMParser();
        var svgDoc = parser.parseFromString(svgText, "image/svg+xml");
        var pathElement = svgDoc.querySelector('path');
        if (pathElement) {
          return pathElement.getAttribute('d');
        } else {
          throw new Error("No path element found in the SVG.");
        }
    })
    .catch(error => {
        console.error("Error fetching or parsing SVG:", error);
        throw error;
    });
}
  
function imgPath(pathData, parent, attrs) {
    parent.destroyChildren();
    var path2D = new Path2D(pathData);
    var shape = new Konva.Shape({
        height: parent.height(),
        width: parent.width(),
        ...attrs,
        sceneFunc: function (ctx) {
        ctx.clip(path2D);
        ctx.fillStyle = this.fill();
        ctx.fillRect(0, 0, this.width(), this.height());
        },
    });
    colorAnalize(shape, attrs);
    shape.cache();
    parent.add(shape);
}

function translatePathData(pathData, dx, dy, scaleX, scaleY) {
    return pathData.replace(/([MLHVCSQTA])([^MLHVCSQTA]+)/gi, function(match, command, params) {
        var paramArray = params.trim().split(/[\s,]+/).map(parseFloat);

        if (command === 'H') {
            // Ajusta o valor X para comandos horizontais (H), com o deslocamento e escala
            paramArray = paramArray.map(x => dx + (x * scaleX)); // Primeiro adiciona o dx, depois aplica a escala
        } else if (command === 'V') {
            // Ajusta o valor Y para comandos verticais (V), com o deslocamento e escala
            paramArray = paramArray.map(y => dy + (y * scaleY)); // Primeiro adiciona o dy, depois aplica a escala
        } else {
            // Para os comandos que afetam tanto X quanto Y, ajuste ambos
            for (let i = 0; i < paramArray.length; i += 2) {
                paramArray[i] = dx + (paramArray[i] * scaleX);    // Ajuste X com dx e escala
                paramArray[i + 1] = dy + (paramArray[i + 1] * scaleY); // Ajuste Y com dy e escala
            }
        }

        return command + ' ' + paramArray.join(' ');
    });
}

var nodePath = {n: undefined, y: 0, x: 0, sY: 0, sX: 0};

function movePath(p, t) {
    var path = p.getAttr('path2D');
    var size = p.size();
    var scale = t.scale();
    var pos = t.position();

    var x = pos.x;
    var y = pos.y;
    var scaleX = scale.x;
    var scaleY = scale.y;
    var height = size.height;
    var width = size.width;

    var pathDraw = new Path2D(translatePathData(path, x, y, scaleX, scaleY));

    // Ajustes para criar retângulos com base na posição e escala
    if (y > 0) {
        // Preencher a área acima
        pathDraw.rect(0, 0, width, Math.abs(y));
    }
    if (x > 0) {
        // Preencher a área à esquerda
        pathDraw.rect(0, 0, Math.abs(x), height);
    }
    
    // Preencher a área abaixo (se houver espaço devido à escala Y)
    if (y + height * scaleY < height) {
        pathDraw.rect(0, height * scaleY + y, width, height - height * scaleY - y);
    }
    
    // Preencher a área à direita (se houver espaço devido à escala X)
    if (x + width * scaleX < width) {
        pathDraw.rect(width * scaleX + x, 0, width - width * scaleX - x, height);
    }

    p.setAttr('pathDraw', pathDraw);
    p.draw();
}

function textClip(url, targetID, text, height, rule) {
    var targets = [];
    targetID.forEach(id => {
        t = stage.findOne(`#${id}`);
        targets.push(t);
    });
    opentype.load(url, function(err, font) {
        if (err) {
            console.error('Erro ao carregar a fonte: ', err);
            return;
        }

        function update() {
            var fontSize = text[0].getAttr('fontSize');
            var letterSpacing = text[0].getAttr('letterSpacing');
            var value = text[0].text();
            var path2D = new Path2D();
            text.forEach(e => {
                var x = e.x();
                var y = e.y() + (height * fontSize);
                var ltx = 0;
                value.split('').forEach(char => {
                    var pathData = font.getPath(char, x + ltx, y, fontSize);
                    var newPath = new Path2D(pathData.toPathData());
                    path2D.addPath(newPath);
                    var glyph = font.charToGlyph(char);
                    var advanceWidth = glyph.advanceWidth * (fontSize / font.unitsPerEm);
                    ltx += advanceWidth + letterSpacing;
                });
            });
            targets.forEach(t => {
                t.setAttr('pathText', path2D);
            });
        }

        targets.forEach(target => {
            if (target.getAttr('pathClip')) {
                update();
            } else {
                update();
                rule === 0 ? rule = 'nonzero' : rule = 'evenodd';
                var theight = target.height();
                var twidth = target.width();
                target.setAttrs({
                    rule: rule,
                    clipFunc: function (ctx) {
                        ctx.rect(0, 0, twidth, theight);
                        var newPath = new Path2D();
                        rule === 'evenodd' ? newPath.rect(0, 0, twidth, theight) : '';
                        newPath.addPath(target.getAttr('pathText'));
                        ctx._context.clip(newPath, rule);
                    },
                });
                // if (target.children[0] === text[0]) {
                //     target.setAttrs({
                //         hitFunc: function (ctx) {
                //             ctx.rect(text[0].x, text[0].y, text[0].width, text[0].height);
                //             ctx.fillStrokeShape(this);
                //         }
                //     })
                // }
            }
        });

        text[0].on('fontSizeChange letterSpacingChange textChange xChange yChange', function() {
            update();
        });
    });
}

function setClip(pathdata, target, rule = 0) {
    var pathClip = new Path2D(pathdata);
    var width = target.width();
    var height = target.height();
    
    rule === 0 ? rule = 'nonzero' : rule = 'evenodd';
    target.setAttrs({
        pathClip: pathClip,
        rule: rule,
        clipFunc: function (ctx) {
            ctx.rect(0, 0, width, height);
            var path2D = new Path2D();
            rule === 'evenodd' && path2D.rect(0, 0, width, height);
            path2D.addPath(target.getAttr('pathClip'));
            target.getAttr('pathText') && path2D.addPath(target.getAttr('pathText'));
            ctx._context.clip(path2D, rule);
        },
    });
    // var rect = new Konva.Rect({
            //     height: height,
            //     width: width,
            //     fill: 'red',
            // });
            // //target.add(rect);
}

function NewPotrace(event, parent, icon, attrs) {
    loadOn(0);
    var file = event.target.files[0];
    var reader = new FileReader();
    var img = new Image();
    parent.destroyChildren();
    icon.innerHTML = '';

    reader.onload = function () {
        img.onload = () => {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            var scaleFactor = 1;
            var maxSize = 2000;
            if (img.width > maxSize || img.height > maxSize) {
                scaleFactor = Math.min(maxSize / img.width, maxSize / img.height);
            }
            var width = img.width * scaleFactor;
            var height = img.height * scaleFactor;
            
            img.width = width;
            img.height = height;
            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            var url = canvas.toDataURL();
            Potrace.loadImageFromUrl(url);
            Potrace.process(() => {
                var svgText = Potrace.getSVG(1);
                var parser = new DOMParser();
                var svgDoc = parser.parseFromString(svgText, "image/svg+xml");
                var pathElement = svgDoc.querySelector('path');
                var pathData = pathElement.getAttribute('d');
                var path2D = new Path2D(pathData);
                
                var noEdit = {...attrs.noEdit};
                var edit = {...attrs.edit};
                Object.assign(edit, { potrace: 1, invert: 0, sharpen: 0, moveable: true, });

                var shape = new Konva.Shape({
                    id: 'svg-test',
                    width: width,
                    height: height,
                    icon: icon,
                    path2D: path2D,
                    ...noEdit,
                    ...edit,
                    edit: Object.keys(edit),
                    listening: false,
                });

                colorAnalize(shape, noEdit);
                
                var hitShape = new Konva.Rect();

                shape.setAttrs({
                    sceneFunc: function (ctx) {
                        hitShape.setAttrs({
                            ...shape.size(),
                            ...shape.position(),
                            scale: shape.scale(),
                        });
                        ctx.clip(shape.getAttr('path2D'));
                        ctx.fillStyle = shape.fill();
                        ctx.fillRect(0, 0, width, height);
                        ctx.fillStrokeShape(shape);
                    },
                });
                
                var ph = parent.height();
                var pw = parent.width();

                var fillBg = new Konva.Shape({
                    width: parent.width(),
                    height: parent.height(),
                    listening: false,
                    sceneFunc: function (ctx) {
                        ctx.fillStyle = shape.fill();
                        var path = new Path2D();
                        path.rect(0, 0, pw, ph);
                        path.rect(shape.x() + 1, shape.y() + 1, (shape.width() - 1) * shape.scaleX(), (shape.height() - 1) * shape.scaleY());
                        ctx.clip(path, 'evenodd');
                        ctx.fillRect(0, 0, pw, ph);
                    },
                });

                parent.add(shape, fillBg, hitShape);

                objectCover(shape, img, parent);
                
                canSelect.push(hitShape);
                hitShape.dragOn = [shape];
                shape.onSelect = ()=> {onSelect(shape)};
                icon.appendChild(img);
                icon.node = [shape];
                iconsList.selected = undefined;
                nodesBox.selected = undefined;
                event.target.value = '';
                dragOn([shape]);
                shape.cache();
                loadOff();
                toShow(adjustBox, updateSets);
            });
        };
        img.src = reader.result;
    };

    reader.readAsDataURL(file);
}

function applySharpen(ctx, width, height, intensity = 1) {
    // Ajuste a intensidade do sharpen
    const weights = [
        0, -1 * intensity, 0,
        -1 * intensity, 1 + 4 * intensity, -1 * intensity,
        0, -1 * intensity, 0
    ];
    
    const side = Math.round(Math.sqrt(weights.length));
    const halfSide = Math.floor(side / 2);
    const srcData = ctx.getImageData(0, 0, width, height);
    const dstData = ctx.createImageData(width, height);
    
    const src = srcData.data;
    const dst = dstData.data;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dstOff = (y * width + x) * 4;
            let r = 0, g = 0, b = 0;
            
            for (let cy = 0; cy < side; cy++) {
                for (let cx = 0; cx < side; cx++) {
                    const scy = Math.min(height - 1, Math.max(0, y + cy - halfSide));
                    const scx = Math.min(width - 1, Math.max(0, x + cx - halfSide));
                    const srcOff = (scy * width + scx) * 4;
                    const wt = weights[cy * side + cx];
                    
                    r += src[srcOff] * wt;
                    g += src[srcOff + 1] * wt;
                    b += src[srcOff + 2] * wt;
                }
            }
            
            dst[dstOff] = r;
            dst[dstOff + 1] = g;
            dst[dstOff + 2] = b;
            dst[dstOff + 3] = src[dstOff + 3]; // Copy alpha channel
        }
    }
    
    ctx.putImageData(dstData, 0, 0);
}

function upPotrace() {
    loadOn(0);
    var img = new Image();
    img.onload = () => {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        var scaleFactor = 1;
        var maxSize = 2000;
        if (img.width > maxSize || img.height > maxSize) {
            scaleFactor = Math.min(maxSize / img.width, maxSize / img.height);
        }
        var width = img.width * scaleFactor;
        var height = img.height * scaleFactor;
        img.width = width;
        img.height = height;
        canvas.width = width;
        canvas.height = height;
        ctx.filter = `brightness(${nodeTarget[0].getAttr('potrace')})
            invert(${nodeTarget[0].getAttr('invert')})`;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        applySharpen(ctx, canvas.width, canvas.height, nodeTarget[0].getAttr('sharpen'));
        var url = canvas.toDataURL();
        Potrace.loadImageFromUrl(url);
        Potrace.process(() => {
            var svgText = Potrace.getSVG(1);
            var parser = new DOMParser();
            var svgDoc = parser.parseFromString(svgText, "image/svg+xml");
            var pathElement = svgDoc.querySelector('path');
            var pathData = pathElement.getAttribute('d');
            var path2D = new Path2D(pathData);
            nodeTarget[0].setAttr('path2D', path2D);
            nodeTarget[0].cache();
            loadOff();
        });
    };
    img.src = nodeTarget[0].getAttr('icon').children[0].src;
}

var colorOrder = [
    '000000',
    '0000ff',
    '008000',
    'ffff00',
    'ff00ff',
    'c0c0c0',
    '000080',
    '008080',
    'ffa500',
    '800080',
];

function btnHold(element, action) {
    if (element || action) {
        let timer = null;
        let touchTimer = null;

        function startMoving() {
            if (element) {
                element.classList.add('onClick');
                function ContinueAction() {
                    action();
                    if (btnOnFocus) {
                        timer = setTimeout(ContinueAction, 100);
                    } else {
                        stopMoving();
                    }
                }
                if (btnOnFocus) {
                    action();
                    timer = setTimeout(ContinueAction, 400);
                } else {
                    stopMoving();
                }
            }
        }

        function stopMoving() {
            btnOnFocus = false;
            clearTimeout(timer);
            clearTimeout(touchTimer);
            element.classList.remove('onClick');
        }

        element.addEventListener('mousedown', () => {
            btnOnFocus = true;
            startMoving();
        });

        element.addEventListener('touchstart', () => {
            btnOnFocus = true;
            touchTimer = setTimeout(() => {
                startMoving();
            }, 200);
        });
        
        element.addEventListener('touchmove', () => {
            clearTimeout(touchTimer);
        });

        element.addEventListener('mouseup', stopMoving);
        element.addEventListener('touchend', stopMoving);
    }
}

function align(v, t = nodeTarget[0]) {
    var parent = t.getParent();
    var pSize = parent.size();
    var nodeSize = t.size();
    var newPos = t.position();
    var scale = t.scale();

    switch (v) {
        case 'top':
            newPos.y = 0;
            break;
        case 'bottom':
            newPos.y = pSize.height - (nodeSize.height * scale.y);
            break;
        case 'left':
            newPos.x = 0;
            break;
        case 'right':
            newPos.x = pSize.width - (nodeSize.width * scale.x);
            break;
        case 'middle':
            newPos.y = (pSize.height - (nodeSize.height * scale.y)) / 2;
            break;
        case 'center':
            newPos.x = (pSize.width - (nodeSize.width * scale.x)) / 2;
            break;
        default:
            break;
    }

    t.position(newPos);
    transformer.getLayer().batchDraw();
}

function moveNode(v = {n: undefined, v: 0}) {
    var newPos = nodeTarget[0].position();

    switch (v.n) {
        case 'up':
            newPos.y = newPos.y - v.v;
            break;
        case 'down':
            newPos.y = newPos.y + v.v;
            break;
        case 'left':
            newPos.x = newPos.x - v.v;
            break;
        case 'right':
            newPos.x = newPos.x + v.v;
        default:
            break;
    }

    nodeTarget[0].position(newPos);
    transformer.getLayer().batchDraw();
}

function createInput() {
    var listBtn = [];

    function createJsColor(parent, add) {
        var box = document.createElement('div');
        box.className = 'colorBox';
        box.attr = add.attr;
        if (add.list) {
            var tittle = document.createElement('div');
            tittle.textContent = add.name;
            box.classList.add('list');
            box.append(tittle);
        }
        parent.list.push(box);
        
        var button = document.createElement('button');
        button.className = 'colorBtn';
        var input = document.createElement('input');
        new JSColor(input, {
            previewElement: button
        });
        colorPickers.push(input);
        button.onclick = ()=> {input.jscolor.show()};
        button.append(input);
        box.append(button);
        
        var timeout;
        input.oninput = ()=> {
            var newColor = input.jscolor.toHEXString();
            if (nodeTarget.length > 0) {
                clearTimeout(timeout);
                nodeTarget.forEach(e => {
                    e.clearCache();
                    e.setAttr(add.attr, newColor);
                    parent.btn.style.setProperty('--color', newColor);
                    if (needDraw.includes(add.attr)) {
                        e.image().draw();
                    }
                });
                timeout = setTimeout(() => {
                    nodeTarget.forEach(e => {
                        e.cache();
                    });
                    console.log('cache');
                }, 1000);
            }
        }
        
        box.change = () => {
            var value = nodeTarget[0].getAttr(add.attr);
            input.jscolor.fromString(value);
            parent.btn.style.setProperty('--color', value);
            button.style.background = value;
            input.value = value;
        };
        
    }

    function rangeInput(parent, add) {
        var v = add.values;
        var box = document.createElement('div');
        box.className = 'rangeBox';
        box.attr = add.attr;
        
        var title = document.createElement('div');
        title.textContent = add.name;
        
        var inputRange = document.createElement('input');
        Object.assign(inputRange, {
            type: 'range',
            min: v.min, 
            max: v.max, 
            step: v.label ? (v.max - v.min) * 0.005 : 1 
        });
        
        var inputText = document.createElement('input');
        inputText.type = 'text';
        inputText.value = inputRange.value;
        
        function mapToRange(value) {
            var l = v.label;
            var mappedValue = ((value - v.min) / (v.max - v.min)) * (l.max - l.min) + l.min;
            inputText.value = `${Math.round(mappedValue)}`;
        }
    
        box.change = () => {
            var value = nodeTarget[0].getAttr(add.attr) / (v.scale ? 5 : 1);
            inputRange.value = value;
            v.label ? mapToRange(value) : inputText.value = value;
        };
    
        inputRange.addEventListener(add.onChange ? 'change' : 'input', () => {
            if (nodeTarget.length > 0) {
                nodeTarget.forEach(e => {
                    var value = inputRange.value * (v.scale ? 5 : 1);
                    e.setAttr(add.attr, value);
                    if (add.func) {
                        eval(add.func);
                    } else if (needDraw.includes(add.attr)) {
                        e.image().draw();
                    } else {
                        e.cache();
                    }
                });
            }
        });
    
        inputRange.oninput = () => { 
            v.label ? mapToRange(inputRange.value) : inputText.value = inputRange.value;
        };
    
        inputText.addEventListener('change', () => {
            var value = parseFloat(inputText.value);
            if (isNaN(value)) {
                value = v.min;
            } else if (value < v.min) {
                value = v.min;
            } else if (value > v.max) {
                value = v.max;
            }
            inputRange.value = value;
            inputRange.dispatchEvent(new Event('input'));
        });
    
        box.append(title, inputRange, inputText);
        parent.list.push(box);
    }

    function btnFunc(parent, add) {
        var box = document.createElement('div');
        box.className = '';
        box.attr = add.attr;
        if (add.name) {
            var tittle = document.createElement('div');
            tittle.textContent = add.name;
            box.appendChild(tittle);
        }
        
        var btnBox = document.createElement('div');
        add.class ? btnBox.className = add.class : '';

        box.change = ()=> {
            var value = nodeTarget[0].getAttr(add.attr);
            btnBox.value = value;
        };

        var list = [];
        add.btns.forEach(e => {
            var value = e.value;
            var btn = document.createElement('button');
            e.class ? btn.className = e.class : '';
            list.push(btn);
            if (e.text) {
                var span = document.createElement('span');
                span.textContent = e.text;
                btn.append(span);
            }
            if (e.icon) {
                fetch(e.icon)
                    .then(response => response.text())
                    .then(svgContent => {
                        const svgElement = document.createElement('div');
                        svgElement.innerHTML = svgContent;
                        const svg = svgElement.querySelector('svg');
                        
                        if (svg) {
                            btn.append(svg);
                        } else {
                            console.error("SVG não encontrado no arquivo.");
                        }
                    })
                    .catch(error => console.error('Erro ao carregar o SVG:', error));
            }            
            if (add.btnHold) {
                var func = ()=> {
                    nodeTarget.forEach(e => {
                        (add.attr ? e.setAttr(add.attr, value) : '');
                    });
                    eval(add.btnHold);
                };
                btnHold(btn, func);
            } else {
                if (Array.isArray(value)) {
                    btn.onclick = ()=> {
                        var newValue;
                        value.forEach(e => {
                            if (e !== btnBox.value) {
                                newValue = e;
                            }
                        });
                        btnBox.value = newValue;
                        nodeTarget.forEach(e => {
                            (add.attr ? e.setAttr(add.attr, newValue) : '');
                            (add.func ? eval(add.func) : '');
                        });
                    };
                } else {
                    btn.onclick = ()=> {
                        nodeTarget.forEach(e => {
                            (add.attr ? e.setAttr(add.attr, value) : '');
                            (add.func ? eval(add.func) : '');
                        });
                    };
                }
            }
            btnBox.append(btn);
        });
        
        box.append(btnBox);
        parent.list.push(box);
    }

    function textInput(parent, add) {
        var box = document.createElement('div');
        box.className = 'inputTextBox';
        box.attr = add.attr;

        box.change = ()=> {
            var value = nodeTarget[0].getAttr(add.attr);
            var target = nodeTarget[0].input;
            var clone = target.cloneNode(false);
            clone.value = value;
            target.setAttrs(clone);
            box.replaceChildren(clone);
            clone.oninput = ()=> {
                target.value = clone.value;
                target.dispatchEvent(new Event('input'));
            };
        };
        parent.list.push(box);
    }

    var aBox = document.createElement('div');
    adjustBox.sub = aBox;
    aBox.className = 'hidden';
    aBox.a = document.createElement('div');
    adjustBox.sub.tittle = aBox.a;
    aBox.append(aBox.a);

    var bBox = document.createElement('div');
    bBox.a = document.createElement('div');
    bBox.a.a = document.createElement('div');
    bBox.a.append(bBox.a.a);
    bBox.b = document.createElement('button');
    bBox.b.className = 'close';
    bBox.b.addEventListener('click', ()=> {
        toShow(previous);
    });
    bBox.append(bBox.a, bBox.b);

    adjustBox.append(aBox, bBox);

    var create = [
        {
            name: 'Editar',
            class: 'type-text',
            add: [
                {
                    type: 'text',
                    attr: 'text',
                }
            ]
        },
        {
            name: 'Cor',
            class: 'color',
            add: [
                {
                    name: 'Cor',
                    type: 'color',
                    attr: 'fill',
                }
            ]
        },
        {
            name: 'Cor',
            class: 'color',
            add: [
                {
                    name: 'Cor',
                    type: 'color',
                    attr: 'imgFill',
                }
            ]
        },

        // Img Filters

        {
            name: 'Ajuste',
            class: 'Adjust',
            add: [
                {
                    name: 'Brilho',
                    type: 'range',
                    attr: 'brightness',
                    values: {min: 0, max: 2, label: {min: -100, max: 100}},
                },
                {
                    name: 'Contraste',
                    type: 'range',
                    attr: 'contrast',
                    values: {min: 0, max: 2, label: {min: -100, max: 100}},
                },
            ],
        },

        // Potrace
      
        {
            name: 'Efeito',
            class: 'svgEfect',
            add: [
                {
                    name: 'Brilho',
                    type: 'range',
                    attr: 'potrace',
                    onChange: true,
                    func: 'upPotrace()',
                    values: {min: 0, max: 2, label: {min: -10, max: 10}},
                },
                {
                    name: 'Detalhamento',
                    type: 'range',
                    attr: 'sharpen',
                    onChange: true,
                    func: 'upPotrace()',
                    values: {min: 0, max: 2, label: {min: 0, max: 10}},
                },
                {
                    class: 'flex-center',
                    type: 'btnFunc',
                    attr: 'invert',
                    func: 'upPotrace()',
                    btns: [
                        {text: 'Inverter', value: ['0', '1'], icon: assets + 'invert-svg.svg', class: 'invert'},
                    ],
                },
            ]
        },

        // Text Settings

        {
            name: 'Tamanho',
            class: 'fontSize',
            add: [
                {
                    name: 'Tamanho da fonte',
                    type: 'range',
                    attr: 'fontSize',
                    values: {min: 1, max: 200, scale: true},
                },
                {
                    name: 'Espaço entre letras',
                    type: 'range',
                    attr: 'letterSpacing',
                    values: {min: 0, max: 30, scale: true},
                },
            ]
        },

        {
            name: 'Borda',
            class: 'stroke',
            add: [
                {
                    name: 'Espessura',
                    type: 'range',
                    attr: 'strokeWidth',
                    values: {min: 0, max: 50, scale: true},
                },
                {
                    name: 'Cor',
                    type: 'color',
                    attr: 'stroke',
                    list: true,
                },
            ]
        },

        // effects 

        {
            name: 'Sombra',
            class: 'shadow',
            add: [
                {
                    name: 'Borrão',
                    type: 'range',
                    attr: 'shadowBlur',
                    values: {min: 0, max: 20, scale: true},
                },
                {
                    name: 'Transparência',
                    type: 'range',
                    attr: 'shadowOpacity',
                    values: {min: 0, max: 1, label: {min: 0, max: 100}},
                },
                {
                    name: 'Cor',
                    type: 'color',
                    attr: 'shadowColor',
                    list: true,
                },
                {
                    name: 'Posição Horizontal',
                    type: 'range',
                    attr: 'shadowOffsetX',
                    values: {min: -50, max: 50},
                },
                {
                    name: 'Posição Vetical',
                    type: 'range',
                    attr: 'shadowOffsetY',
                    values: {min: -50, max: 50},
                },
            ],
        },

        // position

        {
            name: 'Posição',
            class: 'position',
            add: [
                {
                    name: '',
                    class: 'grid position',
                    type: 'btnFunc',
                    attr: 'moveable',
                    func: 'align(value)',
                    btns: [
                        {text: 'Em cima', value: 'top', class: 'onTop'}, 
                        {text: 'Esquerda', value: 'left', class: 'onLeft'},
                        {text: 'Meio', value: 'middle', class: 'onMiddle'}, 
                        {text: 'Centro', value: 'center', class: 'onCenter'},
                        {text: 'Em baixo', value: 'bottom', class: 'onBottom'}, 
                        {text: 'Direita', value: 'right', class: 'onRight'},
                    ],
                },
                {
                    name: '',
                    class: 'flex position',
                    type: 'btnFunc',
                    attr: 'moveable',
                    btnHold: 'moveNode(value)',
                    btns: [
                        {value: {n: 'up', v: 5 }, class: 'up'},
                        {value: {n: 'down', v: 5}, class: 'down'},
                        {value: {n: 'left', v: 5}, class: 'left'},
                        {value: {n: 'right', v: 5}, class: 'right'},
                    ],
                },
            ]
        }

    ];

    create.forEach((e) => {
        let box = document.createElement('div');
        box.list = [];
        
        e.add.forEach(add => {
            if(add.type === 'color') {
                createJsColor(box, add);
            }
            if(add.type === 'range') {
                rangeInput(box, add);
            }
            if(add.type === 'btnFunc') {
                btnFunc(box, add);
            }
            if(add.type === 'text') {
                textInput(box, add);
            }
        });

        let button = document.createElement('button');
        button.className = `iconBtn  ${e.class}`;
        button.tittle = e.name;
        button.span = document.createElement('span');
        button.span.textContent = e.name;
        button.append(button.span);
        button.box = box;
        button.n = e.add.map(e => e.attr);
        listBtn.push(button);

        button.onclick = ()=> {
            selectMenu(adjustBox, button, true);
        };

        box.btn = button;

        bBox.a.a.appendChild(button);
    });

    updateSets = () => {
        var attrs = nodeTarget[0].getAttr('edit');
        bBox.a.a.setAttribute('type', nodeTarget[0].getClassName());
        aBox.a.textContent = '';
        bBox.a.a.innerHTML = '';
        listBtn.forEach(e => {
            if (e.n.some(n => attrs.includes(n))) {
                bBox.a.a.append(e);
                e.box.list.forEach(c => {
                    if (attrs.includes(c.attr)) {
                        e.box.append(c);
                        c.change();
                    } else {
                        c.remove();
                    }
                });
            } else {
                e.remove();
            }
        });
    };
}

createInput();

var iconsList = [];
var nodesBox = [];

function onSelect(target = undefined, icon = false) {
    if (!target) {
        iconsList.selected.parent.classList.remove('selected');
        iconsList.selected.configBox.classList.add('hidden');
        iconsList.selected = undefined;
        nodesBox.selected = undefined;
        return;
    }
    if (icon) {
        if (target.onInput === true) {
            if (iconsList.selected) {
                iconsList.selected.parent.classList.remove('selected');
                iconsList.selected.configBox.classList.add('hidden');
            }
            target.parent.classList.add('selected');
            target.configBox.classList.add('hidden');
            iconsList.selected = target;
            nodesBox.selected = target.nodeBox;
            nodeTarget = [];
            transformer.nodes([]);
            transformer.hide();
            target.input.click();
        } else {
            var text = target.node[0].getClassName() === 'Text';
            if (iconsList.selected === target && !text) {
                dragOff();
            } else {
                dragOn(target.node);
            }
        }
    } else {
        var icon = target.getAttr('icon');
        var text = icon.node[0].getClassName() === 'Text';
        if (iconsList.selected === icon && !text) {
            iconsList.selected.parent.classList.remove('selected');
            iconsList.selected.configBox.classList.add('hidden');
            iconsList.selected = undefined;
            nodesBox.selected = undefined;
        } else {
            if (iconsList.selected) {
                iconsList.selected.parent.classList.remove('selected');
                iconsList.selected.configBox.classList.add('hidden');
            }
            icon.parent.classList.add('selected');
            icon.configBox.classList.remove('hidden');
            iconsList.selected = icon;
            nodesBox.selected = target.getParent();
        }
    }
}

var menuColorList = [];

const Camiseta = {
    areas: {
        Frente: {
            url: assets + 'Camiseta-Front.png',
            tamanho: {escala: 40, l: 3508, a: 4961},
            posição: {x: true, y: true},
            input: 'InputPrintFront',
            inputPrv: 'InputPreviewFront'
        }, 
        Costa: {
            url: assets + 'Camiseta-Back.png',
            tamanho: {escala: 40, l: 3508, a: 4961},
            posição: {x: true, y: 14},
            input: 'InputPrintBack',
            inputPrv: 'InputPreviewBack',
        }
    },
    cores: [
        {name: 'Branco', color: '#ffffff'},
        {name: 'Off-White', color: '#FDF5E6'},
        {name: 'Preto', color: '#2b2b2b'},
        {name: 'Cinza Mescla', color: '#d3d3d3'},
        {name: 'Azul Marinho', color: '#191970'},
        {name: 'Azul Claro', color: '#87ceeb'},
        {name: 'Vermelho', color: '#ff0000'},
    ],
    tamanho: [
        {t: 'P', l:40, a: 44},
        {t: 'M', l:42, a: 46},
        {t: 'G', l:44, a: 48},
        {t: 'GG', l:46, a: 50},
        {t: 'XGG', l:48, a: 52},
    ],
};

var Produtos = [Camiseta];

var prColor;
var prSizes;
const input = document.createElement('input');

function createProduct() {
    Produtos.forEach(e => {
        Object.keys(e.areas).forEach(areaName => {
            const area = e.areas[areaName];
            var tamanho = area.tamanho;
            var pos = area.posição;
            var scale = ((productLayer.width() * tamanho.escala) / 100) / tamanho.l;

            e[areaName] = new Konva.Group({
                ...productLayer.size(),
                clip: productLayer.size(),
            });
            e[areaName].hide();

            e[areaName].name = areaName;

            e[areaName].cor = new Konva.Image({ ...productLayer.size() });
            setPrColor(e[areaName].cor, area.url, e.cores[0].color),

            e[areaName].print = new Konva.Group({
                width: tamanho.l,
                height: tamanho.a,
                x: typeof pos.x === "number" ? ((productLayer.width() * pos.y) / 100) :
                (productLayer.width() / 2) - ((tamanho.l  * scale) / 2),
                y: typeof pos.y === "number" ? ((productLayer.height() * pos.y) / 100) :
                (productLayer.height() / 2) - ((tamanho.a  * scale) / 2),
                scale: { 
                    x: scale,
                    y: scale,
                },
                clip: {
                    width: tamanho.l,
                    height: tamanho.a,
                }
            });

            e[areaName].overlay = new Konva.Image({ ...productLayer.size() });
            setPrOverlay(e[areaName].overlay, area.url);

            e[areaName].add(e[areaName].cor, e[areaName].print, e[areaName].overlay);
            productLayer.add(e[areaName]);

            e[areaName].input = document.querySelector(`.${area.inputPrv}`);
            e[areaName].print.input = document.querySelector(`.${area.input}`);

        });
        if (prColor === undefined) {
            prColor = addMainMenu('color', 'Cor do produto', false, true);
            prColor.style.setProperty('--color', e.cores[0].color);
            prColor.box = document.createElement('div');
            prColor.box.className = 'iconListBox';
            var InputColor = document.querySelector('.InputColor');
            InputColor.value = Camiseta.cores[0].name;
            Camiseta.cores.forEach(cor => {
                var button = document.createElement('button');
                button.className = `iconBtn color`;
                button.color = cor.color;
                button.style.setProperty('--color', cor.color);
                button.onclick = ()=>{
                    prColor.style.setProperty('--color', cor.color);
                    Object.keys(e.areas).forEach(areaName => {
                        e[areaName].cor.image().draw(cor.color);
                    });
                    InputColor.value = cor.name;
                };
                var span = document.createElement('span');
                span.textContent = cor.name;
                button.append(span);
                prColor.box.append(button);
            })
        }
    });
}
createProduct();

window.addEventListener('resize', ()=> {
    stage.setAttrs({
        width: Math.min(769, Math.max(window.innerWidth)),
        height: window.innerHeight,
    });
    colorPickers.forEach(e => {
        e.jscolor.width = Math.min(460, Math.max(window.innerWidth - 57));
    });
});