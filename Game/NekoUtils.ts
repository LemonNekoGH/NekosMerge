/**
 * Created by LemonNekoGC on 2021-07-28 17:44:30.
 */
const NekoUtils = {
    Array: {
        includes (arr: any[], search: any[]): boolean {
            for (let index in search) {
                if (arr.indexOf(search[index])) {
                    return true
                }
            }
            return false
        }
    }
}