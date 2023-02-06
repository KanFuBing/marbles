import Game from './Game'
import Marble from './Marble'
const { ccclass } = cc._decorator
const { v2, RigidBody } = cc
const { TOUCH_START, TOUCH_MOVE, TOUCH_END, TOUCH_CANCEL } = cc.Node.EventType

@ccclass
export default class Stick extends cc.Component {

    Game: Game

    originalMouseY: number = 0
    originalNodeY: number = 0

    onLoad(): void {
        this.node.on(TOUCH_START, this.ifClick, this)
        this.node.on(TOUCH_MOVE, this.move, this)
        this.node.on(TOUCH_END, this.launch, this)
        this.node.on(TOUCH_CANCEL, this.launch, this)
        this.Game = cc.find('Game').getComponent(Game)
    }

    ifClick(event: cc.Touch): void {
        if (this.Game.State === this.Game.DragOver) {
            this.originalNodeY = this.node.y
            this.originalMouseY = event.getLocation().y
            const distance: number = event.getLocation().sub(v2(this.node.x - 2, this.node.y - 75)).mag()
            if (distance < 15) /* 点击到了杆子尾部 */ {
                this.Game.State = this.Game.MoveStick
            }
        }
    }

    move(event: cc.Touch): void {
        const isOn: boolean = this.Game.State === this.Game.MoveStick
        if (isOn) {
            const dy: number = this.originalMouseY - event.getLocation().y
            this.node.y = this.originalNodeY - (dy > 100 ? 100 : (dy < 0 ? 0 : dy))
            // this.node.y ∈ [this.originalNodeY - 100, this.originalNodeY]
        }
    }

    launch(event: cc.Touch): void {
        const isOn: boolean = this.Game.State === this.Game.MoveStick
        if (isOn) {
            const dy: number = this.originalMouseY - event.getLocation().y
            if (dy <= 0) { // 取消
                this.node.y = this.originalNodeY
                this.Game.State = this.Game.MoveStick
            }
            else {
                this.Game.currentMarble.getComponent(RigidBody).applyLinearImpulse(v2(0, (dy > 100 ? 100 : dy) * 5 + 600), v2(this.node.position.x, this.node.position.y), true)
                this.node.y = this.originalNodeY
                this.Game.marbleList.splice(this.Game.currentMarble.getComponent(Marble).index, 1) // 从marbleList删除当前marble
                this.Game.redrawText()
                this.Game.State = this.Game.Launch
            }
        }
    }

}