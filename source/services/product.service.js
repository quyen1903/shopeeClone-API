'use strict'


const {BadRequestError} = require('../core/error.response');
const strategy = require('./product.strategy') 
const { 
    findAllDraftsForShop,
    publishProductByShop,
    findAllPublishForShop,
    unPublishProductByShop,
    searchProductByUser,
    findAllProducts,
    findProduct,
    updateProductById,
} = require('../models/repository/product.repo');

const { insertInventory } = require('../models/repository/inventory.repo')

const { removeUndefinedObject, updateNestedObjectParser } = require('../utils');

/*
    define factory class to create product
*/

console.log('this is strategy',strategy)
class ProductFactory {

    //store product type and their corresponding class references
    static productRegistry = {}//key or class

    /*
        registe product type along with corresponding class reference in productRegistry
        we can loop through product.config.js as strategy pattern to add more product type
    */
    static registerProductType(typesToRegister) {
        for (const [type, classRef] of Object.entries(strategy)) {
            if (typesToRegister.includes(type)) {
                ProductFactory.productRegistry[type] = classRef;
            }
        }
    }
    

    /*
        create product of special type
        retrieve class reference for specified product type from productRegistry
    */ 
    static async createProduct( type, payload ){
        const productClass = ProductFactory.productRegistry[type]//reference to productRegistry, not override value inside of it.
        if(!productClass) throw new BadRequestError(`Invalid Product Types ${type}`)
        return new productClass(payload).createProduct()//invoke createProduct() of instantiated class(clothing, electronic, furniture)
    }

    /*
        we update by patch, which means we only update neccessary field instead of
        entire resource like put
    */ 
    static async updateProduct(type, productId, payload){
        const productClass = ProductFactory.productRegistry[type]
        if(!productClass)throw new BadRequestError(`Invalid Product Types ${type}`)
        return new productClass(payload).updateProduct(productId)
    }

    //PUT
    static async publishProductByShop({product_shop, product_id}){
        return await publishProductByShop({product_shop, product_id})
    }

    static async unPublishProductByShop({product_shop, product_id}){
        return await unPublishProductByShop({product_shop, product_id})
    }
    //END PUT
    
    /** 
     * @param { limit = 50} return maximum is 50 nunmber
     * @param { skip = 0 } this means we now skip any item during retrieved
     * @param { sort='ctime' } orders items by time they was created.
     * @param { {keySearch} } just simply pass keysearch for full text search
     */
    static async findAllDraftsForShop({product_shop, limit = 50, skip = 0}){
        const query = {product_shop, isDraft:true}
        return await findAllDraftsForShop({query, limit, skip})
    }

    static async findAllPublishForShop({product_shop, limit = 50, skip = 0}){
        const query = {product_shop, isPubished:true}
        return await findAllPublishForShop({query, limit, skip})
    }

    static async getListSearchProduct( {keySearch} ){
        return searchProductByUser({keySearch})
    }

    static async findAllProducts( {limit = 50, sort='ctime', page = 1, filter = {isPubished: true}} ){
        return await findAllProducts({limit, sort, filter, page,
            select:['product_name', 'product_thumb', 'product_price']
        })
    }

    static async findProduct( {product_id} ){
        return await findProduct({product_id, unSelect:['__v']})
    }
}


ProductFactory.registerProductType(['Clothing', 'Electronics', 'Furniture'])
console.log('this is our registry',ProductFactory.productRegistry)
module.exports = ProductFactory
