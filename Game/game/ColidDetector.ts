/**
 * Created by LemonNekoGC on 2021-07-27 17:31:44.
 */
class ColidDetector {
    noDetect: boolean = false

    /**
     * 开始检测碰撞
     */
    constructor() {
        setInterval(this.doDetect, 100 / 6)
    }

    objects: ProjectClientSceneObject[] = []

    /**
     * 添加猫咪到碰撞容器中去
     */
    add(obj: ProjectClientSceneObject) {
        this.objects.push(obj)
    }

    /**
     * 将猫咪从碰撞容器中移除
     */
    remove(obj: ProjectClientSceneObject) {
        const index = this.objects.indexOf(obj)
        ArrayUtils.delete(this.objects, index)
    }

    doDetect() {
        const me = colidDetector
        // 没有对象，不进行检测
        if (!me.objects) {
            return
        }

        for (let i in me.objects) {
            // 检测主体
            const self = me.objects[i]
            // 先检测与容器的碰撞
            if (self.isColidContainerLeft) {
                // 左边碰到容器了，向右移动 3 个像素
                self.x += 3
            } else if (self.isColidContainerRight) {
                // 右边碰到容器了，向左移动 3 个像素
                self.x -= 3
            }
            if (!self.isColidContainerBottom) {
                // 没有碰到容器底部，继续下落
                self.y += self.speed
                self.speed += 0.2
            } else {
                self.speed = 0
            }

            // 每两帧检测一次碰撞
            if (me.noDetect) {
                continue
            }

            for (let j in me.objects) {
                // 被检测体
                const other = me.objects[j]
                // 不能检测自己
                if (other.index === self.index) {
                    continue
                }

                let decoration = -1
                let detectTimes = 0
                for (let index in self.hexCordinate) {
                    const {x, y} = self.hexCordinate[index]
                    if (other.avatar.hitTestPoint(x, y)) {
                        decoration = detectTimes
                        break
                    }
                    detectTimes++
                }
                // 撞上了
                if (decoration != -1) {
                    self.speed = 0
                    if (self.modelID === other.modelID) {
                        // 两只猫咪相同，应当合并
                        Game.currentScene.event(ProjectClientSceneObject.EVENT_MERGED, {
                            me: self,
                            it: other
                        })
                        // 然后从检测列表里删除
                        me.remove(self)
                        me.remove(other)
                    } else {
                        if (decoration < 2) {
                            // 顶部相撞，让对方向上移动
                            other.y -= 4
                        } else if (decoration < 6) {
                            // 顶部右侧相撞，让对方向上和右侧移动，让自身向左侧移动
                            console.log("右上方撞上了")
                            other.x += 2
                            other.y -= 2
                            self.x -= 4
                        } else if (decoration < 10) {
                            // 右侧相撞，让自身向左移动
                            self.x -= 4
                        } else if (decoration < 13) {
                            // 右下侧相撞，让自身向左上方移动
                            self.x -= 2
                            self.y -= 2
                        } else if (decoration < 15) {
                            // 底部相撞，让自身向上移动
                            self.y -= 4
                        } else if (decoration < 19) {
                            // 左下边相撞，让自身向右上方移动
                            self.x += 2
                            self.y -= 2
                        } else if (decoration < 21) {
                            // 左侧相撞，让自身向右移动
                            self.x += 4
                        } else if (decoration < 24) {
                            // 左上方相撞，让对方向左上方移动，并让自己向右方移动
                            other.x -= 2
                            other.y -= 2
                            self.x += 4
                        }
                    }
                }
            }
        }
        me.noDetect = !me.noDetect
    }
}

const colidDetector: ColidDetector = new ColidDetector()