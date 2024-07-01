// const Joi = require('joi');
import Joi from 'joi';

const schema = Joi.object({
    expired_at: Joi.date()
        .required()
        .greater(new Date())
        .messages({
            'date.base': `expired_at should be a type of 'text'`,
            'date.greater':`expired_at must more than today`,
            'date.empty': `expired_at cannot be an empty field`,
            'any.required': `expired_at is a required field`
          }),

    user_id: Joi.string()
        .min(3)
        .max(30)
        .required()
        .messages({
            'string.base': `password should be a type of 'text'`,
            'string.empty': `password cannot be an empty field`,
            'string.pattern.base': `password must be have a 3 - 30 of length`,
            'any.required': `password is a required field`
          }),
})
export default schema