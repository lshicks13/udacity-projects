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
        this.addBlock(new Block("First block in the chain - Genesis block"));
    }

    // Add new block
    addBlock(newBlock){
        //var cbh;
        // Block height
        db.getBlocksCount().then((count) => {
            var cbh = count - 1;
            newBlock.height = cbh + 1;
            var pbh = cbh - 1;
            // UTC timestamp
            newBlock.time = new Date().getTime().toString().slice(0,-3);
            // Block hash with SHA256 using newBlock and converting to a string
            newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
            //Add previous block hash if blockheight is greater than zero
            if(newBlock.height > 0){
                db.getLevelDBData(pbh).then((value) => {
                    var block = JSON.stringify(value);
                    //console.log('block' + block);
                    pbh = SHA256(block).toString();
                    //console.log('hashed block' + pbh);
                    return pbh;
                }).then((pbh) => { 
                    //console.log('this is the pbh' + pbh); 
                    newBlock.previousBlockHash = pbh;
                    // Adding block object to chain
                    console.log('this is the new block right before its saved to the db' + JSON.stringify(newBlock));
                    db.addDataToLevelDB(JSON.stringify(newBlock).toString());
                }).catch((err) => { 
                   console.log(err); 
                });
            } else{
                console.log('this is the new block right before its saved to the db' + JSON.stringify(newBlock));
                db.addDataToLevelDB(JSON.stringify(newBlock));
            };
        }).catch((err) => {
            console.log(err); 
        });
    }
    

    getBlock(bheight) {
        // pull block from db and return it
        db.getLevelDBData(bheight)
            .then((value) => {
                console.log('Block #' + bheight + ' successfully retrieved!')
                console.log(value);
           })
           .catch((err) => { 
               console.log(err); 
            });
    }

    getBlockHeight() {
        db.getBlocksCount().then((count) => {
            var height = count - 1;
            console.log('The current block is Block #' + height);
            return count;
        }).catch((err) => {
            console.log(err); 
        });
    }
}

let bc = new Blockchain();

(function theLoop (i) {
    setTimeout(function () {
        //Test Object
        bc.addBlock(new Block('Data ' + i));
        i++;
        if (i < 3) { 
          theLoop(i) 
        }
    }, 600);
  })(0);