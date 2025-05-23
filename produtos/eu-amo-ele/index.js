var colorMenu = [
    {
        color: '#f7dbeb',
    },
    {
        color: '#c36599',
    },
];

var iniciar = {
    produtos: ['Camiseta', 'BabyLook', 'Cropped', 'Ecobag'],
    add: {
        Frente: {
            attrs: [
                {x: 138, y: 56, width: 598, height: 591},
                {x: 128, y: 42, width: 540, height: 531},
                {x: 125, y: 11, width: 514, height: 508},
                {x: 230, y: 88, width: 720, height: 708},
            ],
            add: [
                {
                    mask: {
                        url: 'back-fill.svg',
                        attrs: {
                            jsColor: [
                                { attrs: ['fill'], id: 1 },
                            ],
                        },
                    },
                },
                {
                    mask: {
                        url: 'back-border.svg',
                        attrs: {
                            jsColor: [
                                { attrs: ['fill'], id: 2 },
                            ],
                        },
                    },
                },
                {
                    group: {x: 128, y: 129, width: 345, height: 341},
                    tittle: 'Foto',
                    upload: {
                        type: 'svg',
                        attrs: {
                            noEdit: {
                                jsColor: [
                                    { attrs: ['color', 'borderColor'], id: 2 },
                                ],
                            },
                            edit: {
                                borderWidth: 20,
                            }
                        },
                        add: [
                            {width: 345, height: 346},
                        ]
                    },
                    clipFunc: 'mask.svg',
                },
                {
                    mask: {
                        url: 'front-fill.svg',
                        attrs: {
                            jsColor: [
                                { attrs: ['fill'], id: 1 },
                            ],
                        },
                    },
                },
                {
                    mask: {
                        url: 'front-border.svg',
                        attrs: {
                            jsColor: [
                                { attrs: ['fill'], id: 2 },
                            ],
                        },
                    },
                },
            ]
        },
    }
};
