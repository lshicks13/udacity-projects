/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

// Add data to levelDB with key/value pair
function addLevelDBData(key,value){
  db.put(key, value, function(err) {
    if (err) return console.log('Block ' + key + ' submission failed', err);
  })
}

// Get data from levelDB with key
function getLevelDBData(key){
    return new Promise(function(resolve, reject){
        db.get(key, function(err, value) {
            if (err) {
                reject(err)};
            resolve(value);
            //return JSON.parse(JSON.stringify(value));
            //console.log(value);
            //console.log(JSON.parse(JSON.stringify(value)));
        })
    });
}

// Add data to levelDB with value
function addDataToLevelDB(value) {
    let i = 0;
    db.createReadStream().on('data', function(data) {
          i++;
        }).on('error', function(err) {
            return console.log('Unable to read data stream!', err)
        }).on('close', function() {
          console.log('Block #' + i);
          addLevelDBData(i, value);
        });
}

// Get the last block height
function getHeight() {
    //new Promise(function(resolve, reject){
        let i = 0;
        db.createReadStream().on('data', function(data) {
            i++;
            }).on('error', function(err) {
                console.log(err)
            }).on('close', function() {
            console.log(i - 1);
            //addLevelDBData(i, value);
            });
    //})
}

function sp() {
    return new Promise(function(resolve, reject){
        let i = 0;
        db.createReadStream().on('data', function(data) {
            i++;
            }).on('error', function(err) {
                reject(err)
            }).on('close', function() {
            console.log(i - 1);
            //addLevelDBData(i, value);
            });
    })
}
function stupid() {
    sp().then(function(value){
        return value;
    })
}

// Add a block
function addBlock1(newBlock) {
        getBlockHeight().then(function(height){
            height = ++height;
            //time = new Date().getTime().toString().slice(0,-3);
            //if(height > 0){
                //previousBlockHash = getBlock(height - 1).hash;
            //}
            //hash = SHA256(JSON.stringify(newBlock)).toString();
            addLevelDBData(height, newBlock);
            console.log("Block #" + height + " added")
        }).catch(function(err){
            console.log(err);
        });
            //});
    //})
}

/* ===== Testing ==============================================================|
|  - Self-invoking function to add blocks to chain                             |
|  - Learn more:                                                               |
|   https://scottiestech.info/2014/07/01/javascript-fun-looping-with-a-delay/  |
|                                                                              |
|  * 100 Milliseconds loop = 36,000 blocks per hour                            |
|     (13.89 hours for 500,000 blocks)                                         |
|    Bitcoin blockchain adds 8640 blocks per day                               |
|     ( new block every 10 minutes )                                           |
|  ===========================================================================*/


/*(function theLoop (i) {
  setTimeout(function () {
    addDataToLevelDB('Testing data');
    if (--i) theLoop(i);
  }, 100);
})(10);*/

//addBlock("I wonder if this will work34");
/*getBlockHeight().then(function(dbheight){
    console.log(dbheight);
    getBlock(dbheight).then(function(result){
        console.log(result)});
});*/
//getBlock(0).then(function(result){console.log(result);}).catch(function(err){console.log(err);})
