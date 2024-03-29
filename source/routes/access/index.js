'use strict'

const express = require('express');
const accessController = require('../../controllers/access.controller');
const { asyncHandler } = require('../../helper/asyncHandler');
const { authentication } = require('../../auth/authUtils');
const router = express.Router();


router.post('/shop/register',asyncHandler(accessController.register))
router.post('/shop/login',asyncHandler(accessController.login))

/* Authentication*/
router.use(authentication)

///////
router.post('/shop/logout',asyncHandler(accessController.logout))
router.post('/shop/handlerRefreshToken',asyncHandler(accessController.handlerRefreshToken))

module.exports = router