const { check } = require('express-validator');

const userValidators = [
    check('firstname')
        .exists({ checkFalsy: true })
        .withMessage('First Name is required')
        .isAlpha("en-US", { ignore: " " })
        .withMessage('First Name is in the wrong format.')
        .escape(),
    check('lastname')
        .exists({ checkFalsy: true })
        .withMessage('Last Name is required')
        .isAlpha("en-US", { ignore: " " })
        .withMessage('Last Name is in the wrong format.')
        .escape()
];

const messageValidators = [
    check('recipient')
        .exists({ checkFalsy: true })
        .withMessage('Recipient is required')
        // .normalizeEmail()
        .isEmail()
        .withMessage('Recipient must be a valid email address.')
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
