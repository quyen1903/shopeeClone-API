'use strict'

const CheckoutService = require('../services/checkout.service');
const { SuccessResponse } = require('../core/success.response');

class CheckoutController{

    checkoutReview = async function(req,res,next){
        new SuccessResponse({
            message:'checkout review Success',
            metadata: await CheckoutService.checkoutReview(req.body)
        }).send(res)

        console.log(req)
    }

}


module.exports = new CheckoutController()