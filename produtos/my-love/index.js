var colorMenu = [
    {
        color: '#e65a8f',
    },
];

var iniciar = {
    produtos: ['Camiseta'],
    add: {
        Costa: {
            attrs: [
                {x: 12, y: 16, width: 852, height: 978},
                {x: 12, y: 16, width: 852, height: 978},
                {x: 12, y: 16, width: 852, height: 978},
                {x: 12, y: 16, width: 852, height: 978},
            ],
            add: [
                {
                    tittle: 'Texto',
                    mask: {
                        btn: [
                            {
                                url: 'frase-1.svg',
                            },
                            {
                                url: 'frase-2.svg',
                            },
                            {
                                url: 'frase-3.svg',
                            },
                        ],
                        attrs: {
                            jsColor: [
                                { attrs: ['fill'], id: 1 },
                            ],
                        }
                    },
                },
                {
                    group: {width: 828, height: 582, x: 12, y: 326},
                    tittle: 'Foto',
                    upload: {
                        attrs: {
                            noEdit: {
                                jsColor: [
                                    { attrs: ['color'], id: 1 },
                                ],
                            },
                        },
                        add: [
                            {width: 276, height: 582},
                            {x: 276, width: 276, height: 582},
                            {x: 552, width: 276, height: 582},
                        ]
                    },
                },
                {
                    group: {width: 754, height: 46, x: 49, y: 932},
                    mask: {
                        url: 'bottom.svg',
                        attrs: {
                            jsColor: [
                                { attrs: ['fill'], id: 1 },
                            ],
                        }
                    },
                }
            ]
        },
    }
};
