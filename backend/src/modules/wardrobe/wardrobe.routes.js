const router =
    require('express')
        .Router();

const controller =
    require(
        './wardrobe.controller'
    );

const authMiddleware =
    require(
        '../../middleware/auth.middleware'
    );

const upload =
    require(
        '../../middleware/upload.middleware'
    );

router.post(

    '/upload',

    authMiddleware,

    upload.single(
        'image'
    ),

    controller.upload
);

const validate =
    require(
        '../../middleware/validate.middleware'
    );

const {
    updateItemSchema
} = require(
    './wardrobe.validation'
);

router.patch(

    '/:id',

    authMiddleware,

    validate(
        updateItemSchema
    ),

    controller.updateItem

);
router.get('/', authMiddleware, controller.getMyItems);
router.get('/:id', authMiddleware, controller.getItem);
module.exports =
    router;