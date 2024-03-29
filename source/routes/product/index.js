'use strict'

const express = require('express');
const productController = require('../../controllers/product.controller');
const { asyncHandler } = require('../../helper/asyncHandler');
const { authentication } = require('../../auth/authUtils');
const router = express.Router();

router.get('/search/:keySearch',asyncHandler(productController.getListSearchProduct))
router.get('',asyncHandler(productController.findAllProducts))
router.get('/:product_id',asyncHandler(productController.findProduct))


/* Authentication*/
router.use(authentication)

///////

router.patch('/:productId',asyncHandler(productController.updateProduct));
router.post('',asyncHandler(productController.createProduct));
router.post('/pubish/:id',asyncHandler(productController.pubishProductByShop));
router.post('/unpubish/:id',asyncHandler(productController.unPubishProductByShop));


//query
router.get('/drafts/all',asyncHandler(productController.getAllDraftForShop));
router.get('/pubished/all',asyncHandler(productController.getAllPublishForShop));

module.exports = router