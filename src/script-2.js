var editList = [];
var btnAreaList = [];

if (iniciar.produtos) {
    var btn = addMainMenu('Product', 'Produto', false, true);
    btn.box = document.createElement('div');
    btn.box.className = 'iconListBox';
    
    var inputPrName = document.createElement('input');
    inputPrName.classList.add('hidden');
    inputPrName.setAttribute('type', 'text');
    inputPrName.setAttribute('form', `product-form-${sectionId}`);
    inputPrName.setAttribute('name', `properties[_hiddenPropertyName Produto]`);
    document.body.append(inputPrName);

    var prColor = addMainMenu('color', 'Cor do produto', false, true);
    prColor.box = document.createElement('div');
    prColor.box.className = 'iconListBox';

    var inputColor = document.createElement('input');
    inputColor.classList.add('hidden');
    inputColor.setAttribute('type', 'text');
    inputColor.setAttribute('form', `product-form-${sectionId}`);
    inputColor.setAttribute('name', `properties[_hiddenPropertyName Cor]`);
    document.body.append(inputColor);

    var prSize = document.createElement('div');
    prSize.className = 'prSize';
    prSize.tittle = document.createElement('span');
    prSize.tittle.textContent = 'Tamanho';
    prSize.options = document.createElement('div');
    prSize.info = document.createElement('div');
    prSize.append(prSize.tittle, prSize.options, prSize.info);
    initial.append(prSize);

    var inputSize = document.createElement('input');
    inputSize.classList.add('hidden');
    inputSize.setAttribute('type', 'text');
    inputSize.setAttribute('form', `product-form-${sectionId}`);
    inputSize.setAttribute('name', `properties[Tamanho]`);
    document.body.append(inputSize);

    iniciar.produtos.forEach((p, i) => {
        var prBtn = document.createElement('button');
        prBtn.className = `iconBtn ${p}`;
        prBtn.textContent = p;
        btn.box.append(prBtn);

        prBtn.color = ()=> {
            prColor.box.replaceChildren();
            Produtos[p].cores.forEach((cor, ii) => {
                var button = document.createElement('button');
                button.className = `iconBtn color`;
                button.color = cor.color;
                button.style.setProperty('--color', cor.color);
                if (ii === 0) {
                    prColor.box.selected = button;
                    button.classList.add('selected');
                    prColor.style.setProperty('--color', Produtos[p].cores[0].color);
                    inputColor.value = Produtos[p].cores[0].name;
                }
                button.onclick = ()=>{
                    selectMenu(prColor.box, button, true, false);
                    prColor.style.setProperty('--color', cor.color);
                    editLayer.base.getChildren().forEach(child => {
                        child.color.image().draw(cor.color);
                    });
                    inputColor.value = cor.name;
                };
                var span = document.createElement('span');
                span.textContent = cor.name;
                button.append(span);
                prColor.box.append(button);
            })
        };

        prBtn.infoSizes = (size)=> {
            prSize.info.classList.add('toDown');
            var widthBox = document.createElement('div');
            widthBox.name = document.createElement('span');
            widthBox.name.textContent = 'Largura: ';
            widthBox.value = document.createElement('span');
            widthBox.value.textContent = size.l + 'cm';
            widthBox.append(widthBox.name, widthBox.value);
            
            var heightBox = document.createElement('div');
            heightBox.name = document.createElement('span');
            heightBox.name.textContent = 'Comprimento: ';
            heightBox.value = document.createElement('span');
            heightBox.value.textContent = size.a + 'cm';
            heightBox.append(heightBox.name, heightBox.value);
            
            setTimeout(() => {
                prSize.info.classList.remove('toDown');
                prSize.info.replaceChildren(widthBox, heightBox);
            }, 300);
        }

        prBtn.sizes = ()=> {
            var sizes = Produtos[p].tamanho;
            prSize.options.replaceChildren();
            sizes.forEach((size, i) => {
                var sizeBtn = document.createElement('button');
                sizeBtn.textContent = size.t;
                prSize.options.append(sizeBtn);
                if (i === 0) {
                    prSize.options.selected = sizeBtn;
                    sizeBtn.classList.add('selected');
                    inputSize.value = size.t;
                    prBtn.infoSizes(size);
                }
                sizeBtn.onclick = ()=> {
                    if (prSize.options.selected !== sizeBtn) {
                        prSize.options.selected.classList.remove('selected');
                        prSize.options.selected = sizeBtn;
                        sizeBtn.classList.add('selected');
                        inputSize.value = size.t;
                        prBtn.infoSizes(size);
                    }
                };
            });
        }

        prBtn.setInfos = ()=> {
            inputPrName.value = p;
            var info = Produtos[p].info;
            var imgSrc = `${assets}Produtos/${p}-size.png`; 
            var boxInfo = document.querySelector('.accordion__content.rte');
            var popupInfo = document.querySelector('.product-popup-modal__content-info');
            if (boxInfo) {
                boxInfo.innerHTML = info;
            }
            if (popupInfo) {
                var img = new Image();
                img.onload = ()=> {
                    popupInfo.replaceChildren(img);
                };
                img.src = imgSrc;
            }
        }

        prBtn.addEventListener('click', ()=> {
            selectMenu(btn.box, prBtn, true, false);
            iniciar.produtos.forEach(pp => {
                if (p === pp) {
                    btn.classList.add(p);
                } else {
                    btn.classList.remove(pp);
                }
            });
            prBtn.color();
            prBtn.sizes();
            prBtn.setInfos();
            Object.keys(iniciar.add).forEach((item, index) => {
                var child = editLayer.base.getChildren()[index];
                setSideInfo(child, Produtos[p], item);
                child.print.getChildren().forEach(c => {
                    if (c.sizes) {
                        var s = c.sizes[i];
                        var scale = s.height / c.height();
                        c.setAttrs({
                            x: s.x !== undefined ? s.x : c.x(),
                            y: s.y !== undefined ? s.y : c.y(),
                            scale: {
                                x: scale,
                                y: scale
                            }
                        });
                    } else {
                        c.setAttrs({
                            ...child.print.size(),
                        });
                    }
                });
            });
        });

        if (i === 0) {
            btn.classList.add(p);
            btn.box.selected = prBtn;
            prBtn.classList.add('selected');
            prBtn.color();
            prBtn.sizes();
            prBtn.setInfos();
        }
        
    });
}

if (typeof colorMenu !== 'undefined' && Array.isArray(colorMenu)) {
    colorMenu.forEach((c, i) => {
        createMenuColor(mainMenuList, c.color, i + 1);
    });
}

Object.keys(iniciar.add).forEach((item, index) => {
    var prSide = newPrint();
    var print = prSide.print;
    var prColor = prSide.color;
    setSideInfo(prSide, Produtos[iniciar.produtos[0]], item);
    var rect = new Konva.Rect({
        ...print.size(),
        // stroke: 'red',
        // strokeWidth: 10,
    })
    print.add(rect);

    prSide.name = item;

    prSide.input = document.createElement('input');
    prSide.input.classList.add('hidden');
    prSide.input.setAttribute('type', 'file');
    prSide.input.setAttribute('form', `product-form-${sectionId}`);
    prSide.input.setAttribute('name', `properties[Preview ${item}]`);

    print.input = document.createElement('input');
    print.input.classList.add('hidden');
    print.input.setAttribute('type', 'file');
    print.input.setAttribute('form', `product-form-${sectionId}`);
    print.input.setAttribute('name', `properties[_hiddenPropertyName Estampa ${item}]`);
    
    document.body.append(prSide.input, print.input);

    let p = prSide;
    printList.push(p);

    let edit = document.createElement('div');
    edit.className = 'customBox';
    editList.push(edit);
    
    let btn = document.createElement('button');
    btn.textContent = item;
    btnAreaList.push(btn);
    btn.node = prSide;
    btn.color = prColor;
    popupBtnWrap.appendChild(btn);
    btn.addEventListener('click', () => {
        dragOff();
        stage.setAttrs({x:0, y:0, scale: {x:1, y:1}});
        function change() {
            btnAreaList.forEach((e, i) => {
                if (e === btn) {
                    e.classList.add('selected');
                    mainEdit.append(editList[i]);
                    e.node.show();
                    e.color.show();
                    printList.selected = e.node;
                } else {
                    e.classList.remove('selected');
                    editList[i].remove();
                    e.node.hide();
                    e.color.hide();
                }
            });
        }
        if (onShow == mainDesign) {
            toShow(mainDesign, change);
        } else {
            if (onShow == adjustBox) {
                toShow(previous);
                change();
            }
            else { change(); }
        }
    });
    
    if (index === 0) {
        mainEdit.append(edit);
        btn.classList.add('selected');
        p.show();
        prColor.show();
        printList.selected = p;
    } else { 
        p.hide();
        prColor.hide();
    }

    var sidePrint = iniciar.add[item];
    var design = new Konva.Group({
        id: sidePrint,
        ...sidePrint.attrs[0]
    });
    design.sizes = sidePrint.attrs;
    print.add(design);
    design.sub = undefined;
    
    sidePrint.add.forEach((e, i) => {
        var box = document.createElement('div');
        
        if (e.tittle) {
            var tittle = document.createElement('div');
            tittle.className = 'tittle';
            tittle.textContent = e.tittle;
            box.appendChild(tittle);
            box.tittle = tittle;
        }
        
        var group = design;

        if (e.group) {
            newGroup = new Konva.Group(e.group);
            group.add(newGroup);
            group = newGroup;
        }

        var width = group.width();
        var height = group.height();

        if (e.rect) {
            var rect = new Konva.Rect(e.rect);
            colorAnalize(rect);
            group.add(rect);
        }

        if (e.upload) {
            var upload = e.upload;
            var upBox = document.createElement('div');
            upBox.className = 'imageBox';
            box.appendChild(upBox);
            var input = document.createElement('input');
            input.className = 'inputHidden';
            input.type = 'file';
            input.accept = 'image/png, image/jpeg, image/webp';
            upBox.appendChild(input);
            
            var configBox = document.createElement('div');
            configBox.className = 'configBox hidden';

            var changeImg = document.createElement('button');
            changeImg.className =  'changeImg iconBox';
            changeImg.addEventListener('click', ()=> {
                input.click();
            });              
            changeImg.span = document.createElement('span');
            changeImg.span.textContent = 'Trocar imagem';
            changeImg.appendChild(changeImg.span);
            configBox.appendChild(changeImg);

            var callEditor = document.createElement('button');
            callEditor.className = 'callEditor iconBox';
            callEditor.addEventListener('click', ()=> {
                toShow(adjustBox, updateSets);
            });
            callEditor.span = document.createElement('span');
            callEditor.span.textContent = 'Editar';
            callEditor.appendChild(callEditor.span);
            configBox.appendChild(callEditor);

            if (upload.add) {
                var add = upload.add;
                var multi = add.length > 1;

                if (multi) {
                    upBox.classList.add('multi');
                    var boxPositions = document.createElement('div');
                    boxPositions.className = 'boxPositions';
                    boxPositions.style.aspectRatio = `${width}/${height}`;
                    var subBox = document.createElement('div');
                    boxPositions.append(subBox);
                    
                    for (let i = 0; i < add.length; i++) {
                        var position = document.createElement('div');
                        position.style = `
                            left: ${(add[i].x / width) * 100}%; 
                            top: ${(add[i].y / height) * 100}%; 
                            width: ${(add[i].width / width) * 100}%;
                            height: ${(add[i].height / height) * 100}%;
                            color: #${colorOrder[i]}
                        `;
                        subBox.appendChild(position);
                    }

                    upBox.appendChild(boxPositions);
                }

                var iconsBox = document.createElement('div');
                iconsBox.className = `iconsBox slider`;
                upBox.appendChild(iconsBox);

                add.forEach((e, i) => {
                    let div = document.createElement('button');

                    let imgIcon = document.createElement('div');
                    imgIcon.className = 'addImage';
                    imgIcon.onInput = true;
                    imgIcon.input = input;
                    imgIcon.parent = div;
                    imgIcon.configBox = configBox;
                    iconsList.push(imgIcon);
                    div.appendChild(imgIcon);

                    if (multi) {
                        let color = document.createElement('span');
                        color.style.color = `#${colorOrder[i]}`;
                        div.appendChild(color);
                    }

                    let konvaBox = new Konva.Group(e);
                    
                    konvaBox.setAttrs({
                        clip: konvaBox.size(),
                    });
                    
                    nodesBox.push(konvaBox);

                    group.add(konvaBox);
                    
                    imgIcon.onclick = ()=> {
                        onSelect(imgIcon, true);
                    }

                    imgIcon.nodeBox = konvaBox;

                    iconsBox.appendChild(div);
                });

            }

            upBox.appendChild(configBox);

            input.addEventListener('change', function() {
                loadOn();
                nodesBox.selected.destroyChildren();
                iconsList.selected.innerHTML = '';
                iconsList.selected.onInput = false;
                function start(url) {
                    var img = new Image();
                    img.onload = function () {
                        if (upload.type === 'svg') {
                            NewPotrace(img, nodesBox.selected, iconsList.selected, {...upload.attrs}, e.upload.process);
                        }
                        if (!upload.type) {
                            newUpload(img, nodesBox.selected, iconsList.selected, {...upload.attrs}, e.upload.process);
                        }
                    };
                    img.src = url;
                    input.value = '';
                }
                if (upload.cutBG == true) {
                    cutBG(input.files[0]).then(url => start(url));
                } else {
                    var reader = new FileReader();
                    reader.onload = ()=> {
                        start(reader.result);
                    }
                    reader.readAsDataURL(input.files[0]);
                }
            });
            
        }

        if (e.image) {
            var imageBox = new Konva.Group(e.image.attrs);
            group.add(imageBox);
            group.sub = imageBox;
            Konva.Image.fromURL(prAssets + e.image.url, function(image){
                image.cache();
                imageBox.add(image);
            });
        }

        if (e.text) {
            
            var att = e.text;
            var noEditAttrs = {...att.attrs.noEdit};
            var editAttrs = {...att.attrs.edit};
            var uppercase = e.text.onInput.uppercase;
            
            var input = document.createElement('textarea');
            input.setAttrs = (t)=> {
                Object.assign(t, {
                    placeholder: 'Escreva aqui...',
                    rows: 1,
                    cols: 5,
                });
                t.style.resize = 'none';
                uppercase ? t.style.textTransform =  'uppercase' : '';
                if (noEditAttrs.wrap !== 'char') {
                    t.addEventListener('keydown', function (e) {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                        }
                    });
                    t.wrap = 'off';
                }
            };
            input.setAttrs(input);
            
            var textGroup = new Konva.Group({
                typeGroup: 'Text',
                icon: input,
                input: input
            });
            group.add(textGroup);

            if (e.text.add) {
                e.text.add.forEach(e => {
                    var text = new Konva.Text({
                        ...e,
                        ...noEditAttrs,
                        ...editAttrs,
                        edit: Object.keys(editAttrs),
                        fillAfterStrokeEnabled: true,
                        moveable: true,
                    });
                    colorAnalize(text);
                    canSelect.push(text);
                    text.dragOn = textGroup;
                    textGroup.add(text);
                });
            }
            
            if (att.textClip == true) {
                textGroup.getChildren().forEach(child => {
                    var clone = new Konva.Text({
                        text: child.text(),
                        fontSize: child.fontSize(),
                        ...child.position(),
                        edit: ['text'],
                        listening: false,
                        globalCompositeOperation: 'destination-out'
                    });
                    child.setAttrs({
                        fill: 'transparent'
                    });
                    textGroup.add(clone);
                });
            }

            var children = textGroup.getChildren();

            textGroup.onSelect = ()=> {onSelect(textGroup)};
            input.node = textGroup;
            textGroup.input = input;

            var inputBox = document.createElement('div');
            inputBox.className = 'inputTextBox';
            input.configBox = document.createElement('div');
            
            var configBox = document.createElement('div');
            configBox.className = 'configBox';

            var selectText = document.createElement('button');
            selectText.className = 'findTarget';
            selectText.addEventListener('click', ()=> {
                onSelect(input, true);
            });
            selectText.span = document.createElement('span');
            selectText.span.textContent = 'Selecionar';
            selectText.appendChild(selectText.span);
            
            var callEditor = document.createElement('button');
            callEditor.className = 'callEditor';
            callEditor.addEventListener('click', ()=> {
                dragOn(textGroup);
                toShow(adjustBox, updateSets);
            });
            callEditor.span = document.createElement('span');
            callEditor.span.textContent = 'Editar';
            callEditor.appendChild(callEditor.span);

            if (uppercase === true) {
                children.forEach(node => {
                    node.text(node.text().toUpperCase());
                });
            }
            input.node = textGroup;
            input.parent = inputBox;
            
            input.onclick = ()=> {
                onSelect(input, true);
            }

            var onFunc = typeof att.onInput.func === 'function';
            input.oninput = (e)=> {
                var value = uppercase ? input.value.toUpperCase() : input.value;
                children.forEach(e=> {
                    e.setAttr('text', value);
                });
                textGroup.setAttrs(groupSize(textGroup));
                if (onFunc) {
                    att.onInput.func(e);
                }
            }
            
            if (e.text.onInput.align) {
                align(e.text.onInput.align, textGroup);
                textGroup.on('xChange yChange scaleChange', function() {
                    align(e.text.onInput.align);
                });
                children[0].on('fontSizeChange letterSpacingChange textChange', function() {
                    align(e.text.onInput.align);
                });
            }


            configBox.append(selectText, callEditor);
            inputBox.append(input, configBox);
            box.appendChild(inputBox);
        }

        if (e.clip) {
            // Konva.Image.fromURL(prAssets + e.clip, function(image){
            //     image.setAttrs({
            //         globalCompositeOperation: 'destination-in',
            //         listening: false,
            //     });
            //     group.add(image);
            //     image.cache();
            // });
            getPath(prAssets + e.clip).then(result => {
                imgPath(result.data, group, {globalCompositeOperation: 'destination-in' }, result.size);
            });
        }

        if (e.clipFunc) {
            getPath(prAssets + e.clipFunc).then(result => {
                setClip(result.data, group);
            });
        }

        if (e.mask) {
            var mask = e.mask;
            var maskTarget;
            maskTarget = new Konva.Group({
                ...group.size()
            });
            group.add(maskTarget);
            group.sub = maskTarget;
            if (mask.btn && mask.url) {return console.error(`Mask: Contém 'btn' e 'url'`)} else {
                if (mask.btn) {
                    var btn = mask.btn;
                    var maskBox = document.createElement('div');
                    maskBox.className = 'slider imgChooser';
                    btn.forEach((btn, i) => {
                        var button = document.createElement('button');
                        var img = new Image();
                        img.onload = () => {
                            var canvas = document.createElement('canvas');
                            var ctx = canvas.getContext('2d');
                            var scale = 1;
                            var maxHeight = 100;
                            var maxWidth = 150;
                            if (img.width > maxWidth || img.height > maxHeight) {
                                scale = Math.min(maxWidth / img.width, maxHeight / img.height);
                            }
                            canvas.width = img.width * scale;
                            canvas.height = img.height * scale;
                            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                            var btnImg = new Image();
                            btnImg.onload = () => {
                                button.append(btnImg);
                            };
                            btnImg.src = canvas.toDataURL();
                        };
                        img.crossOrigin = 'Anonymous';
                        img.src = prAssets + btn.url;
                        if (btn.img !== false) {
                            getPath(prAssets + btn.url).then(result => {
                                button.setImg = ()=> {
                                    imgPath(result.data, maskTarget, {...mask.attrs}, result.size); 
                                };
                                i === 0 && button.setImg();
                            });
                        }
                        if (btn.clip) {
                            button.setClip = (load = true)=> {
                                load && loadOn();
                                Konva.Image.fromURL(prAssets + btn.clip, function(image){
                                    image.setAttrs({
                                        globalCompositeOperation: 'destination-in',
                                        listening: false,
                                    });
                                    maskTarget.add(image);
                                    setTimeout(() => {
                                        image.cache();
                                        load && loadOff();
                                    }, 400);
                                });
                            };
                            i === 0 && button.setClip(false);
                        }
                        if (i === 0) {
                            button.classList.add('selected');
                            maskBox.selected = button;
                        }

                        button.onclick = ()=> {
                            if (button === maskBox.selected) {
                                return;
                            } else {
                                maskTarget.destroyChildren();
                                button.setImg && button.setImg();
                                button.setClip &&  button.setClip();
                                maskBox.selected.classList.remove('selected');
                                button.classList.add('selected');
                                maskBox.selected = button;
                            }
                        };
                        maskBox.append(button);
                    });
                    box.append(maskBox);
                }
                if (mask.url) {
                    getPath(prAssets + mask.url).then(result => {
                        imgPath(result.data, maskTarget, {...mask.attrs}, result.size);
                    });
                }
            }
        }

        if (e.vsChange) {
            var container = document.createElement('div');
            container.className = 'chooseBox';
            var target = group.sub ? group.sub : group;
            var boxList = Array.from(box.children);
            var choose = (v) => {
                if (v === true) {
                    boxList.forEach(c => {
                        if (c !== container && c !== box.tittle) {
                            c.classList.remove('hidden');
                        }
                    });
                    target.show();
                } else if (v === false) {
                    boxList.forEach(c => {
                        if (c !== container && c !== box.tittle) {
                            c.classList.add('hidden');
                        }
                    });
                    target.hide();
                }
            }
            e.vsChange.forEach((option, i) => {
                var btn = document.createElement('button');
                btn.textContent = option.text;
                if (i === 0) {
                    btn.classList.add('selected');
                    container.selected = btn;
                    choose(option.vs);
                }
                btn.onclick = ()=> {
                    if (container.selected !== btn) {
                        choose(option.vs);
                        container.selected.classList.remove('selected');
                        container.selected = btn;
                        btn.classList.add('selected');
                    }
                }
                container.append(btn);
            });
            box.append(container);
        }
        box.childElementCount > 0 ? edit.appendChild(box) : '';
    });
});

setTimeout(() => {
    setPreviews();
}, 4000);