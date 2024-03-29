'use strict'

const ProductService = require("../services/product.service")
const { SuccessResponse } = require('../core/success.response')

class ProductController{

    createProduct = async(req,res,next)=>{
        new SuccessResponse({
            message: 'Create new product success!',
            metadata: await ProductService.createProduct(req.body.product_type, {
                ...req.body,
                product_shop: req.user.userId
            })
        }).send(res)
    }

    updateProduct = async(req,res,next)=>{
        new SuccessResponse({
            message: 'Update new product success!',
            metadata: await ProductService.updateProduct(req.body.product_type, req.params.productId, {
                ...req.body,
                product_shop: req.user.userId
            })
        }).send(res)
    }

    pubishProductByShop = async(req,res,next)=>{
        new SuccessResponse({
            message: 'Pubish new product success!',
            metadata: await ProductService.publishProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId
            })
        }).send(res)
    }

    unPubishProductByShop = async(req,res,next)=>{
        new SuccessResponse({
            message: 'Undo pubish product success!',
            metadata: await ProductService.unPublishProductByShop({
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
            metadata: await ProductService.findAllDraftsForShop({
                product_shop:req.user.userId
            })
        }).send(res)
    }
    getAllPublishForShop = async(req,res,next)=>{
        new SuccessResponse({
            message: 'Get list Pubish success',
            metadata: await ProductService.findAllPublishForShop({
                product_shop:req.user.userId
            })
        }).send(res)
    }

    getListSearchProduct = async(req,res,next)=>{
        new SuccessResponse({
            message: 'Search Product success',
            metadata: await ProductService.getListSearchProduct(req.params)
        }).send(res)
    }

    findAllProducts = async(req,res,next)=>{
        new SuccessResponse({
            message: 'Search All Products success',
            metadata: await ProductService.findAllProducts(req.query)
        }).send(res)
    }

    findProduct = async(req,res,next)=>{
        new SuccessResponse({
            message: 'Search All Products success',
            metadata: await ProductService.findProduct({
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