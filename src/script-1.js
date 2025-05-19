var assets = 'http://127.0.0.1:5500/FabricJs/assets/';

const prAssets = window.location.pathname.slice(0, window.location.pathname.lastIndexOf('/') + 1);

var printList = [];

var initial = document.querySelector('.initial');
const sectionId = initial.getAttribute('data-section-id');

var boxPreview = document.createElement('div');
boxPreview.className = 'boxPreview';

var prPreview = document.createElement('div');
prPreview.className = 'prPreview';

var showPopup = document.createElement('button');
showPopup.className = 'showPopup';
showPopup.textContent = 'Personalizar';

[prPreview, showPopup].forEach(e => {
    e.addEventListener('click', ()=> {
        editorApp.classList.remove('hidden');
    });
});

boxPreview.append(prPreview, showPopup);
initial.append(boxPreview);

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
        toShow(mainMenu);
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

function selectMenu(parent, target, canSelect = false, autoDiselect = true) {
    if (parent.selected === target && autoDiselect) {
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
            } else {parent.sub && parent.sub.classList.add('hidden')}
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

document.body.append(editorApp);

function createPrint() {
    return Promise.all(
        printList.map((node) => {
            return new Promise((resolve) => {
                var visible = node.isVisible();
                if (!visible) node.show();
                var target = node.print;
                var scale = target.scale();
                target.setAttrs({scale: {x:4, y:4}});
                target.toBlob({
                    width: target.width() * target.scaleX(),
                    height: target.height() * target.scaleY(),
                    x: target.x(),
                    y: target.y(),
                    callback(blob) {
                        var fileList = new DataTransfer();
                        fileList.items.add(new File([blob], 'Estampa ' + node.name));
                        target.input.files = fileList.files;
                        target.setAttr('scale', scale);

                        var url = URL.createObjectURL(blob);
                        var img = new Image();
                        img.onload = () => URL.revokeObjectURL(url);
                        img.src = url;
                        img.style = 'width: 100%';
                        document.body.append(img);

                        if (!visible) node.hide();
                        resolve();
                    }
                });
            });
        })
    );
}

function setPreviews() {
    var parent = prPreview;
    stage.setAttrs({x:0, y:0, scale: {x:1, y:1}});
    printList.forEach(node => {
        node.hide();
        node.color.hide();
    });
    printList.forEach((node, index) => {
        node.show();
        node.color.show();
        stage.toBlob({
            ...node.size(),
            x: stage.x(),
            y: stage.y(),
            callback(blob) {
                var url = URL.createObjectURL(blob);
                var img = new Image();
                img.onload = () => URL.revokeObjectURL(url);
                img.src = url;
                img.style = 'width: 100%';
                if (parent.children[index]) {
                    parent.replaceChild(img, parent.children[index]);
                } else {
                    parent.append(img);
                }
                var fileList = new DataTransfer();
                fileList.items.add(new File([blob], 'Preview ' + node.name));
                node.input.files = fileList.files;
            }
        });
        node.hide();
        node.color.hide();
    });
    printList.selected.show();
    printList.selected.color.show();
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

addMainMenu('Resize', 'Enquadrar', ()=> {
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
    height: window.innerHeight - 52,
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
            ctx.globalCompositeOperation = "source-over";
            ctx.drawImage(img, 0, 0);
            ctx.globalCompositeOperation = "source-in";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = "multiply";
            ctx.drawImage(img, 0, 0);
            target.cache();
        }
        target.setAttrs({
            image: canvas,
            ...size,
            shadowColor: 'black',
            shadowBlur: 10,
            shadowOffset: { x: 5, y: 5},
            shadowOpacity: 0.3,
            listening: false,
        });
        canvas.draw(fillColor);
    };
    img.crossOrigin = 'Anonymous';
    img.src = url;
}

function extractShadow(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;

    // Desenha a imagem no canvas
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Extrai os dados de imagem
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Processa cada pixel
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Calcula o brilho do pixel (usando uma fórmula de luminosidade)
        const brightness = (r * 0.299 + g * 0.587 + b * 0.114);

        // Ajusta o canal alfa com base na luminosidade invertida
        const alpha = 255 - brightness;

        data[i + 3] = alpha; // Define o novo valor alfa do pixel
    }

    // Coloca os dados de volta no canvas

    ctx.putImageData(imageData, 0, 0);
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Retorna o canvas atualizado ou converte para uma imagem
    return canvas;
}

function setPrOverlay(target, url) {
    // var img = new Image();
    // img.onload = function() {
    //     var canvas = extractShadow(img);
    //     img.onload = function() {
    //         img.style.width = '100%';
    //         document.body.append(img);
    //     }
    //     img.src = canvas.toDataURL();
    //     target.setAttrs({
    //         image: canvas,
    //         globalCompositeOperation: 'multiply',
    //         listening: false,
    //     });
    //     target.cache();
    // };
    // img.crossOrigin = 'Anonymous';
    // img.src = url;
}

function objectCover(object, parent, node = undefined) {
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

    if (node) {
        node.setAttrs({
            x: newX,
            y: newY,
            scaleX: scale,
            scaleY: scale
        });
    } else {
        var attrs = {x: newX, y: newY, scale: {x: scale, y: scale}};
        return attrs;
    }
}

function clickTap(target, callback) {
    target.on('click', callback);
    target.on('tap', callback);
}

var layerMath = Math.min(stage.height() - 90, Math.max(stage.width()));
var newlayerMath = ()=> {
    layerMath = Math.min(stage.height() - 90, Math.max(stage.width()));
    return attrs = {
        width: layerMath,
        height: layerMath,
        x: (stage.width() / 2) - (layerMath / 2) ,
        y: 0,
    }
};

var productLayer = new Konva.Layer();
stage.add(productLayer);

var editLayer = new Konva.Layer();
stage.add(editLayer);

editLayer.base = new Konva.Group({
    ...newlayerMath()
});
editLayer.add(editLayer.base);
    
function createLoading() {
    var box = document.createElement('div');
    box.className = "LoadingCustom hidden";

    var message_1 = document.createElement('span');
    message_1.innerText = "Criando sua obra de arte";

    var message_2 = document.createElement('span');
    message_2.innerText = "Enviando para o carrinho";

    var loadDots = document.createElement('div');
    loadDots.className = "loadDots";
    Array.from({length: 3}, () => {
        var dot = document.createElement('div');
        dot.className = "dot";
        loadDots.append(dot);
    });
    document.body.appendChild(box);
    window.loadOn = function(type) {
        if (type === 1) {
            box.replaceChildren(message_1, loadDots);
        } else if (type === 2) {
            box.replaceChildren(message_2, loadDots);
        } else {
            box.replaceChildren(loadDots);
        }
        box.classList.remove('hidden');
    };
    window.loadOff = function() {
        box.classList.add('hidden');
        box.replaceChildren();
    }
}
createLoading();

var nodeTarget;

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
    anchorSize: 10,
    anchorCornerRadius: 10
});
editLayer.add(transformer);
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
    nodeTarget.onSelect();
    transformer.setAttrs({
        nodes: [nodeTarget],
        enabledAnchors: nodeTarget.getChildren()[0].getAttr('anchors') ? nodeTarget.getChildren()[0].getAttr('anchors') : anchors.basic,
    });
    transformer.show();
}

function dragOff() {
    if (nodeTarget) {
        onSelect();
        nodeTarget = undefined;
    }
    transformer.nodes([]);
    transformer.hide();
}

var canSelect = [];

clickTap(stage, (e)=> {
    jscolor.hide();
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

var removeKey = 'db7c9394a4d440e9ab0b34c561e1e7cd';

function cutBG(file) {
    const formData = new FormData();
    formData.append('file', file);
    const queryParams = new URLSearchParams();
    queryParams.set('mattingType', '6');
    queryParams.set('crop', 'true');
    
    return fetch(`https://www.cutout.pro/api/v1/matting2?${queryParams.toString()}`, {
        method: 'POST',
        headers: {
            'APIKEY': removeKey,
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 0 && data.data && data.data.imageBase64) {
            return 'data:image/png;base64,' + data.data.imageBase64;
        } else {
            console.error('Erro na resposta da API:', data.msg);
            return null;
        }
    })
    .catch(error => {
        console.error(error);
        return null;
    });
}

var needDraw = ['color', 'brightness', 'contrast', 'duotone1', 'duotone2', 'borderWidth', 'extraBorder'];

function clarityEfx(canvas) {
    var ctx = canvas.ctx;
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;
    var threshold = 50;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

        if (brightness > threshold) {
            data[i + 3] = 0;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function newUpload(img, parent, icon, attrs) {
    var canvas = document.createElement('canvas');
    canvas.ctx = canvas.getContext('2d');
    var width = img.width;
    var height = img.height;
    canvas.width = width;
    canvas.height = height;
    
    var newAttrs = objectCover(img, parent);
        
    var group = new Konva.Group({
        typeGroup: 'img',
        icon: icon,
        image: img,
        width: width,
        height: height,
        ...newAttrs,
    });

    var noEdit = {...attrs.noEdit};
    var edit = {...attrs.edit};
    Object.assign(edit, { brightness: 1, contrast: 1, moveable: true });
    var filters = ['brightness', 'contrast'];
    var filter = filters.map(e => `${e}(\${shape.getAttr('${e}')})`).join(' ');
    
    var shape = new Konva.Image({
        image: canvas,
        ...noEdit,
        ...edit,
        edit: Object.keys(edit)
    });
    
    colorAnalize(shape);

    canvas.draw = () => {
        canvas.ctx.globalCompositeOperation = 'source-over';
        canvas.ctx.filter = eval("`" + filter + "`");
        canvas.ctx.clearRect(0, 0, width, height);
        canvas.ctx.drawImage(img, 0, 0);
        if (shape.getAttr('color')) {
            canvas.ctx.globalCompositeOperation = 'color';
            canvas.ctx.fillStyle = shape.getAttr('color');
            canvas.ctx.fillRect(0, 0, width, height);
        } else if (shape.getAttr('duotone1') && shape.getAttr('duotone2')) {
            canvas.ctx.globalCompositeOperation = 'darken';
            canvas.ctx.fillStyle = shape.getAttr('duotone1');
            canvas.ctx.fillRect(0, 0, width, height);
            canvas.ctx.globalCompositeOperation = 'lighten';
            canvas.ctx.fillStyle = shape.getAttr('duotone2');
            canvas.ctx.fillRect(0, 0, width, height);
        }
        canvas.ctx.globalCompositeOperation = 'destination-in';
        canvas.ctx.drawImage(img, 0, 0);
    };
    canvas.draw();
    
    shape.cache();
    group.add(shape);

    var ph = parent.height();
    var pw = parent.width();

    if (shape.getAttr('bg')) {
        var fillBg = new Konva.Shape({
            width: parent.width(),
            height: parent.height(),
            listening: false,
            sceneFunc: function (ctx) {
                ctx.fillStyle = shape.getAttr('bg');
                ctx.fillRect(0, 0, pw, ph);
            },
        });
        parent.add(fillBg);
    } 

    parent.add(group);
    canSelect.push(shape);
    shape.dragOn = group;
    group.onSelect = ()=> {onSelect(group)};
    icon.appendChild(img);
    icon.node = group;
    iconsList.selected = undefined;
    nodesBox.selected = undefined;
    dragOn(group);
    loadOff();
    toShow(adjustBox, updateSets);
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
                    e.image?.().draw();
                }
            });
        });
        timeout = setTimeout(() => {
            jscolorButton.targets.forEach(e => {
                e.cache();
            });
        }, 1000);
    };
}

function colorAnalize(target) {
    var attrs = target.getAttrs();
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
            var svg = svgDoc.querySelector('svg');
            var width = parseFloat(svg.getAttribute('width'));
            var height = parseFloat(svg.getAttribute('height'));
            var pathElement = svgDoc.querySelector('path');
            if (pathElement) {
                return {
                    data: pathElement.getAttribute('d'),
                    size: {
                        width: width,
                        height: height
                    }
                };
            } else {
                throw new Error("No path element found in the SVG.");
            }
        })
        .catch(error => {
            console.error("Error fetching or parsing SVG:", error);
            throw error;
        });
}

  
function imgPath(pathData, parent, attrs, size) {
    var path2D = new Path2D(pathData);
    var shape = new Konva.Shape({
        width: size ? size.width : parent.width(),
        height: size ? size.height : parent.height(),
        ...attrs,
        sceneFunc: function (ctx) {
            ctx.fillStyle = this.fill();
            ctx.fill(path2D);
        },
    });
    if (size && parent.width() < size.width) {
        var resize = parent.width() / size.width;
        shape.scale({x: resize, y: resize});
    }
    colorAnalize(shape);
    shape.cache();
    parent.add(shape);
    return shape;
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

function setClip(pathdata, target) {
    var pathClip = new Path2D(pathdata);
    var width = target.width();
    var height = target.height();
    target.setAttrs({
        clipFunc: function (ctx) {
            ctx.rect(0, 0, width, height);
            ctx._context.clip(pathClip);
        },
    });
}

function removeTransparency(canvas) {
    var ctx = canvas.getContext('2d');

    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var nPixels = imageData.data.length;
    for (var i = 3; i < nPixels; i += 4) {
        if (imageData.data[i] > 0) {
            imageData.data[i] = 255;
        }
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

function potracePath(url) {
    return new Promise((resolve, reject) => {
        Potrace.loadImageFromUrl(url);
        Potrace.process(() => {
            try {
                var svgText = Potrace.getSVG(1);
                var parser = new DOMParser();
                var svgDoc = parser.parseFromString(svgText, "image/svg+xml");
                var pathElement = svgDoc.querySelector('path');
                resolve(pathElement.getAttribute('d'));
            } catch (error) {
                reject(error);
            }
        });
    });
}

function NewPotrace(img, parent, icon, attrs, process) {
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
    removeTransparency(canvas);
    ctx.globalCompositeOperation = "source-in";
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "source-out";
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    var url = canvas.toDataURL();
    potracePath(url).then(sinuetPath => {

        ctx.globalCompositeOperation = "source-over";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        removeTransparency(canvas);
        var newUrl = canvas.toDataURL();

        potracePath(newUrl).then(pathData => {
            var newAttrs = objectCover(img, parent);
            
            var group = new Konva.Group({
                typeGroup: 'img',
                icon: icon,
                ...newAttrs,
            });
            
            var path2D = new Path2D(pathData);
            var noEdit = {...attrs.noEdit};
            var edit = {...attrs.edit};
            Object.assign(edit, { potrace: 1, invert: 0, sharpen: 0, moveable: true});
    
            var shape = new Konva.Shape({
                width: width,
                height: height,
                image: img,
                path2D: path2D,
                ...noEdit,
                ...edit,
                edit: Object.keys(edit),
                sceneFunc: function (ctx) {
                    ctx.fillStyle = shape.getAttr('color');
                    ctx.fill(shape.getAttr('path2D'));
                },
                hitFunc: function(ctx) {
                    ctx.rect(0, 0, shape.width(), shape.height());
                    ctx.fillStrokeShape(shape);
                }
            });
    
            colorAnalize(shape);

            var sinuet = new Path2D(sinuetPath);

            var borderWidth = 0;
            var extraBorder = 0;
            var totalBorder = 0;
            var translate = 0;

            var clipShape = new Konva.Shape({
                width: width,
                height: height,
                globalCompositeOperation: 'destination-out',
                sceneFunc: function (ctx) {
                    ctx.translate(translate, translate);
                    ctx.fill(sinuet);
                    if (totalBorder > 0) {
                        ctx.lineWidth = totalBorder;
                        ctx.stroke(sinuet);
                    }
                },
            });

            var borderShape = new Konva.Shape({
                width: width,
                height: height,
                sceneFunc: function (ctx) {
                    ctx.translate(translate, translate);
                    if (borderWidth) {
                        ctx.lineWidth = borderWidth;
                        var borderColor = borderShape.getAttr('borderColor');
                        if (borderColor === 'color') {
                            ctx.strokeStyle = shape.getAttr('color');
                        } else {
                            ctx.strokeStyle = borderColor;
                        }
                        var clip = new Path2D(sinuetPath);
                        clip.rect(-translate, -translate, width + totalBorder, height + totalBorder);
                        ctx.clip(clip, 'evenodd');
                        ctx.stroke(sinuet);
                    }
                },
            });

            if (noEdit.jsColor) {
                noEdit.jsColor.forEach((e, i) => {
                    if (e.attrs.includes('borderColor')) {
                        menuColorList.forEach(input => {
                            if (input.id == e.id) {
                                input.targets.push(borderShape);
                                borderShape.onColor = {};
                                borderShape.onColor[e.id] = ['borderColor'];
                            }
                        });
                    }
                });
            }

            var attributes = ['borderWidth', 'extraBorder', 'borderColor'];
            attributes.forEach(attr => {
                const value = shape.getAttr(attr);
                if (value !== undefined) {
                    value !== 'borderColor' && clipShape.setAttr(attr, value);
                    borderShape.setAttr(attr, value);
                    shape.setAttr(attr, undefined);
                }
            });
            // shape.setAttr('edit', shape.getAttr('edit').filter(item => !attributes.includes(item)));
            
            borderShape.draw = ()=> {
                borderWidth = borderShape.getAttr('borderWidth') || 0;
                extraBorder = borderShape.getAttr('extraBorder') || 0;
                totalBorder = borderWidth + extraBorder;
                translate = totalBorder / 2;
                [clipShape, borderShape].forEach(c => {
                    c.setAttrs({
                        width: width + totalBorder,
                        height: height + totalBorder,
                    });
                });
                shape.setAttrs({
                    x: translate,
                    y: translate
                })
                group.setAttrs(groupSize(group));
            };
            borderShape.draw();

            group.add(clipShape, borderShape, shape);

            var ph = parent.height();
            var pw = parent.width();
    
            if (shape.getAttr('bg')) {
                var fillBg = new Konva.Shape({
                    width: parent.width(),
                    height: parent.height(),
                    listening: false,
                    sceneFunc: function (ctx) {
                        ctx.fillStyle = shape.getAttr('bg');
                        ctx.fillRect(0, 0, pw, ph);
                    },
                });
                parent.add(fillBg);
            } 
            
            parent.add(group);
            canSelect.push(shape);
            shape.dragOn = group;
            group.onSelect = ()=> {onSelect(group)};
            icon.appendChild(img);
            icon.node = group;
            iconsList.selected = undefined;
            nodesBox.selected = undefined;
            dragOn(group);
            clipShape.cache();
            borderShape.cache();
            shape.cache();
            loadOff();
            toShow(adjustBox, updateSets);
        });
    });
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

function upPotrace(target) {
    loadOn(0);
    var img = new Image();
    img.onload = () => {
        var imgWidth = img.width;
        var imgHeigth = img.height;
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        var scaleFactor = 1;
        var maxSize = 2000;
        if (imgWidth > maxSize || imgHeigth > maxSize) {
            scaleFactor = Math.min(maxSize / imgWidth, maxSize / imgHeigth);
        }
        var width = imgWidth * scaleFactor;
        var height = imgHeigth * scaleFactor;
        img.width = width;
        img.height = height;
        canvas.width = width;
        canvas.height = height;
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.filter = `brightness(${target.getAttr('potrace')})
            invert(${target.getAttr('invert')})`;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        applySharpen(ctx, canvas.width, canvas.height, target.getAttr('sharpen'));
        var url = canvas.toDataURL();
        potracePath(url).then(pathData => {
            var path2D = new Path2D(pathData);
            target.setAttr('path2D', path2D);
            target.cache();
            loadOff();
        });
    };
    img.src = target.getAttr('image').src;
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

function groupSize(group) {
    var width = 0;
    var height = 0;

    group.getChildren().forEach(child => {
        var newWidth = child.x() + child.width();
        if (newWidth > width) {
            width = newWidth;
        }
        var newHeight = child.y() + child.height();
        if (newHeight > height) {
            height = newHeight;
        }
    });

    return {width: width, height: height};
}

function align(v, t = nodeTarget) {
    var pSize = t.getParent().size();
    var nodeSizeValue = groupSize(t);
    var newPos = t.position();
    var scale = t.scale();
    
    switch (v) {
        case 'top':
            newPos.y = 0;
            break;
            case 'bottom':
                newPos.y = pSize.height - (nodeSizeValue.height * scale.y);
            break;
            case 'left':
                newPos.x = 0;
            break;
            case 'right':
            newPos.x = pSize.width - (nodeSizeValue.width * scale.x);
            break;
            case 'middle':
                newPos.y = (pSize.height - (nodeSizeValue.height * scale.y)) / 2;
                break;
            case 'center':
                newPos.x = (pSize.width - (nodeSizeValue.width * scale.x)) / 2;
            break;
        default:
            break;
    }

    t.position(newPos);
}

function moveNode(v = {n: undefined, v: 0}) {
    var newPos = nodeTarget.position();

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

    nodeTarget.position(newPos);
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
        
        var children;
        var timeout;
        input.oninput = ()=> {
            clearTimeout(timeout);
            var newColor = input.jscolor.toHEXString();
            children.forEach(e => {
                e.clearCache();
                e.setAttr(add.attr, newColor);
                parent.btn.style.setProperty('--color', newColor);
                if (needDraw.includes(add.attr)) {
                    e.image?.().draw();
                }
            });
            timeout = setTimeout(() => {
                children.forEach(e => {
                    e.cache();
                });
            }, 1000);
        }
        
        box.change = () => {
            children = nodeTarget.getChildren(function(node){
                return node.getAttrs()[add.attr] !== undefined;
            });
            var value = children[0].getAttr(add.attr);
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
        
        var tittle = document.createElement('div');
        tittle.textContent = add.name;
        
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
    
        var children;
        box.change = () => {
            children = nodeTarget.getChildren(function(node){
                return node.getAttrs()[add.attr] !== undefined;
            });
            if (children.length > 0) {
                var value = children[0].getAttr(add.attr) / (v.scale ? 5 : 1);
                inputRange.value = value;
                v.label ? mapToRange(value) : inputText.value = value;
            }
        };

        var cache;
        inputRange.addEventListener(add.onChange ? 'change' : 'input', () => {
            children.forEach(e => {
                e.clearCache();
                var value = inputRange.value * (v.scale ? 5 : 1);
                e.setAttr(add.attr, value);
                if (add.func) {
                    eval(add.func);
                    cache = false;
                } else if (needDraw.includes(add.attr)) {
                    e.image?.().draw();
                    e.draw?.();
                    cache = true;
                } else {
                    cache = true;
                }
            });
        });

        inputRange.onchange = () => {
            if (cache === true) {
                children.forEach(e => {
                    e.cache();
                });
            }
        };
    
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
    
        box.append(tittle, inputRange, inputText);
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

        var children;
        box.change = ()=> {
            children = nodeTarget.getChildren(function(node){
                return node.getAttrs()[add.attr] !== undefined;
            });
            var value = children[0].getAttr(add.attr);
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
                    children.forEach(e => {
                        add.attr && e.setAttr(add.attr, value);
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
                        children.forEach(e => {
                            (add.attr && e.setAttr(add.attr, newValue));
                            (add.func && eval(add.func));
                        });
                    };
                } else {
                    btn.onclick = ()=> {
                        children.forEach(e => {
                            (add.attr && e.setAttr(add.attr, value));
                            (add.func && eval(add.func));
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
            for (const child of nodeTarget.getChildren()) {
                if (child.getAttr(add.attr)) {
                    var value = child.getAttr(add.attr);
                    var target = nodeTarget.input;
                    var clone = target.cloneNode(false);
                    clone.value = value;
                    target.setAttrs(clone);
                    box.replaceChildren(clone);
                    clone.oninput = ()=> {
                        target.value = clone.value;
                        target.dispatchEvent(new Event('input'));
                    };
                    break;
                }
            }
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
            name: 'Texto',
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
                    attr: 'color',
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
                },
            ]
        },
        {
            name: 'Cor',
            class: 'duotone',
            add: [
                {
                    name: 'Tons claros',
                    type: 'color',
                    attr: 'duotone1',
                    list: true,
                },
                {
                    name: 'Tons escuros',
                    type: 'color',
                    attr: 'duotone2',
                    list: true,
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
                    func: 'upPotrace(e)',
                    values: {min: 0, max: 2, label: {min: -10, max: 10}},
                },
                {
                    name: 'Detalhes',
                    type: 'range',
                    attr: 'sharpen',
                    onChange: true,
                    func: 'upPotrace(e)',
                    values: {min: 0, max: 2, label: {min: 0, max: 10}},
                },
                {
                    class: 'flex-center',
                    type: 'btnFunc',
                    attr: 'invert',
                    func: 'upPotrace(e)',
                    btns: [
                        {text: 'Inverter', value: ['0', '1'], icon: assets + 'icons/invert-svg.svg', class: 'invert'},
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

        {
            name: 'Borda',
            class: 'borderImg',
            add: [
                {
                    name: 'Espessura',
                    type: 'range',
                    attr: 'borderWidth',
                    values: {min: 0, max: 30},
                },
                {
                    name: 'Recorte',
                    type: 'range',
                    attr: 'extraBorder',
                    values: {min: 0, max: 30},
                },
                {
                    name: 'Cor',
                    type: 'color',
                    attr: 'borderColor',
                    list: true,
                },
            ]
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
        var attrs = nodeTarget.getChildren().map(function(node) {
            return node.getAttr('edit');
        }).flat();
        bBox.a.a.setAttribute('type', nodeTarget.getAttr('typeGroup'));
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
            var text = target.node.getAttr('typeGroup') === 'Text';
            if (iconsList.selected === target && !text) {
                dragOff();
            } else {
                dragOn(target.node);
            }
        }
    } else {
        var icon = target.getAttr('icon');
        var text = target.getAttr('typeGroup') === 'Text';
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

var Produtos = {
    Camiseta: {
        areas: {
            Frente: {
                url: assets + 'Produtos/Camiseta-Front.png',
                tamanho: {l: 3508, a: 4960},
                preview: {escala: 40, l: 877, a: 1240},
                posição: {x: true, y: true},
            }, 
            Costa: {
                url: assets + 'Produtos/Camiseta-Back.png',
                tamanho: {l: 3508, a: 4960},
                preview: {escala: 40, l: 877, a: 1240},
                posição: {x: true, y: 14},
            }
        },
        cores: [
            {name: 'Branco', color: '#ffffff'},
            {name: 'Preto', color: '#2b2b2b'},
            {name: 'Cinza Mescla', color: '#d3d3d3'},
            {name: 'Azul Marinho', color: '#272762'},
            {name: 'Azul Claro', color: '#87ceeb'},
        ],
        tamanho: [
            {t: 'P', l: '46-50', a: '65-69'},
            {t: 'M', l: '48-52', a: '67-71'},
            {t: 'G', l: '53-57', a: '69-73'},
            {t: 'GG', l: '56-60', a: '72-76'},
            {t: 'XGG', l: '59-63', a: '72-77'},
        ],
        info: `<p><strong>Técnica de impressão:</strong>&nbsp;Silk Digital HD.</p><p><strong>Composição:</strong>&nbsp;100% algodão, meia malha penteada, costura reforçada, gola em ribana, 165g, fio 30.1.</p>`
    },
    BabyLook: {
        areas: {
            Frente: {
                url: assets + 'Produtos/Baby-Look-Front.png',
                tamanho: {l: 3188, a: 4252},
                preview: {escala: 38, l: 797, a: 1063},
                posição: {x: true, y: true},
            },
        },
        cores: [
            {name: 'Branco', color: '#ffffff'},
            {name: 'Preto', color: '#2b2b2b'},
            {name: 'Cinza Mescla', color: '#d3d3d3'},
        ],
        tamanho: [
            {t: 'P', l: '38-42', a: '57-61'},
            {t: 'M', l: '41-45', a: '60-64'},
            {t: 'G', l: '43-47', a: '62-66'},
            {t: 'GG', l: '45-49', a: '63-67'},
        ],
        info: `<p><strong>Técnica de impressão:</strong>&nbsp;Silk Digital HD.</p><p><strong>Composição:</strong>&nbsp;100% algodão, meia malha penteada, costura reforçada, gola em ribana, 165g, fio 30.1.</p>`
    },
    Cropped: {
        areas: {
            Frente: {
                url: assets + 'Produtos/Cropped-Front.png',
                tamanho: {l: 3068, a: 2124},
                preview: {escala: 38, l: 767, a: 531},
                posição: {x: true, y: 40},
            },
        },
        cores: [
            {name: 'Branco', color: '#ffffff'},
            {name: 'Preto', color: '#2b2b2b'},
            {name: 'Cinza Mescla', color: '#d3d3d3'},
        ],
        tamanho: [
            {t: 'P', l: '46-50', a: '37-41'},
            {t: 'M', l: '49-53', a: '38-42'},
            {t: 'G', l: '52-56', a: '39-43'},
            {t: 'GG', l: '54-58', a: '41-45'},
        ],
        info: `<p><strong>Técnica de impressão:</strong>&nbsp;Silk Digital HD.</p><p><strong>Composição:</strong>&nbsp;100% algodão, meia malha penteada, costura reforçada, gola em ribana, 165g, fio 30.1.</p>`
    },
    Ecobag: {
        areas: {
            Frente: {
                url: assets + 'Produtos/Ecobag.png',
                tamanho: {l: 4724, a: 3540},
                preview: {escala: 58, l: 1181, a: 885},
                posição: {x: true, y: 42},
            },
            Costa: {
                url: assets + 'Produtos/Ecobag.png',
                tamanho: {l: 4724, a: 3540},
                preview: {escala: 58, l: 1181, a: 885},
                posição: {x: true, y: 42},
            },
        },
        cores: [
            {name: 'Algodão cru', color: '#fff4e7'},
        ],
        tamanho: [
            {t: 'G', l:46, a: 35},
        ],
        info: `<p><strong>Técnica de impressão:</strong>&nbsp;DTF (Direct to Film).</p><p><strong>Composição:</strong>&nbsp;100% algodão, tecido cru.</p>`
    },
};

function newPrint() {
    var size = editLayer.base.size();
    var pr = new Konva.Group({
        ...size,
    });
    
    pr.color = new Konva.Image({
        ...size,
    });

    pr.print = new Konva.Group();

    pr.overlay = new Konva.Shape({
        ...size,
    });

    pr.add(pr.print);

    productLayer.add(pr.color);
    editLayer.base.add(pr);
    
    return pr;
}

function setSideInfo(target, product, areaName) {
    var area = product.areas[areaName];
    setPrColor(target.color, area.url, product.cores[0].color);
    var tamanho = area.tamanho;
    var preview = area.preview;
    var pos = area.posição;
    var scale = ((target.width() * preview.escala) / 100) / preview.l;
    target.print.setAttrs({
        width: preview.l,
        height: preview.a,
        x: typeof pos.x === "number" ? ((target.width() * pos.y) / 100) :
        (target.width() / 2) - ((preview.l  * scale) / 2),
        y: typeof pos.y === "number" ? ((target.height() * pos.y) / 100) :
        (target.height() / 2) - ((preview.a  * scale) / 2),
        scale: { 
            x: scale,
            y: scale,
        },
        clip: {
            width: preview.l,
            height: preview.a,
        },
        realSize: {
            width: tamanho.l,
            height: tamanho.a
        }
    });
    setPrOverlay(target.overlay, area.url);
}

window.addEventListener('resize', ()=> {
    stage.setAttrs({
        width: Math.min(769, Math.max(window.innerWidth)),
        height: window.innerHeight,
    });
    colorPickers.forEach(e => {
        e.jscolor.width = Math.min(460, Math.max(window.innerWidth - 57));
    });
});