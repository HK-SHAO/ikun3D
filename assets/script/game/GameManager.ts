import { _decorator, Component, Node, Camera, Input, input, EventTouch, PhysicsSystem, physics, instantiate, v3, Prefab, Label, sys, tween, director, Sprite, randomRangeInt, Color, Vec3 } from 'cc';
import { Constant } from '../framework/Constant';
import { Util } from '../util/Util';
import { AudioController } from './AudioController';
import { BaseController } from './Character/BaseController';
import { CubeController } from './Character/CubeController';
const { ccclass, property } = _decorator;

// 游戏管理器
@ccclass('GameManager')
export class GameManager extends Component {

    public static instance: GameManager = null;

    @property({ type: Camera, tooltip: '当前显示的相机' })
    curCamera: Camera = null;

    @property({ type: Node, tooltip: '模型的位置节点' })
    cubesPosNode: Node = null;

    @property({ type: Node, tooltip: '放模型的节点' })
    cubesNode: Node = null;

    @property({ type: Node, tooltip: '放篮球的节点' })
    ballsNode: Node = null;

    @property({ type: Node, tooltip: '篮球节点' })
    ballNode: Node = null;

    @property({ type: Label, tooltip: '当前得分数值标签' })
    curScoreLabel: Label = null;

    @property({ type: Label, tooltip: '最低分数值标签' })
    minScoreLabel: Label = null;

    @property({ type: Label, tooltip: '最高分值标签' })
    maxScoreLabel: Label = null;

    @property({ type: Label, tooltip: '剩余时间标签' })
    curTimeLabel: Label = null;

    @property({ type: Label, tooltip: '失误标签' })
    errLabel: Label = null;

    @property({ type: Label, tooltip: '正确反馈标签' })
    tapLabel: Label = null;

    @property({ type: Label, tooltip: '分值反馈标签' })
    delLabel: Label = null;

    @property({ type: Label, tooltip: '模式按钮标签' })
    buttonLabel: Label = null;

    @property({ type: Label, tooltip: '游戏结束标签' })
    gameOverLabel: Label = null;

    @property({ type: Sprite, tooltip: '游戏结束图像' })
    gameOverSprite: Sprite = null;

    @property({ type: Node, tooltip: '判定线条节点' })
    lineNode: Node = null;

    private _curScore: number = 0;
    private _maxScore: number = 0;
    private _minScore: number = 0;
    public static hp = 0;
    public static state: 'gameover' | 'normal' | 'idle' = 'normal';
    public static mode: 'jini' | 'taimei' | 'inf' = 'inf';


    start() {
        //  绑定游戏管理器单例
        GameManager.instance = this;

        // 绑定触摸事件
        input.on(Input.EventType.TOUCH_START, GameManager.instance.onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, GameManager.instance.onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, GameManager.instance.onTouchEnd, this);
        input.on(Input.EventType.TOUCH_CANCEL, GameManager.instance.onTouchCancel, this);

        let maxScore = sys.localStorage.getItem('maxScore');
        if (maxScore) {
            GameManager.maxScore = parseInt(maxScore);
        }

        let minScore = sys.localStorage.getItem('minScore');
        if (minScore) {
            GameManager.minScore = parseInt(minScore);
        }

        // 初始化游戏
        this.gameOverLabel.node.setScale(v3(0, 0, 0));
        this.gameOverSprite.node.setScale(v3(0, 0, 0));

        GameManager.touchCubeStart();
    }

    public static touchCubeStart() {
        // 按时间依次移动若干次
        for (let i = 1; i < 18; i++) {
            GameManager.instance.scheduleOnce(() => GameManager.touchCubeOnce(), i / 2);
        }
    }

    update(deltaTime: number) {

        if (GameManager.mode === 'inf') {
            // 时间流逝加血
            GameManager.hp += deltaTime;
        } else {
            // 时间流逝扣血
            GameManager.hp -= deltaTime;
        }

        // 小于 0 游戏结束
        if (GameManager.hp < 0 && GameManager.state === 'normal') {
            GameManager.gameOver();
        }

        // 更新时间标签
        this.curTimeLabel.string = GameManager.hp.toFixed(2);

        // 提示标签缩小
        const zoomSpeed = 6;
        this.errLabel.node.setScale(this.errLabel.node.scale.multiplyScalar(1 - zoomSpeed * deltaTime));
        this.tapLabel.node.setScale(this.tapLabel.node.scale.multiplyScalar(1 - zoomSpeed * deltaTime));
        this.delLabel.node.setScale(this.delLabel.node.scale.multiplyScalar(1 - zoomSpeed * deltaTime));

    }

    public onChangeButtonClick() {
        if (GameManager.mode === 'jini') {
            GameManager.mode = 'taimei';
            GameManager.instance.buttonLabel.string = '🏀';
        } else if (GameManager.mode === 'taimei') {
            GameManager.mode = 'inf';
            GameManager.instance.buttonLabel.string = '♾️';
        } else if (GameManager.mode === 'inf') {
            GameManager.mode = 'jini';
            GameManager.instance.buttonLabel.string = '🐓';
        }
    }

    public static gameOver() {
        if (GameManager.state !== 'normal') {
            return;
        }

        // 播放反馈音乐
        AudioController.playEffect(AudioController.instance.winAudio);

        // 切换为等待状态
        GameManager.state = 'idle';
        let text = `你的得分是\n` + GameManager.curScore + `\n点击重新开始`;
        GameManager.instance.gameOverLabel.string = text;

        // 等待的时间
        const tweenTime = 0.5;
        tween(GameManager.instance.gameOverLabel.node)
            .to(tweenTime, { scale: v3(1, 1, 1) }, { easing: 'quartOut' })
            .start();

        tween(GameManager.instance.gameOverSprite.node)
            .to(tweenTime, { scale: v3(1, 1, 1) }, { easing: 'quartOut' })
            .start();

        GameManager.instance.scheduleOnce(() => {
            // 切换为结束状态
            GameManager.state = 'gameover';
        }, tweenTime)
    }

    public static set curScore(num: number) {
        let oldScore = GameManager.instance._curScore;
        GameManager.instance._curScore = num;

        // 分数更新提示
        tween(GameManager.instance.delLabel.node)
            .to(0.3, { scale: v3(1, 1, 1) }, { easing: 'quartOut' })
            .start();

        let deltaScore = (num - oldScore);

        // 提示颜色
        if (deltaScore > 0) {
            GameManager.instance.delLabel.color = Color.GREEN;
            GameManager.instance.delLabel.string = '+' + deltaScore;
        } else {
            GameManager.instance.delLabel.color = Color.RED;
            GameManager.instance.delLabel.string = '' + deltaScore;
        }

        // 缓动更新
        Util.tweenNumber(0.3, oldScore, num, (num: number) => {
            // 更新标签文字
            GameManager.instance.curScoreLabel.string = Math.trunc(num).toString();
        });

        // 更新最大分数
        if (num > GameManager.instance._maxScore) {

            // 更新最大值
            GameManager.maxScore = num;
        }

        // 更新最低分数
        if (num < GameManager.instance._minScore) {

            // 更新最大值
            GameManager.minScore = num;
        }

        // 正向反馈
        if ((Math.floor(num / 10) - Math.floor(oldScore / 10) >= 1) || num === GameManager.maxScore + 1) {
            // 提示动画
            let tween1 = tween(GameManager.instance.curScoreLabel.node)
                .to(1, { scale: v3(1, 1, 1) }, { easing: 'quartOut' });
            let tween2 = tween(GameManager.instance.curScoreLabel.node)
                .to(1, { scale: v3(0.5, 0.5, 0.5) }, { easing: 'quartOut' });
            tween(GameManager.instance.curScoreLabel.node).sequence(tween1, tween2).start();
        }
    }

    public static get curScore() {
        return GameManager.instance._curScore;
    }

    public static set maxScore(num: number) {
        let oldScore = GameManager.instance._maxScore;
        GameManager.instance._maxScore = num;

        // 缓动更新
        Util.tweenNumber(0.3, oldScore, num, (num: number) => {
            // 更新标签文字
            GameManager.instance.maxScoreLabel.string = Math.trunc(num).toString();
        });

        // 存储
        sys.localStorage.setItem('maxScore', num.toString());
    }

    public static get maxScore() {
        return GameManager.instance._maxScore;
    }

    public static set minScore(num: number) {
        let oldScore = GameManager.instance._minScore;
        GameManager.instance._minScore = num;

        // 缓动更新
        Util.tweenNumber(0.3, oldScore, num, (num: number) => {
            // 更新标签文字
            GameManager.instance.minScoreLabel.string = Math.trunc(num).toString();
        });

        // 存储
        sys.localStorage.setItem('minScore', num.toString());
    }

    public static get minScore() {
        return GameManager.instance._minScore;
    }

    // 所有方块进行下一次移动
    public static moveCubesNext() {
        for (let cube of GameManager.instance.cubesNode.children) {
            let controller: CubeController = cube['controller'];
            controller?.moveNext();
        }
    }

    // 推所有方块
    public static pushAllCubes(vel: Vec3) {
        for (let cube of GameManager.instance.cubesNode.children) {
            let controller: CubeController = cube['controller'];
            if (controller && controller.pushForce) {
                controller.pushForce = vel;
            }
        }
    }

    public static reGame() {
        if (GameManager.state !== 'gameover') {
            return;
        }
        GameManager.state = 'idle';

        const idleTime = 0.5;

        tween(GameManager.instance.gameOverLabel.node)
            .to(idleTime, { scale: v3(0, 0, 0) }, { easing: 'quartOut' })
            .start();

        tween(GameManager.instance.gameOverSprite.node)
            .to(idleTime, { scale: v3(0, 0, 0) }, { easing: 'quartOut' })
            .start();

        GameManager.instance.scheduleOnce(() => {
            // 依次销毁掉所有物体
            let allNodes = [...GameManager.instance.cubesNode.children,
            ...GameManager.instance.ballsNode.children];

            const delayTime = 2.0 / allNodes.length;

            let destroyAll = () => {
                // Util.log(allNodes.length);
                if (allNodes.length < 1) {
                    GameManager.state = 'normal';

                    GameManager.curScore = 0;
                    GameManager.hp = Constant.INIT_HP;

                    GameManager.touchCubeStart();
                    return;
                }
                Util.tweenDestroy(delayTime, allNodes.shift(), destroyAll)
            };
            // 递归的消除，产生一个依次消除的动画
            destroyAll();
        }, idleTime);
    }

    private static lastChoiceIndex = 0;

    public static touchCubeOnce() {

        // 难度曲线
        let normalTime = Math.abs(GameManager.curScore) / 1000;
        let ex = Math.exp(normalTime);
        let prob = ex / (1 + ex);

        // 生成新砖块的概率
        if (Math.random() < prob) {
            // 与上次不同的随机选取一个
            let index = 0;
            for (; ;) {
                index = randomRangeInt(0, GameManager.instance.cubesPosNode.children.length);
                if (index != this.lastChoiceIndex) {
                    this.lastChoiceIndex = index;
                    break;
                }
            }
            // 创建新方块
            let cube = instantiate(GameManager.instance.cubesPosNode.children[index]);
            cube.worldPosition = cube.position.add(v3(0, 0, cube.scale.z + 1));
            GameManager.instance.cubesNode.addChild(cube);
        }

        // 移动下一次
        GameManager.instance.scheduleOnce(GameManager.moveCubesNext);
    }

    private onTouchStart(event: EventTouch) {

        if (GameManager.state !== 'normal') {
            return;
        }

        Util.processTouchRayCastClosest(this.curCamera, event, (event: EventTouch, element: physics.PhysicsRayResult) => {
            // Util.log('触摸开始', element.collider.node.name);
            element.collider.node.getComponent(BaseController)?.onTouchStart(event);
        });

        GameManager.touchCubeOnce();

        // 推所有方块
        GameManager.pushAllCubes(v3(0, 0, 2));
    }

    private onTouchMove(event: EventTouch) {
        Util.processTouchRayCastClosest(this.curCamera, event, (event: EventTouch, element: physics.PhysicsRayResult) => {
            // Util.log('触摸移动', element.collider.node.name);
            element.collider.node.getComponent(BaseController)?.onTouchMove(event);
        });
    }

    private onTouchEnd(event: EventTouch) {
        Util.processTouchRayCastClosest(this.curCamera, event, (event: EventTouch, element: physics.PhysicsRayResult) => {
            // Util.log('触摸结束', element.collider.node.name);
            element.collider.node.getComponent(BaseController)?.onTouchEnd(event);
        });

        // 处理游戏结束
        if (GameManager.state === 'gameover') {
            GameManager.reGame();
        }

        // 推所有方块
        GameManager.pushAllCubes(v3(0, 0, 0));
    }

    private onTouchCancel(event: EventTouch) {
        Util.processTouchRayCastClosest(this.curCamera, event, (event: EventTouch, element: physics.PhysicsRayResult) => {
            // Util.log('触摸取消', element.collider.node.name);
            element.collider.node.getComponent(BaseController)?.onTouchCancel(event);
        });

        // 推所有方块
        GameManager.pushAllCubes(v3(0, 0, 0));
    }

}

