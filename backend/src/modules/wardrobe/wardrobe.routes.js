const router = require('express').Router();
const controller = require('./wardrobe.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const upload = require('../../middleware/upload.middleware');
const validate = require('../../middleware/validate.middleware');
const { updateItemSchema } = require('./wardrobe.validation');

router.post(
  '/upload',
  authMiddleware,
  upload.single('image'),
  controller.upload
);

router.post(
  '/analyze',
  authMiddleware,
  upload.single('image'),
  controller.analyze
);

router.patch(
  '/:id',
  authMiddleware,
  validate(updateItemSchema),
  controller.updateItem
);

router.get('/', authMiddleware, controller.getMyItems);
router.get('/:id', authMiddleware, controller.getItem);
router.delete('/:id', authMiddleware, controller.deleteItem);

module.exports = router;