'use strict'
const redis = require('redis');
const { promisify } = require('util');
const { reservationInventory } = require('../models/repository/inventory.repo');
const redisClient = redis.createClient()

const pExpire = promisify(redisClient.pExpire).bind(redisClient)
const setNXAsync = promisify(redisClient.setNX).bind(redisClient)

const acquireLock = async ( productId, quantity, cartId )=>{
    const key = `lock_v2024_${productId}`
    const retryTimes = 10;
    const expireTime = 3000;
    
    for (let i = 0; i < retryTimes.length; i++){
        const result = await setNXAsync(key, expireTime)
        console.log(`result :::` ,result)
        if(result === 1){
            const isReversation = await reservationInventory({
                productId, quantity, cartId
            })
            if(isReversation.modifiedCount) {
                await pExpire(key, expireTime)
                return key
            }
            return null;
        }else{
            await new Promise((resolve) => setTimeout(resolve, 50))
        }
    }
}

const releaseLock = async keyLock =>{
    const delAsyncKey = promisify(redisClient.del).bind(redisClient)
    return await delAsyncKey(keyLock)
}

module.exports = {
    acquireLock,
    releaseLock
}