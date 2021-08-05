/**
 * Created by LemonNekoGC on 2021-07-27 17:31:44.
 */
class ColidDetector {
    noDetect: boolean = false

    /**
     * 开始检测碰撞
     */
    constructor() {
        os.add_ENTERFRAME(this.doDetect, this)
    }

    objects: UINeko[] = []

    /**
     * 添加猫咪到碰撞容器中去
     */
    add(obj: UINeko) {
        this.objects.push(obj)
    }

    /**
     * 清除所有猫咪
     */
    clearAll() {
        this.objects = []
    }

    /**
     * 将猫咪从碰撞容器中移除
     */
    remove(obj: UINeko) {
        const index = this.objects.indexOf(obj)
        ArrayUtils.delete(this.objects, index)
    }

    doDetect() {
        const me = colidDetector
        // 没有对象，不进行检测
        if (!me.objects) {
            return
        }
        // 游戏暂停，不进行检测
        if (Game && Game.pause) {
            return
        }

        for (let i in me.objects) {
            // 检测主体
            const self = me.objects[i]
            // 先检测与容器的碰撞
            if (self.isColidContainerLeft) {
                // 左边碰到容器了，向右移动 3 个像素
                if (self.speed.x < 0) {
                    self.speed.x = - self.speed.x
                } else if (self.speed.x === 0) {
                    self.x += 1
                }
            }
            if (self.isColidContainerRight) {
                // 右边碰到容器了，向左移动 3 个像素
                if (self.speed.x > 0) {
                    self.speed.x = - self.speed.x
                } else if (self.speed.x === 0) {
                    self.x -= 1
                }
            }
            if (!self.isColidContainerBottom) {
                // 没有碰到容器底部，继续下落
                self.speed.y += 0.1
            } else {
                if (self.speed.y > 0) {
                    self.speed.y = - self.speed.y
                }
            }

            // 每两帧检测一次碰撞
            if (me.noDetect) {
                continue
            }

            for (let j in me.objects) {
                // 被检测体
                const other = me.objects[j]
                // 不能检测自己
                if (other.id === self.id) {
                    continue
                }

                let decoration = -1
                let detectTimes = 0
                for (let index in self.polygon12Cors) {
                    const {x, y} = self.polygon12Cors[index]
                    if (other.hitTestPoint(x, y)) {
                        decoration = detectTimes
                        break
                    }
                    detectTimes++
                }
                // 撞上了
                if (decoration != -1) {
                    if (self.level === other.level) {
                        // 两只猫咪相同，应当合并
                        GameUI.get(2).getChildAt(0).event(UINeko.EVENT_MERGED, {
                            me: self,
                            it: other
                        })
                        // 然后从检测列表里删除
                        me.remove(self)
                        me.remove(other)
                    } else {
                        if (decoration === 0) {
                            // 右侧相撞，让自身向左移动
                            self.speed.x -= speedUpLeftRight
                        } else if (decoration > 0 && decoration < 6) {
                            // 右下侧相撞，让自身向左上方移动
                            self.speed.x -= speedUpTopBottom
                            self.speed.y -= speedUpTopBottom
                        } else if (decoration === 6) {
                            // 底部相撞，让自身向上移动
                            self.speed.x -= speedUpLeftRight
                        } else if (decoration > 6 && decoration < 12) {
                            // 左下边相撞，让自身向右上方移动
                            self.speed.x += speedUpTopBottom
                            self.speed.y -= speedUpTopBottom
                        } else if (decoration === 12) {
                            // 左侧相撞，让自身向右移动
                            self.speed.x += speedUpLeftRight
                        } else if (decoration > 12 && decoration < 18) {
                            // 左上方相撞，让对方向左上方移动
                            other.speed.x -= speedUpTopBottom
                            other.speed.y -= speedUpTopBottom
                            self.speed.x += speedUpLeftRight
                        } else if (decoration === 18) {
                            // 顶部相撞，让对方向上移动
                        } else if (decoration < 24 && decoration > 18) {
                            // 顶部右侧相撞，让对方向上和右侧移动
                            other.speed.x += speedUpTopBottom
                            other.speed.y -= speedUpTopBottom
                            self.speed.x -= speedUpLeftRight
                        }
                    }
                }
            }

            // 如果正在向上弹，速度应该越来越小
            if (self.speed.y < - 0.3) {
                self.speed.y += 0.4
            } else if (self.speed.y < 0.3) {
                if (self.isColidContainerBottom) {
                    self.speed.y = 0
                }
            }

            // 受到空气阻力，减少惯性
            if (self.speed.x > 0.3) {
                self.speed.x -= 0.2
            } else if (self.speed.x <= 0.3 && self.speed.x >= -0.3) {
                self.speed.x = 0
            } else if (self.speed.x < -0.3) {
                self.speed.x += 0.2
            }

            // 速度不能太快
            if (self.speed.x > 16) {
                self.speed.x = 16
            } else if (self.speed.x < -16) {
                self.speed.x = -16
            }
            if (self.speed.y > 16) {
                self.speed.y = 16
            } else if (self.speed.y < -16) {
                self.speed.y = -16
            }

            self.x += self.speed.x
            self.y += self.speed.y
        }
        me.noDetect = !me.noDetect
    }
}

const speedUpLeftRight = 1
const speedUpTopBottom = 0.5
const sizecoefficient = 1.3

const colidDetector: ColidDetector = new ColidDetector()