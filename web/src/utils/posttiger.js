export const posttiger = {
  db: (collection) => {
    let coll = window.db.getCollection(collection)
    coll = coll || window.db.addCollection(collection)

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
}
