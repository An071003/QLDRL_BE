// routers/campaignRoutes.js
const express = require('express');
const CampaignController = require('../controllers/campaignController');
const { authenticateUser, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', authenticateUser, authorizeRoles('admin'), CampaignController.getAllCampaigns);
router.get('/:id', authenticateUser, authorizeRoles('admin'), CampaignController.getCampaignById);
router.post('/', authenticateUser, authorizeRoles('admin'), CampaignController.createCampaign);
router.put('/:id', authenticateUser, authorizeRoles('admin'), CampaignController.updateCampaign);
router.delete('/:id', authenticateUser, authorizeRoles('admin'), CampaignController.deleteCampaign);
router.post('/import', authenticateUser, authorizeRoles('admin'), CampaignController.importCampaigns);

module.exports = router;
