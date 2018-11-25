/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');

/* ===== Persist data with LevelDB by importing levelSandbox class ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

//Importing levelSandbox class
 
const LevelSandboxClass = require('./ls.js');
 
// Creating the levelSandbox class object

const db = new LevelSandboxClass.LevelSandbox();

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
        this.addBlock(new Block("random data"));
    }

    // Add new block
    addBlock(newBlock){
        // Block height
        db.getBlocksCount().then((count) => {
            var blockHeight = count - 1;
            newBlock.height = blockHeight + 1;
            // UTC timestamp
            newBlock.time = new Date().getTime().toString().slice(0,-3);
            //Add previous block hash if blockheight is greater than zero
            if(newBlock.height > 0){
                db.getLevelDBData(blockHeight).then((value) => {
                    var prevBlock = JSON.parse(value);
                    newBlock.previousBlockHash = prevBlock.hash;
                    console.log(JSON.stringify(newBlock));
                    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
                    //console.log(JSON.stringify(newBlock));
                    db.addDataToLevelDB(JSON.stringify(newBlock).toString());
                }).catch((err) => { 
                   console.log(err); 
                });
            } else{
                newBlock.body = "Genesis Block";
                console.log(JSON.stringify(newBlock));
                // Block hash with SHA256 using newBlock and converting to a string
                newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
                db.addDataToLevelDB(JSON.stringify(newBlock).toString());
            };
        }).catch((err) => {
            console.log(err); 
        });
    }
    

    getBlock(bheight) {
        // pull block from db
        db.getLevelDBData(bheight)
            .then((value) => {
                if(value == undefined){
                    console.log('Block #' + bheight + ' does not exist.');
                }else{
                    console.log('Block #' + bheight + ' successfully retrieved!')
                    console.log(value);
                }
           })
           .catch((err) => { 
               console.log(err); 
            });
    }

    getBlockHeight() {
        db.getBlocksCount().then((count) => {
            var height = count - 1;
            console.log('The current block is Block #' + height);
        }).catch((err) => {
            console.log(err); 
        });
    }

    // validate block
    validateBlock(blockHeight){
        // get block object
        db.getLevelDBData(blockHeight).then((value) => {
            let block = JSON.parse(value);
            // get block hash
            let blockHash = block.hash;
            // remove block hash to test block integrity
            block.hash = '';
            // generate block hash
            let validBlockHash = SHA256(JSON.stringify(block)).toString();
            // Compare
            if (blockHash===validBlockHash) {
                console.log('Block #'+blockHeight+' hash validated!');
            } else {
                console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
            }
        }).catch((err) => { 
           console.log(err); 
        });
    }
  
    // Validate blockchain
    async validateChain(){
        var count = await db.getBlocksCount();
        var errorLog = [];
        var blockHeight = count - 1;
        for (let i = 0; i < blockHeight; i++) {
            //Validate block
            let value = await db.getLevelDBData(i);
            let value2 = await db.getLevelDBData(i + 1);
            let block = JSON.parse(value);
            let block2 = JSON.parse(value2);
            let blockHash = block.hash;
            block.hash = '';
            let validBlockHash = SHA256(JSON.stringify(block)).toString();
            if (blockHash === validBlockHash) {
                console.log('Block #' + i + ' validated!');
            } else {
                console.log('Block #' + i + ' is invalid!');
                errorLog.push(i);
            }
            let previousHash = block2.previousBlockHash;
            //Compare the block.hash of a block to the block.previousBlockHash in the next block to 
            //This validates the chain
            if (blockHash !== previousHash) {
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

let bc = new Blockchain();

(function theLoop (i) {
    setTimeout(function () {
        //Test Object
        bc.addBlock(new Block('Data ' + i));
        i++;
        if (i < 4) { 
          theLoop(i);
        }
    }, 600);
  })(0);


