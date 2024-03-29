'use strict'
const { findCartById } = require('../models/repository/cart.repo')
const { BadRequestError, NotFoundError } = require("../core/error.response");
const { checkProductByServer } = require('../models/repository/product.repo');
const { getDiscountAmount } = require('./discount.service');
const { acquireLock, releaseLock } = require('./redis.service');
const order = require('../models/order.model')


class CheckoutService{
    static async checkoutReview({ cartId, userId, shop_order_ids = []}){
        //check cart id existed?
        const foundCart = await findCartById(cartId);
        if(!foundCart) throw new BadRequestError('Cart does not existed!!')
        const checkout_order = {
            totalPrice:0,
            feeShip:0,
            totalDiscount:0,
            totalCheckout:0
        },shop_order_ids_new = []

        //total bill fee
        for(let i = 0; i < shop_order_ids.length; i++){
            const {shopId, shop_discounts = [], item_products = []} = shop_order_ids[i]
            /**
             * check product available
             * it return price, quantity and productId
            */
            const checkProductServer = await checkProductByServer(item_products)
            if(!checkProductServer[0]) throw new BadRequestError('order wrong !!!')

            //total fee order
            const checkoutPrice = checkProductServer.reduce((accumulate, product)=>{
                return accumulate +(product.quantity * product.price)
            },0)

            /**
             * total money before processing
             * assign checkout_order.totalPrice and cast to number
             * var str = "123";
             * var num = +str;
            */
            checkout_order.totalPrice =+ checkoutPrice

            //púh to new shop_orders_ids_new
            const itemCheckout = {
                shopId,
                shop_discounts,
                priceRaw: checkoutPrice,
                priceApplyDiscount:checkoutPrice,
                item_products:checkProductServer
            }

            //if shop_discounts > 0, check wheather valid
            if (shop_discounts.length > 0){
                //assum we only have 1 discount
                const { totalPrice = 0, discount = 0} = await getDiscountAmount({
                    codeId:shop_discounts[0].codeId,
                    userId,
                    shopId,
                    products: checkProductServer
                })
                //total discount amout
                checkout_order.totalDiscount += discount

                //if discount greater than zero
                if(discount>0){
                    itemCheckout.priceApplyDiscount = checkoutPrice - discount
                }
            }
            //total final fee
            checkout_order.totalCheckout += itemCheckout.priceApplyDiscount
            shop_order_ids_new.push(itemCheckout)
        }
        return{
            shop_order_ids,
            shop_order_ids_new,
            checkout_order
        }
    }
    
    static async orderByUser({shop_order_ids, cartId, userId, user_address = {}, user_payment = {} }){
        const { shop_order_ids_new, checkout_order} = await CheckoutService.checkoutReview({
            cartId,
            userId,
            shop_order_ids:shop_order_ids_new
        })
        const products = shop_order_ids_new.flatMap(order => order.item_products);
        console.log(`[1]`, products)
        const accquireProduct = []
        
        for(let i = 0; i < products.length; i++){
            const { productId, quantity } = products[i];
            const keyLock = await acquireLock(productId, quantity, cartId);
            accquireProduct.push( keyLock ? true : false)
            if(keyLock){
                await releaseLock(keyLock)
            }
        }

        //check
        if(accquireProduct.includes(false)){
            throw new BadRequestError('some product has been updated')
        }

        const newOrder = await order.create({
            order_userId: userId,
            order_checkout: checkout_order,
            order_shipping:user_address,
            order_payment:user_payment,
            order_products:shop_order_ids_new
        })

        //if insert success, remove product inside cart
        if(newOrder) 
        return newOrder
    }

    static async getOrdersByUser(){

    }

    static async getOneOrdersByUser(){
        
    }

    static async cancelOrderByUser(){
        
    }

    static async updateOrdersByUser(){
        
    }
}

module.exports = CheckoutService