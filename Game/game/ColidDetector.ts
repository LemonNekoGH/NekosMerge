/**
 * Created by LemonNekoGC on 2021-07-27 17:31:44.
 */
class ColidDetector {
    noDetect: boolean = false
    detectOddNumber: number = 1

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

        for (let i = 0; i < me.objects.length; i++) {
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
                } else {
                    self.y -= 0.5
                }
            }

            // 猫咪飞出容器了，告诉界面开始计时
            if (self.isOutOfContainer) {
                GCMain.guis.游戏中.event(UINeko.EVENT_OUT_OF_CONTAINER)
            }

            // 单数帧只检测下标是单数的猫咪
            if (i % 2 == me.detectOddNumber) {
                for (let j in me.objects) {
                    // 被检测体
                    const other = me.objects[j]
                    // 不能检测自己
                    if (other.id === self.id) {
                        continue
                    }

                    const cors = self.polygon24Cors

                    const colidedIndex: number[] = []
                    for (let index = 0; index < cors.length; index++) {
                        const {x, y} = cors[index]
                        if (other.hitTestPoint(x, y)) {
                            colidedIndex.push(index)
                        }
                    }

                    const isTopLeftColided = NekoUtils.Array.includes(colidedIndex, [13, 14, 15, 16, 17])
                    const isTopColided = NekoUtils.Array.includes(colidedIndex, 18)
                    const isTopRightColided = NekoUtils.Array.includes(colidedIndex, [19, 20, 21, 22, 23])
                    const isRightColided = NekoUtils.Array.includes(colidedIndex, [0])
                    const isBottomRightColided = NekoUtils.Array.includes(colidedIndex, [1, 2, 3, 4, 5])
                    const isBottomColided = NekoUtils.Array.includes(colidedIndex, [6])
                    const isBottomLeftColided = NekoUtils.Array.includes(colidedIndex, [7, 8, 9, 10, 11])
                    const isLeftColided = NekoUtils.Array.includes(colidedIndex, [12])

                    // 撞上了
                    if (colidedIndex.length > 0) {
                        console.log(colidedIndex)
                        if (self.level === other.level) {
                            // 从检测列表里删除
                            me.remove(self)
                            me.remove(other)
                            // 然后合并
                            GameUI.get(2).getChildAt(0).event(UINeko.EVENT_MERGED, {
                                me: self,
                                it: other
                            })
                        } else {
                            // 当左上方被碰撞时
                            if (isTopLeftColided) {
                                if (!other.speedChanged) {
                                    const angleTopLeft = 225
                                    const speedAngle = NekoMath.atan2(other.speed)
                                    console.log(`id: ${other.id}, 速度方向是： ${speedAngle}`)
                                    const diff = speedAngle - angleTopLeft
                                    other.speed = NekoMath.vectorRotation(other.speed, 2 * diff)
                                    console.log(`id: ${other.id}, 改变之后它的速度方向是：${NekoMath.atan2(other.speed)}`)

                                    // 速度被改变，一段时间内不应该再次改变
                                    other.speedChanged = true

                                    Callback.New((it: UINeko) => {
                                        it.speedChanged = false
                                    }, this).delayRun(1000, setTimeout, [other])

                                }

                                if (!isBottomRightColided) {
                                    self.x += 1
                                    if (!isBottomColided && !self.isColidContainerBottom) {
                                        self.y += 1
                                    }
                                }
                            } else if (isTopRightColided) {
                                // 当右上方被碰撞时
                                const angleTopRight = 135
                                const speedAngle = NekoMath.atan2(other.speed)
                                const diff = speedAngle - angleTopRight
                                other.speed = NekoMath.vectorRotation(other.speed, 2 * diff)
                                if (!isBottomRightColided) {
                                    self.x -= 1
                                    if (!isBottomColided && !self.isColidContainerBottom) {
                                        self.y += 1
                                    }
                                }
                            }

                            if (isBottomRightColided) {
                                console.log(`colided other`)
                            }
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
        me.detectOddNumber = 1 - me.detectOddNumber
    }
}

const speedUpLeftRight = 3
const speedUpTopBottom = 3
const sizecoefficient = 1.3

const colidDetector: ColidDetector = new ColidDetector()