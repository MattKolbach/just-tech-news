const router = require('express').Router();
const homeroutes = require('./home-routes');

const apiRoutes = require('./api');

router.use('/api', apiRoutes);
router.use('/', homeroutes);

router.use((req, res) => {
  res.status(404).end();
});

module.exports = router;
