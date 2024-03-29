'use strict'

const { product,electronic,furniture,clothing } = require('../../models/product.model');
const { getSelectData, unGetSelectData, convertToObjectIdMongodb } = require('../../utils/index')

const findAllDraftsForShop = async( {query, limit, skip} )=>{
    return await queryProduct({query, limit, skip})
}

const findAllPublishForShop = async ({query, limit, skip})=>{
    return await queryProduct({query, limit, skip})
}
/*
    this is full-text search
    we need index 
*/
const searchProductByUser = async ({keySearch})=>{
    const regexSearch = new RegExp(keySearch)
    const results = await product.find(
        {
            isPubished:true,
            $text:{
                $search:regexSearch
            }
        },
        {
            score:{
                $meta:'textScore'
            }
    }).sort(
        {
            score:
            {$meta:'textScore'}
        }
    ).lean();
    return results
}
/**
 * 
 * @param {*} product_shop 
 * @param {*} product_id 
 * @returns 
 */
const publishProductByShop = async ({product_shop, product_id})=>{
    const foundShop =await product.findOne({
        product_shop: product_shop,
        _id: product_id
    });

    if(!foundShop) return null

    foundShop.isDraft = false
    foundShop.isPubished = true
    const { modifiedCount} = await foundShop.updateOne(foundShop)
    
    return modifiedCount
}

const unPublishProductByShop = async ({product_shop, product_id})=>{
    const foundShop =await product.findOne({
        product_shop: product_shop,
        _id: product_id
    });

    if(!foundShop) return null

    foundShop.isDraft = true
    foundShop.isPubished = false
    const { modifiedCount} = await foundShop.updateOne(foundShop)
    
    return modifiedCount
}



const findAllProducts = async( {limit, sort, page , filter, select} )=>{
    /*
        pagination start from 1, not from 0
        if sort equal ctime, sort by ascending, if sort not equal ctime, sort by decending
    */
    const skip = (page - 1)*limit;

    /**
     * if sort === 'ctime', sort by descending
     * if not, sort by ascending 
    */
    const sortBy = sort === 'ctime' ? {_id: -1} : {_id: 1}
    
    const products = await product.find(filter)
    .sort(sortBy)//Sets the sort order
    .skip(skip)//Specifies the number of documents to skip.
    .limit(limit)//Specifies the maximum number of documents the query will return.
    .select(getSelectData(select))//specify which document field to include 
    .lean()

    return products
}

const findProduct = async({product_id, unSelect})=>{
    return await product.findById(product_id).select(unGetSelectData(unSelect))
}

const updateProductById=async( {productId, payload, model, isNew = true} )=>{
    return await model.findByIdAndUpdate(productId, payload, {
        new: isNew
    })
}

const queryProduct = async ({query, limit, skip})=>{
    return await product.find(query)
    .populate('product_shop', 'name email -_id')
    .sort({updateAt: -1})
    .skip(skip)
    .limit(limit)
    .lean()
    .exec()
}

const getProductById = async (productId)=>{
    return await product.findOne({_id: convertToObjectIdMongodb(productId)}).lean()
}

const checkProductByServer = async (products)=>{
    /**
     * Promise.all take iterable of promise as input and return single promis as output
     * because query is asynchronous so we need Promise.all
    */
    return await Promise.all(products.map(async product=>{
        const foundProduct = await getProductById(product.productId)
        if(foundProduct){
            return{
                price:foundProduct.product_price,
                quantity:product.quantity,
                productId:product.productId
            }
        }
    }))
}

module.exports = {
    findAllDraftsForShop,
    publishProductByShop,
    findAllPublishForShop,
    unPublishProductByShop,
    searchProductByUser,
    findAllProducts,
    findProduct,
    updateProductById,
    queryProduct,
    getProductById,
    checkProductByServer
}