const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController'); 
const { getUserIdFromToken } = require('../middleware/authorization');
const { submitDescription } = require('../controllers/descreptionController');
const {addEmergencyContact,updateEmergencyContact,deleteEmergencyContact} = require('../controllers/manageEmergencyContacts')

router.post('/distress', getUserIdFromToken,alertController.triggerDistressAlert);
router.post('/submit-description', getUserIdFromToken,submitDescription);
router.post('/add-emergencyContact', getUserIdFromToken,addEmergencyContact);
router.put('/update-contact', getUserIdFromToken,updateEmergencyContact);
router.put('/delete-contact', getUserIdFromToken,deleteEmergencyContact);
module.exports = router;





