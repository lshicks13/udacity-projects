/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/===================================================*/

// Importing the module 'level'
const level = require('level');

// Declaring the folder path that store the data
const chainDB = './chaindata1';

// Declaring a class
class LevelSandbox {
    
    // Declaring the class constructor
    constructor() {
    	this.db = level(chainDB);
    }
  
  	// Get data from levelDB with key (Promise)
  	getLevelDBData(key){
        let self = this; 
        return new Promise(function(resolve, reject) {
            self.db.get(key, (err, value) => {
                if(err){
                    if (err.type == 'NotFoundError') {
                        resolve(undefined);
                    }else {
                        console.log('Block ' + key + ' get failed', err);
                        reject(err);
                    }
                }else {
                    resolve(value);
                    //return value;
                }
            });
        });
    }
  
    // Add data to levelDB with value
    addDataToLevelDB(value) {
        let i = 0;
        let self = this;
        return new Promise(function(resolve, reject){
            self.db.createReadStream()
            .on('data', function() {
              i++;
              //console.log(data);
            }).on('error', function(err) {
                reject(err)
            }).on('close', function() {
                self.addLevelDBData(i, value);
                resolve(i);
                if(i > 0){
                    console.log("\nBlock #" + i + " successfully added! \n");
                };
            });
        })
    }  
    
    // Add data to levelDB with key/value pair (Promise)
    addLevelDBData(key, value) {
        let self = this;
        return new Promise(function(resolve, reject) {
            self.db.put(key, value, function(err) {
                if (err) {
                    console.log('Block ' + key + ' submission failed', err);
                    reject(err);
                }
                resolve(value);
            });
        });
    }
  
  	/// Get the current # of blocks in levelDB
    getBlocksCount() {
        let i = -1;
        let self = this;
        return new Promise(function(resolve, reject){
            self.db.createReadStream()
            .on('data', function(data) {
              i++;
            })
            .on('error', function(err) {
                reject(err)
            })
            .on('close', function() {
                resolve(i);
            });
        })
      }
}
// Export the class
module.exports.LevelSandbox = LevelSandbox;