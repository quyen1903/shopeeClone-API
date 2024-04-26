'use strict'

const redisPubsubService = require("../services/redisPubsub.service")

class InventoryService{
    constructor(){
        redisPubsubService.subscribe('purchase_events', (channel, message)=>{
            console.log('Received message',message)
            InventoryService.updateInventory(message)
        })
    }

    static updateInventory(productId, quantity){
        console.log(`Update_inventory ${productId} with quantity ${quantity}`)
    }
}

module.exports =  new InventoryService()