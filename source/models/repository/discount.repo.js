'use strict'

const { getSelectData, unGetSelectData } = require('../../utils/index')

const findAllDiscountCodesUnselect = async({limit = 50, page = 1, sort = 'ctime', filter , unSelect, model})=>{
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
    
    const documents = await model.find(filter)
    .sort(sortBy)//Sets the sort order
    .skip(skip)//Specifies the number of documents to skip.
    .limit(limit)//Specifies the maximum number of documents the query will return.
    .select(unGetSelectData(unSelect))//specify which document field to exclude 
    .lean()

    return documents
}


const findAllDiscountCodesSelect = async({limit = 50, page = 1, sort = 'ctime', filter , select, model})=>{
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
    
    const documents = await model.find(filter)
    .sort(sortBy)//Sets the sort order
    .skip(skip)//Specifies the number of documents to skip.
    .limit(limit)//Specifies the maximum number of documents the query will return.
    .select(getSelectData(select))//specify which document field to exclude 
    .lean()

    return documents
}

const checkDiscountExists = async({model, filter})=>{
    return await model.findOne(filter).lean()
}

module.exports = {
    findAllDiscountCodesUnselect,
    findAllDiscountCodesSelect,
    checkDiscountExists
}