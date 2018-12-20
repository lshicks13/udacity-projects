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
        const bh = this.getBlockHeight();
        bh.then(r => this.addGenesis(r));
    }

    //Add genesis block if block height is 0 or less
    addGenesis(bheight){
        if(bheight <= 0){
            this.addBlock(new Block("Genesis Block"));
            console.log('Genesis block was added')
        } else{
            console.log('No genesis block was added')
        }
    }

    // Add new block
    async addBlock(newBlock){
        // Block height
        const bh = await this.getBlockHeight();
        //New block height
        newBlock.height = bh + 1;
        // UTC timestamp
        newBlock.time = new Date().getTime().toString().slice(0,-3);
        //Add previous block hash if blockheight is greater than zero
        if (newBlock.height > 0){
            const prevBlock = JSON.parse(await this.getBlock(bh));
            newBlock.previousBlockHash = prevBlock.hash;
        }; 
        newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
        db.addDataToLevelDB(JSON.stringify(newBlock));
    }
    

    async getBlock(bheight) {
        // pull block from db
        try{
            const bk = await db.getLevelDBData(bheight);
            console.log('Block #' + bheight + ' details...\n' + bk + '\n');
            return bk;
        } catch (e) {
            console.log("Error", e);
        }  
    }

    async getBlockHeight() {
        // pull height from db
        try {
            const height = await db.getBlocksCount();
            if(height >= 0){
                console.log('Block #' + height);
            };
            return height;
        } catch (e) {
            console.log("Error", e);
        }  
    }

    // validate block
    async validateBlock(blockHeight) {
        // get block object
        let block = JSON.parse(await db.getLevelDBData(blockHeight));
        // get block hash
        let blockHash = block.hash;
        // remove block hash to test block integrity
        block.hash = '';
        // generate block hash
        let validBlockHash = SHA256(JSON.stringify(block)).toString();
        // Compare hashes
        if (blockHash === validBlockHash) {
            console.log('Block #' + blockHeight + ' valid hash!\n');
            return true
        } else {
            console.log('Block #' + blockHeight + ' invalid hash:\nBlock Hash: ' 
                + blockHash + '\nValid Hash: ' + validBlockHash);
            return false
        }
    }
  
    // Validate blockchain
    async validateChain(){
        var blockHeight = await db.getBlocksCount();
        var errorLog = [];
        for (let i = 0; i <= blockHeight; i++) {
            //Validate block
            let vBlock = await this.validateBlock(i);
            if(vBlock !== true){
                errorLog.push(i);
            };
            let block = JSON.parse(await this.getBlock(i));
            let blockHash = block.hash;
            if ((i+1) <= blockHeight){
                let block2 = JSON.parse(await this.getBlock(i + 1));
                let previousHash = block2.previousBlockHash;
                if (blockHash !== previousHash) {
                    errorLog.push(i);
                };
            };
        };
        if (errorLog.length>0) {
            errorLog = [ ...new Set(errorLog) ]
            console.log('Block errors = ' + errorLog.length);
            console.log('Blocks: ' + errorLog);
        } else {
            console.log('No errors detected!');
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

async function induceErrors(){
    let inducedErrorBlocks = [2,4];
    for (let i = 0; i < inducedErrorBlocks.length; i++) {
        let errorBlock = inducedErrorBlocks[i];
        let block = JSON.parse(await bc.getBlock(errorBlock));
        block.body = 'induced chain error';
        block.hash = SHA256(JSON.stringify(block)).toString();
        console.log('Block #' + errorBlock + 'with errors...' + JSON.stringify(block) + ' \n\n');
        db.addLevelDBData(errorBlock, JSON.stringify(block));
    } 
}