/**
 * Created by LemonNekoGC on 2021-08-17 11:59:49.
 */
class BodyNekoMap {
    [id: number]: UINeko
    
    getByBody(body: Matter.Body): UINeko {
        return this[body.id]
    }

    setByBody(body: Matter.Body, neko: UINeko) {
        this[body.id] = neko
    }

    remove(body: Matter.Body) {
        this[body.id] = undefined
    }
}