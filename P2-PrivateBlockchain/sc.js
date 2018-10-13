/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');

/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block{
	constructor(data){
     this.hash = "",
     this.height = 0,
     this.body = data,
     this.time = 0,
     this.previousBlockHash = ""
    }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain{
    constructor() {
        //this.chain = [];
        this.addBlock1(new Block("First block in the chain - Genesis block"));
    }

  // Add data to levelDB with key/value pair
    addLevelDBData(key, value) {
        db.put(key, value, function (err) {
            if (err) return console.log('Block ' + key + ' submission failed', err);
        })
    }

  // Get data from levelDB with key
    getLevelDBData(key) {
        return new Promise(function (resolve, reject) {
            db.get(key, function (err, value) {
                if (err) {
                    reject(err);
                } else {
                    resolve(value);
                }
            })
        });
    }

  // Add new block
  /*addBlock(newBlock){
    // Block height
    newBlock.height = this.chain.length;
    // UTC timestamp
    newBlock.time = new Date().getTime().toString().slice(0,-3);
    // previous block hash
    if(this.chain.length>0){
      newBlock.previousBlockHash = this.chain[this.chain.length-1].hash;
    }
    // Block hash with SHA256 using newBlock and converting to a string
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
    // Adding block object to chain
  	this.chain.push(newBlock);
  }*/

  addBlock1(newBlock) {
        var chainlength = this.getChainLength();
        newBlock.height = chainlength;
        //newBlock.height = newBlock.height + 1
        console.log(newBlock.height);
        //newBlock.height = ++blockheight;
        newBlock.time = new Date().getTime().toString().slice(0,-3);
        //if(height > 0){
            //previousBlockHash = getBlock(height - 1).hash;
        //}
        //hash = SHA256(JSON.stringify(newBlock)).toString();
        this.addLevelDBData(newBlock.height, newBlock);
        //addLevelDBData(newBlock.height, newBlock);
        console.log("Block #" + newBlock.height + " added");
        //});
//})
}
    // Get last block number
    getBlockNum(){
        return new Promise(function(resolve, reject){
            let i = 0;
            db.createReadStream().on('data', function(data) {
                i++;
                }).on('error', function(err) {
                    reject(err)
                }).on('close', function() {
                //resolve(i - 1);
                resolve(i);
                });
        })
    }

    // Get block height
    getChainLength(){
        this.getBlockNum().then(function(result){
            console.log(result);
            return result;
            //return JSON.parse(JSON.stringify(result));
        }).catch(function(err){
            console.log(err);
        })
    }

    // Get block height
    getBlockHeight(){
        this.getBlockNum().then(function(result){
            console.log(result -1);
            return (result - 1);
            //return JSON.parse(JSON.stringify(result));
        }).catch(function(err){
            console.log(err);
        })
    }

    // get block
    getBlock(blockHeight){
        var getDBdata = this.getLevelDBData(blockHeight)
        getDBdata.then(function(result){
            //result;
            console.log(JSON.parse(JSON.stringify(result)));
            //return result;
            //return JSON.parse(JSON.stringify(result));
        }).catch(function(err){
            console.log(err);})
      // return object as a single string
    }

    // validate block
    validateBlock(blockHeight){
      // get block object
      let block = this.getBlock(blockHeight);
      // get block hash
      let blockHash = block.hash;
      // remove block hash to test block integrity
      block.hash = '';
      // generate block hash
      let validBlockHash = SHA256(JSON.stringify(block)).toString();
      // Compare
      if (blockHash===validBlockHash) {
          return true;
        } else {
          console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
          return false;
        }
    }

   // Validate blockchain
    validateChain(){
      let errorLog = [];
      for (var i = 0; i < this.chain.length-1; i++) {
        // validate block
        if (!this.validateBlock(i))errorLog.push(i);
        // compare blocks hash link
        let blockHash = this.chain[i].hash;
        let previousHash = this.chain[i+1].previousBlockHash;
        if (blockHash!==previousHash) {
          errorLog.push(i);
        }
      }
      if (errorLog.length>0) {
        console.log('Block errors = ' + errorLog.length);
        console.log('Blocks: '+errorLog);
      } else {
        console.log('No errors detected');
      }
    }
}
