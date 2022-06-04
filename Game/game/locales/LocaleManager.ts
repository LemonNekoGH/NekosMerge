/**
 * Created by LemonNekoGC on 2022-06-04 16:00:26.
 */
class LocaleManager<T> {
    private currentLanguage: T // 当前语言
    private currentLangName: string
    private allLanguage: { [name: string]: T } // 所有语言
    private defaultLang: T // 默认语言
    private defaultLangName: string

    constructor(locales: { [name: string]: T }, defaultLang: string) {
        if (!Object.keys(locales).length) {
            throw new Error('没有传入语言对象')
        }
        // 设置默认语言
        this.currentLanguage = locales[defaultLang]
        this.currentLangName = defaultLang
        this.allLanguage = locales
        this.defaultLang = locales[defaultLang]
        this.defaultLangName = defaultLang
    }

    
    private getMsg = (key: string, localeName: string): string => {
        // 取出语言对象
        const locale = this.allLanguage[localeName]
        // 处理 key 中包含 . 的情况
        const keys = key.split('.')
        let pointer = 0
        let result: any | string = locale
        while (pointer < keys.length) {
            result = result[keys[pointer]]
            if (!result) {
                // 没有找到值
                result = null
                break
            }
            pointer ++
        }
        if (typeof result === 'object') {
            // 是对象类型，发出警告，返回空
            console.warn(`没有在语言 ${localeName} 中找到 ${key} 消息：类型错误，是对象类型`)
            return ''
        }
        if (typeof result === 'function') {
            // 是函数类型，返回执行结果
            return result()
        }
        if (typeof result === 'undefined') {
            // 是空，发出警告，返回空字符串
            console.warn(`没有在语言 ${localeName} 中找到 ${key} 消息：空值`)
            return ''
        }
        return result
    }

    // 获取当前语言的文本
    t = (key: string): string => {
        let msg = this.getMsg(key, this.currentLangName)
        // 如果当前语言没有文本，回退到默认语言
        if (msg === '') {
            msg = this.getMsg(key, this.defaultLangName)
        }
        // 如果回退之后还是没有文本，返回 key 值
        if (msg === '') {
            msg = key
        }
        return msg
    }

    // 切换到
    switchTo = (locale: string) => {
        this.currentLangName = locale
        this.currentLanguage = this.allLanguage[locale]
    }
}

let locales: LocaleManager<any> = undefined