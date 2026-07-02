const express = require('express');
const router = express.Router();

const pauthRoutes = require('../../../apps/backend/routes/Pauth');
const playerRoutes = require('../../../apps/backend/routes/player');
const playersAdminRoutes = require('../../../apps/backend/routes/players-admin');

router.use(pauthRoutes);
router.use(playerRoutes);
router.use(playersAdminRoutes);

module.exports = router;
