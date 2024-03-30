'use strict'

const shopModel = require('../models/shop.model');
const { writeFile, readFile }= require('node:fs/promises');
const crypto = require('node:crypto');
const KeyTokenService = require('./keyToken.service');
const { createTokenPair } = require('../auth/authUtils');
const { getInfoData } = require('../utils');
const { BadRequestError,ForbiddenError, AuthFailureError } = require('../core/error.response');

// services //
const { findByEmail } = require('./shop.service');
const RoleShop = {
    SHOP:'SHOP',
    WRITER:'WRITER',
    EDITOR:'EDITOR',
    ADMIN:'ADMIN'
}

class AccessService{

    static handleRefreshToken = async({ keyStore, user, refreshToken })=>{
        
        const {userId, email} = user;
        if(keyStore.refreshTokensUsed.includes(refreshToken)){
            await KeyTokenService.deleteKeyById(userId)
            throw new ForbiddenError('Something wrong happended, please relogin')
        }

        console.log('this is email',email)
        if(keyStore.refreshToken !== refreshToken )throw new AuthFailureError('something was wrong happended, please relogin')

        const foundShop = await findByEmail({email})
        if(!foundShop) throw new AuthFailureError('shop not registed');

        const privateKey =await readFile(`${email}_private_key.pem`)

        console.log('this is privatekey', privateKey)

        const publicKeyObject = crypto.createPublicKey(keyStore.publicKey);
        const privateKeyObject = crypto.createPrivateKey(privateKey);

        const tokens = await createTokenPair({userId,email},publicKeyObject, privateKeyObject)
        console.log('this is tokens',tokens)
        //update token
        await keyStore.updateOne({
            $set:{
                refreshToken:tokens.refreshToken
            },
            $addToSet:{
                refreshTokensUsed:refreshToken
            }
        })

        return {
            user,
            tokens  
        }
    }

    static logout = async(keyStore)=>{
        const delKey = await KeyTokenService.removeKeyById(keyStore._id);
        console.log({delKey})
        return delKey 
    }
    static login = async({email,password,refreshToken =  null})=>{
        /*
            1 - check email in database
            2 - match password
            3 - create access token, refresh token and save
            4 - generate tokens
            5 - get data return login
         */
        // 1
        const foundShop = await findByEmail({email})
        if(!foundShop) throw new BadRequestError('Shop not registed');
        // 2
        const salt = foundShop.salt;
        console.log(salt)
        const passwordHashed = await crypto.pbkdf2Sync(password,salt,1000,64,'sha512').toString('hex');
        const match = (passwordHashed === foundShop.password);
        if(!match) throw new AuthFailureError('wrong password !!!')
        //3
        /**
         * re-create key-pair for each workstation
         * safer, but reduce our perfomance
         */
        const { privateKey,publicKey } = crypto.generateKeyPairSync('rsa',{
            modulusLength:4096,
            publicKeyEncoding:{
                type:'pkcs1',
                format:'pem'
            },
            privateKeyEncoding:{
                type:'pkcs1',
                format:'pem'
            }
        })
        
        const { _id:userId } = foundShop 
        const publicKeyObject = crypto.createPublicKey(publicKey)
        const tokens = await createTokenPair({userId,email},publicKeyObject,privateKey)
        //4
        await KeyTokenService.createKeyToken({
            refreshToken:tokens.refreshToken,
            publicKey,
            userId:foundShop._id,email
        })  
        //5
        const pemFilePath = `${email}_private_key.pem`;
        await writeFile(pemFilePath, privateKey);
        return{
            shop:getInfoData({field:['_id','email'],object:foundShop}),
            tokens
        }
    }

    static register = async ({name, email, password})=>{
        //check email existed?
        //lean() return pure object js, so everything is faster
        const holderShop = await shopModel.findOne({email}).lean()
        if(holderShop){
            throw new BadRequestError('Error: shop already registed')
        }
        const salt = crypto.randomBytes(16).toString('hex')
        const passwordHashed = await crypto.pbkdf2Sync(password,salt,1000,64,'sha512').toString('hex')
        const newShop = await shopModel.create({
            name, email, password:passwordHashed, salt, roles:[RoleShop.SHOP]
        });

        //if newShop successfully created
        if(newShop){
            //create private key and public key
            const { privateKey,publicKey } = crypto.generateKeyPairSync('rsa',{
                modulusLength:4096,
                publicKeyEncoding:{
                    type:'pkcs1',
                    format:'pem'
                },
                privateKeyEncoding:{
                    type:'pkcs1',
                    format:'pem'
                }
            })

            /**
             * remmember, good implementation not save private key to database
             * we need to write private key somewhere else
             * this project is implement to pass string directly to postman request
             * not import private key from file
             * but import from file is better solution
            */
            const tokens = await createTokenPair({userId:newShop._id,email},publicKey,privateKey)
            if(!tokens)throw BadRequestError('create tokens error!!!!!!')
            
            //store public key, refreshToken to database
            const keyStore = await KeyTokenService.createKeyToken({
                userId:newShop._id,
                publicKey,
                refreshToken:tokens.refreshToken
            })

            if(!keyStore) throw BadRequestError(' createKeyToken Error!!!');

            //write private key to pem file
            const pemFilePath = `${email}_private_key.pem`;
            await writeFile(pemFilePath, privateKey);
            return{
                shop:getInfoData({field:['_id','name'],object:newShop}),
                tokens,
                privateKeyPath: pemFilePath
            }
        }
        return {
            code:200,
            metadata:null
        }
    }
}

module.exports = AccessService