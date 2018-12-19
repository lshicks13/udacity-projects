const SHA256 = require('crypto-js/sha256');
const BlockClass = require('./bk.js');
const BlockchainClass = require('./sc.js');
const db = new BlockchainClass.Blockchain();

/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class BlockController {

    /**
     * Constructor to create a new BlockController, you need to initialize here all your endpoints
     * @param {*} app 
     */
    constructor(app) {
        this.app = app;
        //this.blocks = [];
        //this.initializeMockData();
        this.getBlockByIndex();
        this.postNewBlock();
    }

    /**
     * Implement a GET Endpoint to retrieve a block by index, url: "/api/block/:index"
     */
    getBlockByIndex() {
        this.app.get("/block/:index", async(req, res) => {
            // Add your code here
            let i = req.params.index//.substring(1);
            let block = await db.getBlock(i);
            if(block == undefined){
                res.send("Block does not exist!");
            } else {
                res.send(block);
            }
        });
    }

    /**
     * Implement a POST Endpoint to add a new Block, url: "/api/block"
     */
    postNewBlock() {
        this.app.post("/block", (req, res) => {
            // Add your code here
            console.log(req.body.body);
            if (req.body.body == undefined){
                res.send("Error: No data in body! You must add data to create a new block.")
            } else {
                let block = new BlockClass.Block(req.body.body);
                db.addBlock(block);
            } 
        });
    }

    /**
     * Help method to inizialized Mock dataset, adds 10 test blocks to the blocks array
     */
    initializeMockData() {
        if(this.blocks.length === 0){
            for (let index = 0; index < 10; index++) {
                let blockAux = new BlockClass.Block(`Test Data #${index}`);
                blockAux.height = index;
                blockAux.hash = SHA256(JSON.stringify(blockAux)).toString();
                this.blocks.push(blockAux);
            }
        }
    }

}

/**
 * Exporting the BlockController class
 * @param {*} app 
 */
module.exports = (app) => { return new BlockController(app);}