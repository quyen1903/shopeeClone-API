'use strict'

const express = require('express');
const commentController = require('../../controllers/comment.controller');
const { asyncHandler } = require('../../helper/asyncHandler');
const { authentication } = require('../../auth/authUtils');
const router = express.Router();


/* Authentication*/
router.use(authentication)

///////

router.post('',asyncHandler(commentController.createComment));
router.delete('',asyncHandler(commentController.deleteComment));
router.get('',asyncHandler(commentController.getCommentsByParentId));
//query

module.exports = router