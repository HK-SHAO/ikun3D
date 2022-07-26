import { _decorator, Component, Node, RigidBody, v3, EventTouch, tween } from 'cc';
import { Util } from '../../util/Util';
import { AudioController } from '../AudioController';
import { GameManager } from '../GameManager';
import { BaseController } from './BaseController';
const { ccclass, property } = _decorator;

// 球的控制类
@ccclass('BallController')
export class BallController extends BaseController {

    public rigidbody: RigidBody = null;

    public isDead = false;

    start() {
        super.start();
        this.rigidbody = this.node.getComponent(RigidBody);

        this.rigidbody.setAngularVelocity(v3(-20, 0, 0));
        // Util.log(this.node['controller']);
    }

    update(deltaTime: number) {
        super.update(deltaTime);

    }

    onTouchStart(event: EventTouch) {
        // Util.log('球被触摸到');

        // 点到球加一分
        GameManager.curScore += 1;
        // 缓动销毁
        Util.tweenDestroy(0.3, this.node, null);

        AudioController.playEffect(AudioController.instance.ballAudio);
    }

    onTouchMove(event: EventTouch) {

    }

    onTouchEnd(event: EventTouch) {

    }


}

