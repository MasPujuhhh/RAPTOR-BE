// const Joi = require('joi');
import Joi from 'joi';

const schema = Joi.object({
    username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required()
        .messages({
            'string.base': `username should be a type of 'text'`,
            'string.alphanum':`username should be a type only 'text and number'`,
            'string.empty': `username cannot be an empty field`,
            'string.min': `username should have a minimum length of {#limit}`,
            'string.max': `username should have a maximum length of {#limit}`,
            'any.required': `username is a required field`
          }),

    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        .required()
        .messages({
            'string.base': `password should be a type of 'text'`,
            'string.empty': `password cannot be an empty field`,
            'string.pattern.base': `password must be have a 3 - 30 of length`,
            'any.required': `password is a required field`
          }),
})
export default schema