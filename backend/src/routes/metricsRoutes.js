const express = require('express');
const router = express.Router();
const metricsController = require('../controllers/metricsController');

router.get('/overview', (req, res) => metricsController.getOverview(req, res));

module.exports = router;
