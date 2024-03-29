'use strict'

'use strict'

const InventoryService = require('../services/inventory.service');
const { SuccessResponse } = require('../core/success.response');

class InventoryController{

    addStockToInventory = async function(req,res,next){
        new SuccessResponse({
            message:'Add Stock To inventory Success',
            metadata: await InventoryService.addStockToInventory(req.body)
        }).send(res)

        console.log(req)
    }

}


module.exports = new InventoryController()