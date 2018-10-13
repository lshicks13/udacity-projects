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
        //this.addBlock(new Block("First block in the chain - Genesis block"));
        //this.name = "My Blockchain";
        this.addDataToLevelDB("Genesis Block");
    }

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
            };
        })
    })
}


