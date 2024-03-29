'use strict'

const CartService = require('../services/cart.service');
const { SuccessResponse } = require('../core/success.response');

class CartController{

    addToCart = async function(req,res,next){
        new SuccessResponse({
            message:'Create new Cart Success',
            metadata: await CartService.addToCart(req.body)
        }).send(res)

        console.log(req)
    }

    update = async function(req,res,next){
        new SuccessResponse({
            message:'update Cart Success',
            metadata: await CartService.addToCartV2(req.body)
        }).send(res)
    }

    delete = async function(req,res,next){
        new SuccessResponse({
            message:'delete Cart Success',
            metadata: await CartService.deleteUserCart(req.body)
        }).send(res)
    }
    
    listToCart = async function(req,res,next){
        new SuccessResponse({
            message:'Get list Cart Success',
            metadata: await CartService.getListUserCart(req.query)
        }).send(res)
    }
}


module.exports = new CartController()