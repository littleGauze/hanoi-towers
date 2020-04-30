import Game from './game'

const { ccclass, property } = cc._decorator

@ccclass
export default class Block extends cc.Component {

    @property(Game)
    game: Game = null

    @property(cc.SpriteAtlas)
    blockAtlas: cc.SpriteAtlas = null

    idx: number = 0
    startPos: cc.Vec2 = null
    startBaseIdx: number = 0
    canMove: boolean = true

    onLoad() {
        this.node.on('touchstart', this.touchStart, this)
        this.node.on('touchmove', this.touchMove, this)
        this.node.on('touchend', this.touchEnd, this)
    }

    onDisable() {
        this.node.off('touchstart', this.touchStart, this)
        this.node.off('touchmove', this.touchMove, this)
        this.node.off('touchend', this.touchEnd, this)
    }

    initBlock(idx: number, game: Game): void {
        this.idx = idx
        this.game = game
        this.setImage(idx)
        this.node.width = 100 + idx * 40
    }

    private setImage(idx: number): void {
        this.getComponent(cc.Sprite).spriteFrame = this.blockAtlas.getSpriteFrame(idx + '')
    }

    touchStart(evt: cc.Event.EventTouch): void {
        this.startPos = this.node.position
        this.startBaseIdx = this.checkBlock()
        if (!this.game.canMove(this.startBaseIdx, this.idx)) {
            this.canMove = false
            return
        }
        this.canMove = true
    }

    touchMove(evt: cc.Event.EventTouch): void {
        if (!this.canMove) return
        this.node.x += evt.getDeltaX()
        this.node.y += evt.getDeltaY()
    }

    touchEnd(evt: cc.Event.EventTouch): void {
        if (!this.canMove) return
        const baseIdx: number = this.checkBlock()
        if (baseIdx !== undefined && this.startBaseIdx !== baseIdx) {
            const canPlace: boolean = this.game.placeBlock({ from: this.startBaseIdx, to: baseIdx }, this.node)
            if (canPlace) return
        }

         // reset position
         this.node.setPosition(this.startPos)
    }

    checkBlock(): number {
        for (let i = 0; i < this.game.bases.length; i++) {
            const base = this.game.bases[i]
            if (cc.v2(this.node.x, 0).sub(cc.v2(base.x, 0)).mag() < base.width / 2) {
                return i
            }
        }
        return undefined
    }

}
