'use strict'

const ProductService = require("../services/product.service")
const ProductServiceV2 = require("../services/product.service.xxx")
const { SuccessResponse } = require('../core/success.response')

class ProductController{

    createProduct = async(req,res,next)=>{
        new SuccessResponse({
            message: 'Create new product success!',
            metadata: await ProductServiceV2.createProduct(req.body.product_type, {
                ...req.body,
                product_shop: req.user.userId
            })
        }).send(res)
    }

    updateProduct = async(req,res,next)=>{
        new SuccessResponse({
            message: 'Update new product success!',
            metadata: await ProductServiceV2.updateProduct(req.body.product_type, req.params.productId, {
                ...req.body,
                product_shop: req.user.userId
            })
        }).send(res)
    }

    pubishProductByShop = async(req,res,next)=>{
        new SuccessResponse({
            message: 'Pubish new product success!',
            metadata: await ProductServiceV2.publishProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId
            })
        }).send(res)
    }

    unPubishProductByShop = async(req,res,next)=>{
        new SuccessResponse({
            message: 'Undo pubish product success!',
            metadata: await ProductServiceV2.unPublishProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId
            })
        }).send(res)
    }
        
    //query 
    /**
     * @description Get all Draft for shop
     * @param {Number} limit 
     * @param {Number} skip
     * @return {JSON} 
     * 
     */
    getAllDraftForShop = async(req,res,next)=>{
        new SuccessResponse({
            message: 'Get list Draft success',
            metadata: await ProductServiceV2.findAllDraftsForShop({
                product_shop:req.user.userId
            })
        }).send(res)
    }
    getAllPublishForShop = async(req,res,next)=>{
        new SuccessResponse({
            message: 'Get list Pubish success',
            metadata: await ProductServiceV2.findAllPublishForShop({
                product_shop:req.user.userId
            })
        }).send(res)
    }

    getListSearchProduct = async(req,res,next)=>{
        new SuccessResponse({
            message: 'Search Product success',
            metadata: await ProductServiceV2.getListSearchProduct(req.params)
        }).send(res)
    }

    findAllProducts = async(req,res,next)=>{
        new SuccessResponse({
            message: 'Search All Products success',
            metadata: await ProductServiceV2.findAllProducts(req.query)
        }).send(res)
    }

    findProduct = async(req,res,next)=>{
        new SuccessResponse({
            message: 'Search All Products success',
            metadata: await ProductServiceV2.findProduct({
                product_id:req.params.product_id
            })
        }).send(res)
    }
    //end query
}

/**
 * return instance of controller
 * export singleton instance and share across application
 * 
 **/
module.exports = new ProductController()