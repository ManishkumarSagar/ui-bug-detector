const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/scanController');

router.use(auth);
router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', ctrl.create);

module.exports = router;