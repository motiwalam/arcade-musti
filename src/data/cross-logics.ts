import { Games } from "../types";

export const crosslogics: Games['crosslogic'][] = [
    {
        sets: [
            ['Name', ['Adam', 'Anna', 'Clint', 'Emily']],
            ['Surname', ['Parish', 'May', 'Stephens', 'York']],
            ['Age', ['23', '25', '27', '31']],
            ['Gift', ['Electric scooter', 'Grill', 'Pinata', 'Giant cake']]
        ],

        solution: [
            ['Adam', 'York', '25', 'Grill'],
            ['Anna', 'Stephens', '27', 'Electric scooter'],
            ['Clint', 'May', '31', 'Giant cake'],
            ['Emily', 'Parish', '23', 'Pinata']
        ],

        story: 'Four birthdays in one day',
        clues: [
            'Clint is the oldest in this company, and he did not get a grill or an electric scooter',
            "Anna's surname is not Parrish",
            'The surname of Adam is York',
            'The person who turned 25 is not May, and he got a grill as a birthday present',
            'Parrish the youngest of all and got a pinata as a present',
            'York and Stephens are the surnames of Adam and a person aged 27'
        ]
    },
    {
        sets: [
            ['Name', ['Chowder', 'Agave', 'Peanut', 'Tiny', 'Toto']],
            ['At first', ['Green', 'Blue', 'Red', 'Yellow', 'Violet']],
            ['Then became', ['Green', 'Blue', 'Red', 'Yellow', 'Violet']],
            ['At last', ['Green', 'Blue', 'Red', 'Yellow', 'Violet']],
        ],
        solution: [
            ['Chowder', 'Red', 'Blue', 'Blue'],
            ['Agave', 'Green', 'Yellow', 'Red'],
            ['Peanut', 'Blue', 'Red', 'Violet'],
            ['Tiny', 'Violet', 'Green', 'Green'],
            ['Toto', 'Yellow', 'Violet', 'Yellow']
        ],
        clues: [
            'Peanut was blue at first, but then became non-blue. The last color of Peanut was violet',
            'Agave was green at first, but not blue in the end',
            'The violet chameleon became green but not blue or red afterwards',
            'The yellow chameleon did not change its color to blue in the middle',
            'Tiny, Peanut, and Agave were violet and blue at first, and the third was yellow in the middle',
            'Toto was violet in the middle and yellow at the end',
            'The violet and green chameleons did not swap their color to blue at the end',
            'Chowder was red at first'
        ],
        story: 'Chameleons colors'
    },
    {
        sets: [
            ['Name', ['Christine', 'Bob', 'Irene', 'Steven', 'Eileen']],
            ['Location', ['Mountain', 'River', 'Forest', 'Lake', 'Cliff']],
            ['Month', ['March', 'April', 'May', 'June', 'July']],
            ['How long (days)', ['1', '2', '3', '4', '5']]
        ],
        solution: [
            ['Christine', 'Lake', 'April', '4'],
            ['Bob', 'River', 'July', '1'],
            ['Irene', 'Cliff', 'March', '5'],
            ['Steven', 'Mountain', 'June', '3'],
            ['Eileen', 'Forest', 'May', '2']
        ],
        story: 'Hike',
        clues: [
            "Bob is planning his hike for just one day in July",
            "The hike on the mountain should take 3 days",
            "The lake trip is not planned for either March or May",
            "Eileen does not like long trips, so she is thinking about a day or two",
            "Christine will be busy with a new project all March",
            "Steven had already applied for some days off in June",
            "Irene will take the longest hike, but it's not in a forest",
            "Eileen and the people who will take hikes to the river and to the mountains are planning to do it in May, June, and July"
        ]
    },
    {
        story: 'Herbalists',

        sets: [
            ["Name", ["Antonius", "Domingo", "Flavian", "Horacio", "Lucius"]],
            ["Herbs", ["Mandrake root", "Cinquefoil", "Rosemary", "Juniper berries", "Mistletoe"]],
            ["Moon phase", ["New", "First quarter", "Full", "Third quarter", "Waning crescent"]],
            ["Amount", ["A bit", "Some", "Standard", "A lot", "Pile"]]
        ],

        solution: [
            ['Antonius', 'Mandrake root', 'Third quarter', 'Standard'],
            ['Domingo', 'Cinquefoil', 'Waning crescent', 'Some'],
            ['Flavian', 'Juniper berries', 'First quarter', 'A lot'],
            ['Horacio', 'Mistletoe', 'Full', 'A bit'],
            ['Lucius', 'Rosemary', 'New', 'Pile']
        ],

        clues: [
            "Mandrake root was collected in a standard amount in the third quarter",
            "Rosemary was collected on a new moon in the maximum possible amount, but not by Domingo",
            "Antonius and Horacio were working on either a full moon or the third quarter",
            "The juniper berries were collected on the moon's first quarter by Flavian",
            "No one was collecting mistletoe on two last phases of the moon",
            "Horacio harvested the smallest possible amount of herbs on a full moon",
            "Three herbalists - the one who collected only some herbs, another who collected Mandrake root, and Flavian - were working on first and third quarters of the moon, and also on the waning crescent"
        ]
    },
]