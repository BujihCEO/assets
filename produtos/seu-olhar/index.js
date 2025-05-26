var colorMenu = [
    {
        color: '#4F937D',
    },
];

var iniciar = {
    produtos: ['Camiseta'],
    add: {
        Costa: {
            attrs: [
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
                    tittle: 'Foto',
                    upload: {
                        type: 'svg',
                        attrs: {
                            noEdit: {
                                jsColor: [
                                    { attrs: ['color'], id: 1 },
                                ],
                            },
                        },
                        add: [
                            {width: 828, height: 290, x: 12, y: 326},
                        ]
                    },
                },
                {
                    group: {width: 754, height: 46, x: 49, y: 640},
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
