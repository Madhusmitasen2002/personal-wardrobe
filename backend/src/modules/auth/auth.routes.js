const router = require('express').Router();
const controller = require('./auth.controller');
const validate = require('../../middleware/validate.middleware');
const { registerSchema, loginSchema } = require('./auth.validation');
const authMiddleware = require('../../middleware/auth.middleware');
const upload = require('../../middleware/upload.middleware');

router.post(
  '/register',
  validate(registerSchema),
  controller.register
);

router.post(
  '/login',
  validate(loginSchema),
  controller.login
);

router.get('/me', authMiddleware, controller.getMe);
router.patch('/profile', authMiddleware, controller.updateProfile);
router.patch('/avatar', authMiddleware, controller.updateAvatar);
router.post('/avatar/photo', authMiddleware, upload.single('photo'), controller.uploadAvatarPhoto);
router.post('/feedback', authMiddleware, controller.recordFeedback);

module.exports = router;