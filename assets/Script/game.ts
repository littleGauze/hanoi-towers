import Block from './block'

const { ccclass, property } = cc._decorator

@ccclass
export default class Game extends cc.Component {

    @property(cc.Label)
    title: cc.Label = null

    @property(cc.Prefab)
    blockPrefab: cc.Prefab = null

    @property(cc.Node)
    bases: Array<cc.Node> = []

    @property(cc.Node)
    blockLayer: cc.Node = null

    private steps: number = 0
    private level: number = 1
    private maxLevel: number = 4
    private levelBlockNumbers: number = 0
    private baseBlockCount: number = 2

    private blockNodes: Array<cc.Node> = []
    private basesStack: Array<Array<number>> = [[], [], []]

    onLoad() {
        this.init()
    }

    init(): void {
        this.steps = 0
        this.levelBlockNumbers = this.baseBlockCount + this.level
        this.basesStack[2] = []

        for (let i = 0; i < this.levelBlockNumbers; i++) {
            let blockNode: cc.Node = null
            if (!(blockNode = this.blockNodes[i])) {
                blockNode = cc.instantiate(this.blockPrefab)
                this.blockLayer.addChild(blockNode)
                this.blockNodes.push(blockNode)
            }
            const block: Block = blockNode.getComponent(Block)
            const idx: number = this.levelBlockNumbers - i - 1
            blockNode.x = this.bases[0].x
            blockNode.y = -122 + i * 40
            block.initBlock(idx, this)
            this.basesStack[0].push(idx)
        }
    }

    placeBlock({ from, to }: { from: number, to: number }, block: cc.Node): boolean {
        const base: cc.Node = this.bases[to]
        const toStack: Array<number> = this.basesStack[to]
        const fromStack: Array<number> = this.basesStack[from]
        const c = toStack.length
        console.log(this.basesStack)
        // illegal
        if (c && toStack[c - 1] < fromStack[fromStack.length - 1]) return false

        block.x = base.x
        block.y = -122 + c * 40
        toStack.push(fromStack.pop())

        this.steps++

        return true
    }

    canMove(baseIdx: number, idx: number): boolean {
        const stack: Array<number> = this.basesStack[baseIdx]
        return stack[stack.length - 1] === idx
    }

    checkSuccess(): boolean {
        const stack = this.basesStack[2]
        return stack.length === this.levelBlockNumbers
    }

    levelUp(): void {
        if (this.level < this.maxLevel) this.level++
        this.init()
    }


    update() {
        this.title.string = `Level: ${this.level}, Steps: ${this.steps}`
        if (this.checkSuccess()) {
            this.levelUp()
        }
    }
}
