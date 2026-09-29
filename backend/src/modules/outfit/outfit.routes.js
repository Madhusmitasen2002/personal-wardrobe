const router = require('express').Router();
const controller = require('./outfit.controller');
const authMiddleware = require('../../middleware/auth.middleware');

router.use(authMiddleware);

router.post('/', controller.createOutfit);
router.post('/ai-stylist', controller.askAiStylist);
router.get('/', controller.getMyOutfits);
router.delete('/:id', controller.deleteOutfit);

module.exports = router;
