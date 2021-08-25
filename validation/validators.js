const { check } = require('express-validator');

const userValidators = [
    check('name')
        .exists({ checkFalsy: true })
        .withMessage('Name is required')
        .isAlpha("en-US", { ignore: " " })
        .withMessage('Name is in the wrong format.')
        .escape(),
    check('userID')
        .exists({ checkFalsy: true })
        .withMessage('User ID is required')
        .isAscii()
        .withMessage('User ID is in the wrong format.')
        .escape(),
    check('password')
        .exists({ checkFalsy: true })
        .withMessage('Password is required')
        .escape()
];

const messageValidators = [
    check('recipient')
        .exists({ checkFalsy: true })
        .withMessage('Recipient is required')
        .isAlpha("en-US", { ignore: " " })
        .withMessage('Recipient is in the wrong format.')
        .escape(),
    check('message')
        .exists({ checkFalsy: true })
        .withMessage('Message is required')
        .escape()
];

const ValidationErrorOutput = (arr) => {
    return arr.reduce((acc, curr) => {
        return acc + '<div class="cell large-12">' +
            `<p>${curr}</p>` +
            '</div>';
    }, '');
}

exports.userValidators = userValidators;
exports.messageValidators = messageValidators;
exports.ValidationErrorOutput = ValidationErrorOutput;
