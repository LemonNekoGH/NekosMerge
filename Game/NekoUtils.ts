/**
 * Created by LemonNekoGC on 2021-07-28 17:44:30.
 * 柠喵自己糊的工具类
 */
const NekoUtils = {
    // 数组工具
    Array: {
        // 返回一个数组中是否包含某个元素或某些元素
        includes(arr: any[], ...search: any[]): boolean {
            for (let index in search) {
                if (arr.indexOf(search[index])) {
                    return true
                }
            }
            return false
        },
        // 返回一个数组中是否包含某些元素，必须全部包含才返回 true
        strictIncludes(arr: any[], ...search: any[]): boolean {
            let include = true
            for (let index in search) {
                include = include && (arr.indexOf(search[index]) !== -1)
            }
            return include
        }
    }
}