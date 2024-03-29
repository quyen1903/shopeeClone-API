'use strict'
const { product, clothing, electronic, furniture } = require('../models/product.model');
const { updateProductById } = require('../models/repository/product.repo');
const { insertInventory } = require('../models/repository/inventory.repo')
const { removeUndefinedObject, updateNestedObjectParser } = require('../utils');
/*
    this is where strategy is implement
    we can loop through it utils reach strategy
*/


/*
    define base product class
    async createProduct meant to be overridden by subclass 
*/
class Product{
    constructor({
        product_name,
        product_thumb,
        product_description,
        product_price,
        product_type,
        product_shop,
        product_attributes,
        product_quantity
    }){
        this.product_name = product_name,
        this.product_thumb = product_thumb,
        this.product_description = product_description,
        this.product_price = product_price,
        this.product_type = product_type,
        this.product_shop = product_shop,
        this.product_attributes = product_attributes,
        this.product_quantity = product_quantity
    }
    // create new product instance in database
    async createProduct(product_id){
        const newProduct = await product.create({...this, _id:product_id})

        if(newProduct){
            //add product_stock in inventory collection
            await insertInventory({
                productId: newProduct._id,
                shopId: this.product_shop,
                stock: this.product_quantity
            })
        }
        return newProduct;
    }

    async updateProduct(productId, payload){
        return await updateProductById({productId, payload, model:product})
    }
}

class Clothing extends Product{
    async createProduct(){
        const newClothing = await clothing.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if(!newClothing)throw new BadRequestError('create new Clothing Error')

        const newProduct = await super.createProduct(newClothing._id)
        if(!newProduct) throw new BadRequestError('create new Product error')
    }

    async updateProduct( productId ){
        /*
            a: undefined
            b: null
        */
        //1 remove attribute null/undefined
        
        const objectParams = removeUndefinedObject(this)//this is the instance of Clothing
        //2 check where we update 
        if(objectParams.product_attributes){
            //update child 
            await updateProductById({
                productId,
                payload:updateNestedObjectParser(objectParams.product_attributes),
                model:clothing
            })
        }
        //update parent
        const updateProduct = await super.updateProduct(productId, updateNestedObjectParser(objectParams))
        return updateProduct
    }
}

class Electronics extends Product{
    async createProduct(){
        const newElectronic = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if(!newElectronic)throw new BadRequestError('create new Electronic Error')

        const newProduct = await super.createProduct(newElectronic._id)
        if(!newProduct) throw new BadRequestError('create new Product error')
    }

    async updateProduct( productId ){
        const objectParams = removeUndefinedObject(this)
        if(objectParams.product_attributes){
            await updateProductById({
                productId,
                payload:updateNestedObjectParser(objectParams.product_attributes),
                model:electronic
            })
        }
        const updateProduct = await super.updateProduct(productId, updateNestedObjectParser(objectParams))
        return updateProduct
    }
}

class Furniture extends Product{
    async createProduct(){
        const newFurniture = await furniture.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if(!newFurniture)throw new BadRequestError('create new Furniture Error')

        const newProduct = await super.createProduct(newFurniture._id)
        if(!newProduct) throw new BadRequestError('create new Product error')
    }

    async updateProduct( productId ){
        const objectParams = removeUndefinedObject(this)
        if(objectParams.product_attributes){
            await updateProductById({
                productId,
                payload:updateNestedObjectParser(objectParams.product_attributes),
                model:furniture
            })
        }
        const updateProduct = await super.updateProduct(productId, updateNestedObjectParser(objectParams))
        return updateProduct
    }
}

module.exports = {
    Electronics:Electronics,
    Clothing:Clothing,
    Furniture:Furniture
}