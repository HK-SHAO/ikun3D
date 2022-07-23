import { _decorator, Component, Node, RigidBody, v3, EventTouch, tween, Material, Color, color, MeshRenderer } from 'cc';
import { AudioController } from '../AudioController';
import { BaseController } from './BaseController';
const { ccclass, property } = _decorator;

// 地面控制类
@ccclass('GroundController')
export class GroundController extends BaseController {

    public material: Material = null;

    public initAlbedo: Color = color(1, 1, 1, 1);

    public touchAlbedo: Color = color(200, 0, 0, 1);

    start() {
        super.start();

        this.material = this.getComponent(MeshRenderer).material;
        this.initAlbedo = <Color>this.material.getProperty('albedo');
    }

    update(deltaTime: number) {
        super.update(deltaTime);

    }

    onTouchStart(event: EventTouch) {
        // 播放音效
        AudioController.playEffect(AudioController.instance.touchAudio);
        
        // 更改颜色
        this.material.setProperty('albedo', this.touchAlbedo);
        this.scheduleOnce(() => {
            // 恢复颜色
            this.material.setProperty('albedo', this.initAlbedo);
        }, 0.1);
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

