'use strict';
/*
 * commonQuery - commnQuery.js
 * Author: smartData Enterprises
 * 
 */

var constant = require('../config/constant');
var mongoose = require('mongoose');

// var fs = require("fs");
var path = require('path');
var async = require('async');
// var counters = mongoose.model('counters');

var commonQuery = {};

/**
 * Function is use to Fetch Single data
 * @access private
 * @return json
 * Created by SmartData
 * @smartData Enterprises (I) Ltd
 * Created Date -
 */
commonQuery.findoneData = async function findoneData(model, condition, fetchVal) {
    return new Promise(function(resolve, reject) {
        model.findOne(condition, fetchVal, function(err, data) {
            console.log("data", data)
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }

        });
    })
}


commonQuery.findoneBySort = function findoneBySort(model, condition, fetchVal, sortby) {
        return new Promise(function(resolve, reject) {

            if (!sortby) {
                sortby = {
                    _id: -1
                };
            }
            model.findOne(condition, fetchVal).sort(sortby).exec(function(err, data) {
                if (err) {

                    reject(err);
                } else {
                    resolve(data);
                }
            });
        })
    }
    /**
     * Function is use to Last Inserted id
     * @access private
     * @return json
     * Created by SmartData
     * @smartData Enterprises (I) Ltd
     * Created Date -
     */
commonQuery.lastInsertedId = function lastInsertedId(model) {
    return new Promise(function(resolve, reject) {
        model.findOne().sort({
            id: -1
        }).exec(function(err, data) {
            if (err) {
                resolve(0);
            } else {
                if (data) {
                    var id = data.id + 1;
                } else {
                    var id = 1;
                }
            }
            resolve(id);
        });
    })
}


commonQuery.sortAllData = function sortAllData(model, field_name) {
    return new Promise(function(resolve, reject) {
        model.find().sort(field_name).exec(function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    })
}


commonQuery.sortAllDataDesc = function sortAllDataDesc(model, field_name) {
    return new Promise(function(resolve, reject) {
        let to_sort = {};
        to_sort[field_name] = -1;
        model.find().sort(to_sort).exec(function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    })
}


commonQuery.lastInsertedIdPermissonId = function lastInsertedId(model) {
    return new Promise(function(resolve, reject) {
        model.findOne().sort({
            permission_id: -1
        }).exec(function(err, data) {
            if (err) {
                resolve(0);
            } else {
                if (data) {
                    var id = data.permission_id + 1;
                } else {
                    var id = 1;
                }
            }
            resolve(id);
        });
    })
}

/**
 * Function is use to Insert object into Collections
 * @access private
 * @return json
 * Created by SmartData
 * @smartData Enterprises (I) Ltd
 * Created Date -
 */
commonQuery.InsertIntoCollection = function InsertIntoCollection(model, obj) {
        return new Promise(function(resolve, reject) {
            new model(obj).save(function(err, insertedData) {
                if (err) {
                    reject(err);
                } else {
                    resolve(insertedData);
                }
            });
        })
    }
    /**
     * Function is use to Update One Document
     * @access private
     * @return json
     * Created by SmartData
     * @smartData Enterprises (I) Ltd
     * Created Date 23-Jan-2018
     */
commonQuery.updateOneDocument = function updateOneDocument(model, updateCond, updateData) {
    return new Promise(function(resolve, reject) {
        model.findOneAndUpdate(updateCond, {

                $set: updateData
            }, {
                new: true
            })
            .lean().exec(function(err, updatedData) {
                if (err) {
                    console.log("errerrerrerrerrerr", err)
                    reject(0);
                } else {
                    resolve(updatedData);
                }
            });
    })
}
commonQuery.updateOne = function updateOne(model, updateCond, updateData) {
        return new Promise(function(resolve, reject) {
            model.updateOne(updateCond, {
                    $set: updateData
                })
                .lean().exec(function(err, updatedData) {
                    if (err) {
                        console.log("errerrerrerrerrerr", err)
                        reject(0);
                    } else {
                        resolve(updatedData);
                    }
                });
        })
    }
    /**
     * Function is use to Update One Document
     * @access private
     * @return json
     * Created by SmartData
     * @smartData Enterprises (I) Ltd
     * Created Date 23-Jan-2018
     */
commonQuery.updateOneDocumentWithOutInserting = (model, updateCond, updateData) => {
    return new Promise((resolve, reject) => {
        model.findOneAndUpdate(updateCond, {
            $set: updateData
        }).exec((err, updatedData) => {
            if (err) {
                console.log(err);
                return reject(0);
            } else {
                return resolve(updatedData);
            }
        });
    })
}

/**
 * Function is use to Update All Document
 * @access private
 * @return json
 * Created by SmartData
 * @smartData Enterprises (I) Ltd
 * Created Date 23-Jan-2018
 */
commonQuery.updateAllDocument = function updateAllDocument(model, updateCond, UpdateData) {
    return new Promise(function(resolve, reject) {
        model.update(updateCond, {
                $set: UpdateData
            }, {
                multi: true
            })
            .lean().exec(function(err, InfoData) {
                if (err) {
                    resolve(0);
                } else {
                    resolve(InfoData);
                }
            });
    })
}
commonQuery.updateMany = function updateMany(model, updateCond, UpdateData) {
    return new Promise(function(resolve, reject) {
        model.updateMany(updateCond, {
                $set: UpdateData
            })
            .lean().exec(function(err, InfoData) {
                if (err) {
                    resolve(0);
                } else {
                    resolve(InfoData);
                }
            });
    })
}

/**
 * Function is use to Find all Documents
 * @access private
 * @return json
 * Created by SmartData
 * @smartData Enterprises (I) Ltd
 * Created Date 23-Jan-2018
 */
commonQuery.fetch_all = function fetch_all(model, cond = {}, fetchd = {}) {
    return new Promise(function(resolve, reject) {
        model.find(cond, fetchd).exec(function(err, Data) {
            if (err) {
                reject(err);
            } else {
                resolve(Data);
            }

        });
    })
}
commonQuery.fetch_all_by_sort = function fetch_all_by_sort(model, cond = {}, fetchd = {}) {
    return new Promise(function(resolve, reject) {
        model.find(cond, fetchd).sort('createdAt').exec(function(err, Data) {
            if (err) {
                console.log("errrrrrr", err)
                reject(err);
            } else {
                resolve(Data);
            }

        });
    })
}
commonQuery.fetch_one = function fetch_one(model, cond = {}, fetchd = {}) {
    return new Promise(function(resolve, reject) {
        model.findOne(cond, fetchd).exec(function(err, Data) {
            if (err) {
                console.log("errrrrrr", err)
                reject(err);
            } else {
                resolve(Data);
            }

        });
    })
}
commonQuery.hard_delete = function hard_delete(model, cond = {}) {
        return new Promise(function(resolve, reject) {
            model.remove(cond).exec(function(err, Data) {
                if (err) {
                    console.log("errrrrrr", err)
                    reject(err);
                } else {
                    resolve(Data);
                }

            });
        })
    }
    /**
     * Function is use to Find all Distinct value
     * @access private
     * @return json
     * Created by SmartData
     * @smartData Enterprises (I) Ltd
     * Created Date 27-June-2018
     */

commonQuery.fetch_all_distinct = function fetch_all_distinct(model, ditinctVal, cond) {
    return new Promise(function(resolve, reject) {
        model.distinct(ditinctVal, cond).exec(function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }

        });
    })
}

/**
 * Function is use to Count number of record from a collection
 * @access private
 * @return json
 * Created by SmartData
 * @smartData Enterprises (I) Ltd
 * Created Date 23-Jan-2018
 */
commonQuery.countData = function countData(model, cond) {
        return new Promise(function(resolve, reject) {
            model.countDocuments(cond).exec(function(err, Data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(Data);
                }
            });
        })
    }
    /**
     * Function is use to Fetch All data from collection , Also it supports aggregate function
     * @access private
     * @return json
     * Created by SmartData
     * @smartData Enterprises (I) Ltd 
     * Created Date 23-Jan-2018
     */
commonQuery.fetchAllLimit = function fetchAllLimit(query) {
    return new Promise(function(resolve, reject) {
        query.exec(function(err, Data) {
            if (err) {
                reject(err);
            } else {
                resolve(Data);
            }
        });
    })
}

/**
 * Function is use to Insert object into Collections , Duplication restricted
 * @access private
 * @return json
 * Created by SmartData
 * @smartData Enterprises (I) Ltd
 * Created Date 07-Feb-2018
 */

commonQuery.uniqueInsertIntoCollection = function uniqueInsertIntoCollection(model, obj) {
    return new Promise(function(resolve, reject) {
        model.update(
                obj, {
                    $setOnInsert: obj
                }, {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true
                })
            .exec(function(err, data) {
                if (err) {
                    resolve(0);
                } else {
                    resolve(data);
                }
            });
    })
}

/**
 * Function is use to DeleteOne Query
 * @access private
 * @return json
 * Created by SmartData
 * @smartData Enterprises (I) Ltd
 * Created Date 07-Feb-2018
 */
commonQuery.deleteOneDocument = function deleteOneDocument(model, cond) {
        return new Promise(function(resolve, reject) {
            model.deleteOne(cond).exec(function(err, Data) {
                if (err) {
                    resolve(0);
                } else {
                    // resolve(1);
                    resolve(Data);
                }

            });
        })
    }
    /**
     * Function is use to Insert Many object into Collections
     * @access private
     * @return json
     * Created by SmartData
     * @smartData Enterprises (I) Ltd
     * Created Date 15-Feb-2018
     */
commonQuery.InsertManyIntoCollection = function InsertManyIntoCollection(model, obj) {
    return new Promise(function(resolve, reject) {
        model.insertMany(obj, function(error, inserted) {
            if (error) {
                resolve(error);
            } else {
                resolve(inserted);
            }

        });
    })
}

/**
 * Function is use to delete Many document from Collection
 * @access private
 * @return json
 * Created by SmartData
 * @smartData Enterprises (I) Ltd
 * Created Date 16-Feb-2018
 */
commonQuery.deleteManyfromCollection = function deleteManyfromCollection(model, obj) {
    return new Promise(function(resolve, reject) {
        model.deleteMany(obj, function(error, inserted) {
            if (error) {
                resolve(0);
            } else {
                reject(1);
            }

        });
    })
}

commonQuery.mongoObjectId = function(data) {
    if (data && data !== null && data !== undefined) {
        return mongoose.Types.ObjectId(data);
    } else {
        return false;
    }
}

/**
 * Function is use to aggregate with match and lookup
 * @access private
 * @return json
 * Created by SmartData
 * @smartData Enterprises (I) Ltd
 * Created Date 27-June-2018
 */

commonQuery.aggregateFunc = function aggregateFunc(model, fromTable, localFieldVal, foreignFieldVal, condition) {
    return new Promise(function(resolve, reject) {

        model.aggregate([{
                $match: condition
            },
            {
                $lookup: {
                    from: fromTable,
                    localField: localFieldVal,
                    foreignField: foreignFieldVal,
                    as: "docs"
                }
            }
        ]).exec(function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }

        });
    })
}

commonQuery.doubleLookup = function doubleLookup(
    model, fromTable, localFieldVal, foreignFieldVal, condition,
    second_fromTable, second_localFieldVal, second_foreignFieldVal) {
    return new Promise(function(resolve, reject) {
        model.aggregate([{
                $match: condition
            },
            {
                $lookup: {
                    from: fromTable,
                    localField: localFieldVal,
                    foreignField: foreignFieldVal,
                    as: "docs"
                }
            },
            {
                $lookup: {
                    from: second_fromTable,
                    localField: second_localFieldVal,
                    foreignField: second_foreignFieldVal,
                    as: "dataa"
                }
            }
        ]).exec(function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }

        });
    })
}
commonQuery.getNextSequenceValue = function(sequenceName) {
    return new Promise(function(resolve, reject) {
        let query = {
            _id: sequenceName
        }
        counters.findOneAndUpdate(query, {
                $inc: {
                    sequence_value: 1
                }
            }, {
                new: true
            })
            .lean().exec(function(err, updatedData) {
                if (err) {
                    reject(0);
                } else {
                    resolve(updatedData);
                }
            });
    });
}

/**
 * Function is use to Fetch all data
 * @access private
 * @return json
 * @smartData Enterprises (I) Ltd
 * 20-jun-2019e 20-jun-2019
 */
commonQuery.findData = function findData(model, cond, fetchVal) {
    return new Promise(function(resolve, reject) {
        let tempObj = {
            status: false
        }
        model.find(cond, fetchVal, function(err, Data) {
            if (err) {
                tempObj.error = err;
                reject(tempObj);
            } else {
                tempObj.status = true;
                tempObj.data = Data;
                resolve(tempObj);
            }
        });
    })
}

/**
 * Function is use to upload file into specific location
 * @access private
 * @return json
 * Created by SmartData
 * @smartData Enterprises (I) Ltd
 * Created Date -
 */

commonQuery.findDataBySortSkipLimit = function findDataBySortSkipLimit(model, cond, sort_by, count, skip) {
    return new Promise(function(resolve, reject) {

        model.find(cond).sort(sort_by)
            .limit(parseInt(count))
            .skip(parseInt(skip))
            .exec(function(err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
    })
}



/**
 * Function is use to upload file into specific location
 * @access private
 * @return json
 * Created by SmartData
 * @smartData Enterprises (I) Ltd
 * Created Date -
//  */
// commonQuery.fileUpload = function fileUpload(imagePath, buffer) {
//     return new Promise((resolve, reject) => {
//         fs.writeFile(path.resolve(imagePath), buffer, function (err) {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve('uploaded');
//             }
//         });
//     });
// }
/**
 * Function is use to check File Exist or not
 * @access private
 * @return json
 * Created by SmartData
 * @smartData Enterprises (I) Ltd
 * Created Date 23-Jan-2018
 */
// commonQuery.FileExist = function FileExist(imagePath, noImage, imageloc) {
//     return new Promise(function (resolve, reject) {
//         utility.fileExistCheck(imagePath, function (exist) {
//             if (!exist) {
//                 console.log("no Imagessssssssss");
//                 resolve(constant.config.baseUrl + noImage);
//             } else {
//                 resolve(constant.config.baseUrl + imageloc);
//             }
//         });
//     })
// }
/**
 * Function is use to delete file from specific directory
 * @access private
 * @return json
 * Created by SmartData
 * @smartData Enterprises (I) Ltd
 * Created Date -
 */
// commonQuery.deleteFile = function deleteFile(filePath) {
//     return new Promise(function (resolve, reject) {
//         fs.unlink(filePath, function (err) {
//             if (err) {
//                 reject(err);
//             } else {
//                 console.log("Success fully Deleted ");
//                 resolve("success");
//             }
//         });
//     })
// }

module.exports = commonQuery;