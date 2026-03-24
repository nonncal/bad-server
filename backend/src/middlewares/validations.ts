import { Joi, celebrate } from 'celebrate'
import { Types } from 'mongoose'

export const phoneRegExp = /^\+?[0-9()\s-]+$/

export const isValidPhone = (value: string) => {
    if (typeof value !== 'string') {
        return false
    }

    if (value.length < 6 || value.length > 20) {
        return false
    }

    if (!phoneRegExp.test(value)) {
        return false
    }

    const digitsOnly = value.replace(/\D/g, '')

    return digitsOnly.length >= 6 && digitsOnly.length <= 15
}

export enum PaymentType {
    Card = 'card',
    Online = 'online',
}

export const validateOrderBody = celebrate({
    body: Joi.object().keys({
        items: Joi.array()
            .items(
                Joi.string().custom((value, helpers) => {
                    if (Types.ObjectId.isValid(value)) {
                        return value
                    }
                    return helpers.message({ custom: 'Невалидный id' })
                })
            )
            .messages({
                'array.empty': 'Не указаны товары',
            }),
        payment: Joi.string()
            .valid(...Object.values(PaymentType))
            .required()
            .messages({
                'string.valid':
                    'Указано не валидное значение для способа оплаты, возможные значения - "card", "online"',
                'string.empty': 'Не указан способ оплаты',
            }),
        email: Joi.string().email().max(30).required().messages({
            'string.empty': 'Не указан email',
        }),
        phone: Joi.string()
            .required()
            .custom((value, helpers) => {
                if (isValidPhone(value)) {
                    return value
                }

                return helpers.message({ custom: 'Номер телефона указан неверно' })
            })
            .messages({
                'string.empty': 'Не указан телефон',
            }),
        address: Joi.string().required().messages({
            'string.empty': 'Не указан адрес',
        }),
        total: Joi.number().required().messages({
            'string.empty': 'Не указана сумма заказа',
        }),
        comment: Joi.string().optional().allow(''),
    }),
})

// валидация товара.
// name и link - обязательные поля, name - от 2 до 30 символов, link - валидный url
export const validateProductBody = celebrate({
    body: Joi.object().keys({
        title: Joi.string().required().min(2).max(30).messages({
            'string.min': 'Минимальная длина поля "name" - 2',
            'string.max': 'Максимальная длина поля "name" - 30',
            'string.empty': 'Поле "title" должно быть заполнено',
        }),
        image: Joi.object().keys({
            fileName: Joi.string().required(),
            originalName: Joi.string().required(),
        }),
        category: Joi.string().required().messages({
            'string.empty': 'Поле "category" должно быть заполнено',
        }),
        description: Joi.string().required().messages({
            'string.empty': 'Поле "description" должно быть заполнено',
        }),
        price: Joi.number().allow(null),
    }),
})

export const validateProductUpdateBody = celebrate({
    body: Joi.object().keys({
        title: Joi.string().min(2).max(30).messages({
            'string.min': 'Минимальная длина поля "name" - 2',
            'string.max': 'Максимальная длина поля "name" - 30',
        }),
        image: Joi.object().keys({
            fileName: Joi.string().required(),
            originalName: Joi.string().required(),
        }),
        category: Joi.string(),
        description: Joi.string(),
        price: Joi.number().allow(null),
    }),
})

export const validateObjId = celebrate({
    params: Joi.object().keys({
        productId: Joi.string()
            .required()
            .custom((value, helpers) => {
                if (Types.ObjectId.isValid(value)) {
                    return value
                }
                return helpers.message({ any: 'Невалидный id' })
            }),
    }),
})

export const validateUserBody = celebrate({
    body: Joi.object().keys({
        name: Joi.string().min(2).max(30).messages({
            'string.min': 'Минимальная длина поля "name" - 2',
            'string.max': 'Максимальная длина поля "name" - 30',
        }),
        password: Joi.string().min(6).required().messages({
            'string.empty': 'Поле "password" должно быть заполнено',
        }),
        email: Joi.string()
            .required()
            .email()
            .message('Поле "email" должно быть валидным email-адресом')
            .messages({
                'string.empty': 'Поле "email" должно быть заполнено',
            }),
    }),
})

export const validateAuthentication = celebrate({
    body: Joi.object().keys({
        email: Joi.string()
            .required()
            .email()
            .message('Поле "email" должно быть валидным email-адресом')
            .messages({
                'string.required': 'Поле "email" должно быть заполнено',
            }),
        password: Joi.string().required().messages({
            'string.empty': 'Поле "password" должно быть заполнено',
        }),
    }),
})

export const validateUserUpdateBody = celebrate({
    body: Joi.object({
        name: Joi.string().min(2).max(30).optional().messages({
            'string.min': 'Минимальная длина поля "name" - 2',
            'string.max': 'Максимальная длина поля "name" - 30',
        }),
        email: Joi.string()
            .email()
            .optional()
            .message('Поле "email" должно быть валидным email-адресом'),
        phone: Joi.string()
            .optional()
            .allow('')
            .custom((value, helpers) => {
                if (value === '' || isValidPhone(value)) {
                    return value
                }

                return helpers.message({ custom: 'Номер телефона указан неверно' })
            }),
    }).unknown(false),
})

export const validateCustomerUpdateBody = celebrate({
    body: Joi.object({
        name: Joi.string().min(2).max(30).optional().messages({
            'string.min': 'Минимальная длина поля "name" - 2',
            'string.max': 'Максимальная длина поля "name" - 30',
        }),
        email: Joi.string()
            .email()
            .optional()
            .message('Поле "email" должно быть валидным email-адресом'),
        phone: Joi.string()
            .optional()
            .allow('')
            .custom((value, helpers) => {
                if (value === '' || isValidPhone(value)) {
                    return value
                }

                return helpers.message({ custom: 'Номер телефона указан неверно' })
            }),
        roles: Joi.array()
            .items(Joi.string().valid('customer', 'admin'))
            .optional(),
    }).unknown(false),
})

export const validateOrderStatusBody = celebrate({
    body: Joi.object({
        status: Joi.string()
            .valid('new', 'delivering', 'completed', 'cancelled')
            .required(),
    }).unknown(false),
})

export const validateCustomerQuery = celebrate({
    query: Joi.object({
        page: Joi.number().integer().min(1).max(100),
        limit: Joi.number().integer().min(1),
        sortField: Joi.string().valid('createdAt', 'totalAmount', 'orderCount', 'lastOrderDate'),
        sortOrder: Joi.string().valid('asc', 'desc'),
        search: Joi.string(),
        registrationDateFrom: Joi.date().iso().optional(),
        registrationDateTo: Joi.date().iso().optional(),
        lastOrderDateFrom: Joi.date().iso().optional(),
        lastOrderDateTo: Joi.date().iso().optional(),
        totalAmountFrom: Joi.number().optional(),
        totalAmountTo: Joi.number().optional(),
        orderCountFrom: Joi.number().optional(),
        orderCountTo: Joi.number().optional(),
    }).unknown(false)
})

export const validateOrderQuery = celebrate({
    query: Joi.object({
        page: Joi.number().integer().min(1).optional(),
        limit: Joi.number().integer().min(1).optional(),
        sortField: Joi.string().valid('createdAt', 'totalAmount', 'orderNumber', 'status').optional(),
        sortOrder: Joi.string().valid('asc', 'desc').optional(),
        search: Joi.string().max(100).optional(),
        status: Joi.string().valid('new', 'delivering', 'completed', 'cancelled').optional(),
        totalAmountFrom: Joi.number().optional(),
        totalAmountTo: Joi.number().optional(),
        orderDateFrom: Joi.date().iso().optional(),
        orderDateTo: Joi.date().iso().optional(),
    }).unknown(false)
});

export const validateUserOrderQuery = celebrate({
    query: Joi.object({
        page: Joi.number().integer().min(1).optional(),
        limit: Joi.number().integer().min(1).optional(),
        search: Joi.string().max(100).optional(),
    }).unknown(false)
});
