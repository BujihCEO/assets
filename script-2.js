if (colorMenu) {
    colorMenu.forEach((c, i) => {
        createMenuColor(mainMenuList, c.color, i + 1);
    });
}

var editList = [];
var btnAreaList = [];
for (var [index, item] of iniciar.entries()) {
    if (item.node) {
        let a = item;
        let p = a.node;
        printList.push(p);
        let btn = document.createElement('button');
        let print = a.node.print;
        let rect = new Konva.Rect({...print.size()});
        print.add(rect);
        btn.textContent = p.name;
        btnAreaList.push(btn);
        popupBtnWrap.appendChild(btn);
        let edit = document.createElement('div');
        edit.className = 'customBox';
        editList.push(edit);
        mainEdit.appendChild(edit);
        btn.addEventListener('click', () => {
            dragOff();
            stage.setAttrs({x:0, y:0, scale: {x:1, y:1}});
            function change() {
                btnAreaList.forEach((e, i) => {
                    if (e === btn) {
                        e.classList.add('selected');
                        editList[i].classList.remove('hidden');
                        iniciar[i].node.show();
                    } else {
                        e.classList.remove('selected');
                        editList[i].classList.add('hidden');
                        iniciar[i].node.hide();
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

        previewList.push(p);

        if (index === 0) {
            btn.classList.add('selected');
            p.show();
        } else { 
            p.hide();
            edit.classList.add('hidden'); 
        }
        
        if (a.add) {
            a.add.forEach((e, i) => {
                var box = document.createElement('div');
                if (e.tittle) {
                    var tittle = document.createElement('div');
                    tittle.className = 'tittle';
                    tittle.textContent = e.tittle;
                    box.appendChild(tittle);
                }
                if (e.image) {
                    var att = e.image;
                    var group = new Konva.Group({
                        id: `${index + 1}-${i + 1}`
                    });
                    print.add(group);
                    setAttrs(group, att.position);
                    var width = group.width();
                    var height = group.height();

                    if (att.upload) {
                        var upload = att.upload;
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
                            iconsBox.className = `iconsBox slider ${multi? 'multi': ''}`;
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

                        if (upload.type === 'svg') {
                            input.addEventListener('change', function(event) {
                                NewPotrace(event, nodesBox.selected, iconsList.selected, {...upload.attrs});
                                iconsList.selected.onInput = false;
                            });
                        }
    
                        if (!upload.type) {
                            input.addEventListener('change', function(event) {
                                newUpload(event, nodesBox.selected, iconsList.selected, {...upload.attrs});
                                iconsList.selected.onInput = false;
                            });
                        }
                        
                    }

                    if (att.image) {
                        var imageBox = new Konva.Group(att.image.attrs);
                        group.add(imageBox);
                        Konva.Image.fromURL(att.image.url, function(image){
                            imageBox.add(image);
                        });
                    }

                    if (att.clip) {
                        var clip = att.clip;
                        if (clip.url) {
                            getPath(clip.url)
                                .then(pathdata => {
                                    setClip(pathdata, group, clip.rule ? clip.rule : 0);
                                });
                        }
                    }

                    if (att.mask) {
                        var mask = att.mask;
                        var maskTarget;
                        if (mask.box) {
                            maskTarget = new Konva.Group({
                                ...mask.box
                            });
                            group.add(maskTarget);
                        } else {maskTarget = group}
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
                                    img.src = btn.url;
                                    if (btn.img !== false) {
                                        getPath(btn.url)
                                        .then(pathdata => {
                                            button.setImg = ()=> { imgPath(pathdata, maskTarget, {...mask.attrs}) }
                                            i === 0 && button.setImg();
                                        });
                                    }
                                    if (btn.clip) {
                                        if (!btn.clip.url || !btn.clip.target) {return console.error('Sem url ou target')}
                                        else {
                                            getPath(btn.clip.url)
                                            .then(pathdata => {
                                                var targets = [];
                                                btn.clip.target.forEach(target => { targets.push(stage.findOne(`#${target}`)) });
                                                button.setClip = ()=> {
                                                    targets.forEach(target => {
                                                        setClip(pathdata, target, btn.clip.rule ? btn.clip.rule : 0);
                                                    });
                                                }
                                                i === 0 && button.setClip();
                                            });
                                        }
                                    }
                                    if (i === 0) {
                                        button.classList.add('selected');
                                        maskBox.selected = button;
                                    }

                                    button.onclick = ()=> {
                                        if (button === maskBox.selected) {
                                            return;
                                        } else {
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
                                getPath(mask.url)
                                    .then(pathdata => {
                                        imgPath(pathdata, maskTarget, {...mask.attrs});
                                    });
                            }
                        }
                    }
                    
                }
                if (e.text) {
                    var att = e.text;
                    var group = new Konva.Group({
                        id: `${index + 1}-${i + 1}`
                    });
                    print.add(group);
                    setAttrs(group, att.position);
                    var width = group.width();
                    var height = group.height();
                    let targets = [];
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

                    if (e.text.add) {
                        e.text.add.forEach(e => {
                            var text = new Konva.Text({
                                icon: input,
                                ...e,
                                ...noEditAttrs,
                                ...editAttrs,
                                edit: Object.keys(editAttrs),
                                fillAfterStrokeEnabled: true,
                                moveable: true,
                            });
                            canSelect.push(text);
                            colorAnalize(text, noEditAttrs);
                            group.add(text);
                            targets.push(text);
                            text.onSelect = ()=> {onSelect(text)};
                        });
                    }
                    targets[0].input = input;
                    targets.forEach(t => { t.dragOn = targets });

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
                        dragOn(targets);
                        toShow(adjustBox, updateSets);
                    });
                    callEditor.span = document.createElement('span');
                    callEditor.span.textContent = 'Editar';
                    callEditor.appendChild(callEditor.span);

                    if (uppercase === true) {
                        targets.forEach(node => {
                            node.text(node.text().toUpperCase());
                        });
                    }
                    input.node = targets;
                    input.parent = inputBox;
                    
                    input.onclick = ()=> {
                        onSelect(input, true);
                    }

                    input.oninput = (e)=> {
                        var value = uppercase === true ?
                        input.value.toUpperCase() : input.value;
                        targets.forEach(e=> {
                            e.setAttr('text', value);
                        });
                        if (typeof att.onInput.func === 'function') {
                            att.onInput.func(e);
                        }
                    }
                    
                    if (e.text.onInput.align) {
                        align(e.text.onInput.align, targets[0]);
                        targets[0].on('fontSizeChange letterSpacingChange textChange xChange yChange', function() {
                            align(e.text.onInput.align);
                        });
                    }

                    if (att.textClip) {
                        var clip = att.textClip;
                        textClip(clip.url, clip.target, targets, clip.height, clip.rule);
                    }

                    configBox.append(selectText, callEditor);
                    inputBox.append(input, configBox);
                    box.appendChild(inputBox);
                }
                box.childElementCount > 0 ? edit.appendChild(box) : '';
            });
        }

    }
}

setTimeout(() => {
    setPreviews();
}, 3000);