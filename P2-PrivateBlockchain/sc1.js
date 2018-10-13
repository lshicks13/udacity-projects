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
        //this.addBlock(new Block("First block in the chain - Genesis block"));
        this.addDataToLevelDB(new Block("Genesis Block"));
    }

    // Add new block
    addBlock(newBlock) {
        var height = this.getBlockHeight();
        // Block height
        newBlock.height = height;
        // UTC timestamp
        newBlock.time = new Date().getTime().toString().slice(0,-3);
        // previous block hash
        if(height > 0){
        newBlock.previousBlockHash = this.getBlock(height - 1).hash;
        }
        // Block hash with SHA256 using newBlock and converting to a string
        newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
        // Adding block object to chain
        this.addDataToLevelDB(newBlock); 
    }

    // Add data to levelDB with value
    addDataToLevelDB(value) {
        return new Promise(function (resolve, reject) {
            let i = 0;
            db.createReadStream().on('data', function (data) {
                i++;
            }).on('error', function (err) {
                reject(err)
            }).on('close', function () {
                resolve(addLevelDBData(i, value));
                console.log('Block #' + i);
            });
        })
    }

    // Get data from levelDB with key
    getLevelDBData(key) {
        return new Promise(function (resolve, reject) {
            db.get(key, function (err, value) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(value);
                };
            })
        })
    }
    
    // get block
    getBlock(blockHeight){
        var getDBData = this.getLevelDBData(blockHeight);
        getDBData.then(function(result){
            console.log(result);
            console.log(JSON.parse(JSON.stringify(result)));
            // return object as a single string
            return JSON.parse(JSON.stringify(result));
        }).catch(function(err){
            console.log(err);
        })
    }

    countBlocks() {
        return new Promise(function (resolve, reject) {
            let i = 0;
            db.createReadStream().on('data', function (data) {
                i++;
            }).on('error', function (err) {
                reject(err)
            }).on('close', function () {
                resolve(i);
                console.log('Block #' + i + ' will be created next');
            });
        })
    }

    // Get block height
    getBlockHeight(){
        var getBlockCount = this.countBlocks();
        getBlockCount.then(function(result){
            var blockheight = result - 1;
            console.log('The last block is Block #' + blockheight);
            // return object as a single string
            return blockheight;
        }).catch(function(err){
            console.log(err);
        })
    }

}

// Add data to levelDB with key/value pair
function addLevelDBData(key, value) {
    return new Promise(function (resolve, reject) {
        db.put(key, value, function (err) {
            if (err) {
                reject(err);
            }
            else {
                resolve(value);
                console.log('Block #' + key + ' has been successfully added.');
            };
        })
    })
}

/*bc.addDataToLevelDB({"squadName": "Super hero squad",
"homeTown": "Metro City",
"formed": 2016,
"secretBase": "Super tower",
"active": true}).then(function(result){console.log(result);}).catch(function(err){console.log(err);})*/
