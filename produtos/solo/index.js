var colorMenu = [
    {
        color: '#000000',
    },
];

var iniciar = {
    produtos: ['Camiseta'],
    add: {
        Frente: {
            attrs: [
                {x: 0, y: 0, width: 877, height: 1240},
            ],
            add: [
                {
                    tittle: 'Foto',
                    upload: {
                        cutBG: true,
                        type: 'svg',
                        attrs: {
                            noEdit: {
                                jsColor: [
                                    { attrs: ['color', 'borderColor'], id: 1 },
                                ],
                            },
                            edit: {
                                borderWidth: 0,
                            }
                        },
                        add: [
                            {width: 877, height: 1240},
                        ]
                    },
                },
            ]
        },
    }
};
