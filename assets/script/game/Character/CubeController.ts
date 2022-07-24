import { _decorator, Component, Node, RigidBody, v3, EventTouch, tween, instantiate, MeshRenderer, color, Material, Color, math } from 'cc';
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

    public rigidbody: RigidBody = null;

    public isDead = false;

    public material: Material = null;

    public initAlbedo: Color = color(1, 1, 1, 1);

    public touchAlbedo: Color = color(0, 255, 0, 1);

    start() {
        super.start();
        this.rigidbody = this.node.getComponent(RigidBody);
        // Util.log(this.node['controller']);

        this.material = this.getComponent(MeshRenderer).material;
        this.initAlbedo = <Color>this.material.getProperty('albedo');

        // 随机决定是否有鸡
        this.jiNode.active = Math.random() < 0.2;
    }

    update(deltaTime: number) {
        super.update(deltaTime);

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
            this.isDead = true;
        }
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

        if (this.jiNode.active) {
            GameManager.curScore += 10;
        } else if (GameManager.mode === 'jini') {
            GameManager.curScore += 1;
        } else {
            GameManager.curScore += 2;
        }

        // 点到方块提示
        tween(GameManager.instance.tapLabel.node)
            .to(0.3, { scale: v3(1, 1, 1) }, { easing: 'quartOut' })
            .start();

        AudioController.playEffect(AudioController.instance.hitAudio);



        // 飞天
        tween(this.node)
            .by(0.4, { position: v3(0, this.node.position.z / 3, 0) }, { easing: 'smooth' })
            .call(() => {
                this.node.destroy();

                if (GameManager.mode === 'taimei') {
                    // 放一个篮球下去
                    // Util.log(GameManager.instance.ballNode);
                    let ball = instantiate(GameManager.instance.ballNode);
                    ball.getComponent(RigidBody).enabled = true;
                    ball.position = this.node.position.add3f(0, -2, 0);
                    GameManager.instance.ballsNode.addChild(ball);
                }
            }).start();

        // 旋转鸡螺旋桨
        Util.tweenNumber(0.4, 0, 1, (num: number) => {
            this.jiNode.setRotationFromEuler(v3(0, num * 360 * 4, 0))
        });
    }

    onTouchMove(event: EventTouch) {

    }

    onTouchEnd(event: EventTouch) {
        // 恢复颜色
        this.material.setProperty('albedo', this.initAlbedo);
    }

    onTouchCancel(event: EventTouch) {
        // 恢复颜色
        this.material.setProperty('albedo', this.initAlbedo);
    }


}

