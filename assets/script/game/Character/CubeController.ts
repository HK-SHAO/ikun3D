import { _decorator, Component, Node, RigidBody, v3, EventTouch, tween, instantiate, MeshRenderer, color, Material, Color, math, AudioClip, Vec3 } from 'cc';
import { Util } from '../../util/Util';
import { AudioController } from '../AudioController';
import { GameManager } from '../GameManager';
import { BaseController } from './BaseController';
const { ccclass, property } = _decorator;

// 立方体的控制类
@ccclass('CubeController')
export class CubeController extends BaseController {

    @property({ type: Node, tooltip: '放鸡的节点' })
    jiNode: Node = null;

    @property({ type: AudioClip, tooltip: '点击音效' })
    tapAudio: AudioClip = null;

    @property({ type: Number, tooltip: '随机出现鸡的概率' })
    randomActiveValue: Number = 0.2;

    public rigidbody: RigidBody = null;

    public isDead = false;

    public material: Material = null;

    public initAlbedo: Color = color(1, 1, 1, 1);

    public touchAlbedo: Color = color(0, 255, 0, 1);

    public pushForce: Vec3 = v3(0, 0, 0);

    start() {
        super.start();
        this.rigidbody = this.node.getComponent(RigidBody);
        // Util.log(this.node['controller']);

        this.material = this.getComponent(MeshRenderer).material;
        this.initAlbedo = <Color>this.material.getProperty('albedo');

        // 随机决定是否有鸡
        this.jiNode.active = Math.random() < this.randomActiveValue;
    }

    update(deltaTime: number) {
        super.update(deltaTime);

        // 持续推力
        if (this.pushForce.length() > 0.1) {
            this.rigidbody?.applyForce(this.pushForce);
        }

        if (this.isDead === false && this.node.position.y < 0.5) {

            // kunkun 掉落提示
            tween(GameManager.instance.errLabel.node)
                .to(0.3, { scale: v3(1, 1, 1) }, { easing: 'quartOut' })
                .start();

            // kunkun 掉落扣分
            if (this.jiNode.active) {
                GameManager.curScore -= 20;
                AudioController.playEffect(AudioController.instance.errAudio);
            } else {
                GameManager.curScore -= 2;
            }

            if (GameManager.mode === 'inf') {
                // 无穷模式掉落一个就死亡
                GameManager.gameOver();
            }
            this.isDead = true;
        }

        // if (this.node.parent.name === 'Cubes') {
        //     // 限制最低速度
        //     let vec3 = v3();
        //     this.rigidbody.getLinearVelocity(vec3);
        //     let vel = 5 + 2 * Math.pow(GameManager.time, 0.5);
        //     if (vec3.z < vel) {
        //         vec3.z = vel;
        //         this.rigidbody.setLinearVelocity(vec3);
        //     }
        // }
    }

    // 向摄像机方向移动
    moveNext() {
        this.rigidbody?.applyForce(v3(0, 0, 200));
    }

    onTouchStart(event: EventTouch) {

        // 更改颜色
        this.material.setProperty('albedo', this.touchAlbedo);

        this.scheduleOnce(() => {
            // 恢复颜色
            this.material.setProperty('albedo', this.initAlbedo);
        }, 0.1);

        // Util.log('方块被触摸到');

        // 点到方块加分

        let baseScore = 0;
        baseScore += Math.abs(this.node.worldPosition.z - GameManager.instance.lineNode.position.z);
        baseScore = 50 - baseScore;
        baseScore = baseScore / 50;

        if (this.jiNode.active) {
            GameManager.curScore += Math.round(baseScore * 20);
        } else if (GameManager.mode === 'jini') {
            GameManager.curScore += Math.round(baseScore * 1);
        } else {
            GameManager.curScore += Math.round(baseScore * 2);
        }

        // 点到方块提示
        tween(GameManager.instance.tapLabel.node)
            .to(0.3, { scale: v3(1, 1, 1) }, { easing: 'quartOut' })
            .start();

        AudioController.playEffect(this.tapAudio);


        if (this.jiNode.active) {
            // 旋转鸡螺旋桨
            Util.tweenNumber(0.8, 0, 1, (num: number) => {
                this.jiNode?.setRotationFromEuler(v3(0, num * 360 * 10 * flyTime, 0))
            });

            // 鸡叫
            AudioController.playEffect(AudioController.instance.getSkillAudio);

            let flyTime = 1.5;

            // 飞天
            tween(this.node)
                .by(flyTime, { position: v3(0, this.node.position.z / 3, 0) }, { easing: 'smooth' })
                .call(() => {
                    Util.tweenDestroy(0.3, this.node);
                    this.isDead = true;

                    if (GameManager.mode === 'taimei' || true) {
                        // 放一个篮球下去
                        // Util.log(GameManager.instance.ballNode);
                        let ball = instantiate(GameManager.instance.ballNode);
                        ball.position = this.node.position.add3f(0, -2, 0);
                        GameManager.instance.ballsNode.addChild(ball);
                        //  缓动出现
                        Util.tweenShow(0.3, GameManager.instance.ballNode);
                    }
                }).start();

        } else {
            // 缓动销毁
            Util.tweenDestroy(0.5, this.node);
            this.isDead = true;
        }
    }

    onTouchMove(event: EventTouch) {

    }

    onTouchEnd(event: EventTouch) {
        // 恢复颜色
        // this.material.setProperty('albedo', this.initAlbedo);
    }

    onTouchCancel(event: EventTouch) {
        // 恢复颜色
        // this.material.setProperty('albedo', this.initAlbedo);
    }


}

