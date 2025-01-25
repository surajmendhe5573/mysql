const express = require('express');
const { register, login, fetchAllUsers } = require('../controllers/user.controller');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/', fetchAllUsers);

module.exports = router;
