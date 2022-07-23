import { _decorator, Component, RigidBody, v3, EventTouch, tween } from 'cc';
import { Util } from '../../util/Util';
import { GameManager } from '../GameManager';
const { ccclass, property } = _decorator;

// 所有物体的控制基类
@ccclass('BaseController')
export class BaseController extends Component {

    public state: 'dead' | 'normal' | 'anim' = 'normal';

    start() {
        // 为节点绑定控制器
        this.node['controller'] = this;
    }

    update(deltaTime: number) {

        // 掉落到底下就销毁掉
        if (this.node.worldPosition.y < - 20) {
            if (GameManager.state === 'normal' && this.state === 'normal') {
                this.state = 'anim';
                tween(this.node)
                    .to(0.3, { scale: v3(0, 0, 0) }, { easing: 'quartOut' })
                    .call(() => {
                        // Util.log('销毁');
                        this.node.destroy();
                    })
                    .call(() => {
                        this.state = 'dead';
                    })
                    .start();
            }
        }
    }

    public onTouchStart(event: EventTouch) {
    }

    public onTouchMove(event: EventTouch) {
    }

    public onTouchEnd(event: EventTouch) {
    }

    public onTouchCancel(event: EventTouch) {
    }
}

