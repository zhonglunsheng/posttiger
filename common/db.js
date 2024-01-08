const loki = require("lokijs");

var lokiDb = new loki('db/posttiger.db', {
    autoload: true,
    autoloadCallback : databaseInitialize,
    autosave: true,
    autosaveInterval: 1000
});

// implement the autoloadback referenced in loki constructor
function databaseInitialize() {
    // kick off any program logic or start listening to external events
    runProgramLogic();
}

// example method with any bootstrap logic to run after database initialized
function runProgramLogic() {
    var collectionsSize = lokiDb.collections.length
    console.log("number of collections in database : " + collectionsSize);
}


const posttiger = {
    db: (collection) => {
        let coll = lokiDb.getCollection(collection)
        coll = coll || lokiDb.addCollection(collection)

        /**
         * 去掉元属性、loki唯一标识后保存
         * @param data 支持数组对象、单个对象
         * @returns {*}
         */
        function insert(data) {
            // 去掉元属性数据
            let copyData = JSON.parse(JSON.stringify(data))
            let insertData
            if (Array.isArray(copyData)) {
                insertData = copyData.map((obj) => {
                    const { meta, $loki, ...newObj } = obj
                    return newObj
                })
            } else {
                const { meta, $loki, ...newObj } = copyData
                insertData = newObj
            }
            console.log(insertData, 'insertData')
            return coll.insert(insertData)
        }

        /**
         * 请空数据后再插入
         * @param data 支持数组对象、单个对象
         * @returns {*}
         */
        function cleanInsert(data) {
            coll.clear()
            return insert(data)
        }

        /**
         * 更新或插入对象
         * @param data 对象数据
         * @param condition 查询条件
         */
        function insertOrUpdate(condition, data) {
            let copyData = JSON.parse(JSON.stringify(data))
            let item = coll.findOne(condition)
            if (item) {
                // 更新
                copyData['$loki'] = item['$loki']
                copyData['meta'] = item['meta']
                coll.update(copyData)
            } else {
                // 插入数据
                console.log('insert', data)
                insert(data)
            }
        }

        return {
            insert: insert,
            cleanInsert: cleanInsert,
            insertOrUpdate: insertOrUpdate,
            collection: coll,
        }
    },
    lokiDb: lokiDb
}

const DB_CONSTANT = {

}
module.exports = { posttiger };