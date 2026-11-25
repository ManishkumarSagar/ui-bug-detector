const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/bugController');

router.use(auth);
router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.patch('/:id', ctrl.updateStatus);

module.exports = router;