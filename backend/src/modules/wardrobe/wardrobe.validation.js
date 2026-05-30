const z =
    require('zod');

const updateItemSchema =
    z.object({

        name:
            z.string()
                .min(1)
                .optional(),

        category:
            z.enum([
                'top',
                'bottom',
                'shoe'
            ])
                .optional()

    });

module.exports = {
    updateItemSchema
};