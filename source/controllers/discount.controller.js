
const DiscountService = require("../services/discount.service")
const { SuccessResponse } = require('../core/success.response')

class DiscountController{
    createDiscountCode = async(req,res,next)=>{
        new SuccessResponse({
            message:'Successfully generate code',
            metadata:await DiscountService.createDiscountCode({
                ...req.body,
                shopId:req.user.userId
            })
        }).send(res)
    }

    getAllDiscountCodes = async(req,res,next)=>{
        new SuccessResponse({
            message:'Successfully get all code',
            metadata:await DiscountService.getAllDiscountCodesByShop({
                ...req.query
            })
        }).send(res)
    }

    getDiscountAmount = async(req,res,next)=>{
        new SuccessResponse({
            message:'Successfully get Amount',
            metadata:await DiscountService.getDiscountAmount({
                ...req.body,
            })
        }).send(res)
    }

    getAllDiscountCodesWithProducts = async(req,res,next)=>{
        new SuccessResponse({
            message:'Successfully get all code with product',
            metadata:await DiscountService.getAllDiscountCodesWithProduct({
                ...req.query
            })
        }).send(res)
    }
}

module.exports =new DiscountController()