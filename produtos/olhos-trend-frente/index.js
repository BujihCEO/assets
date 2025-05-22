var colorMenu = [
    {
        color: '#e65a8f',
    },
];

var iniciar = {
    produtos: ['Camiseta'],
    add: {
        Frente: {
            attrs: [
                {x: 64, y: 40, width: 750, height: 1015},
            ],
            add: [
                {
                    tittle: 'Fotos',
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
                            {width: 750, height: 250},
                            {y: 255, width: 750, height: 250},
                            {y: 510, width: 750, height: 250},
                            {y: 765, width: 750, height: 250}
                        ]
                    },
                },
            ]
        },
    }
};
