import { Camera, EventTouch, log, Node, physics, PhysicsSystem, randomRangeInt, tween, TweenEasing, v3 } from "cc";

export class Util {

    public static log(...args: any[]): void {
        log(...args);
    }

    // 处理所有的射线相交
    public static processTouchRayCastAll(camera: Camera, event: EventTouch,
        callback: (event: EventTouch, element: physics.PhysicsRayResult) => void) {
        let ray = camera.screenPointToRay(event.getLocation().x, event.getLocation().y);

        if (PhysicsSystem.instance.raycast(ray)) {
            const result = PhysicsSystem.instance.raycastResults;
            for (let element of result) {
                if (element.collider === null) {
                    Util.log('没有检测到碰撞体');
                    return;
                }
                callback(event, element);
            }
        }
    }

    // 处理最近的射线相交
    public static processTouchRayCastClosest(camera: Camera, event: EventTouch,
        callback: (event: EventTouch, element: physics.PhysicsRayResult) => void) {
        let ray = camera.screenPointToRay(event.getLocation().x, event.getLocation().y);

        if (PhysicsSystem.instance.raycastClosest(ray)) {
            const element = PhysicsSystem.instance.raycastClosestResult;
            if (element.collider === null) {
                Util.log('没有检测到碰撞体');
                return;
            }
            callback(event, element);
        }
    }

    // 列表中随机选择
    public static randomChoice<T>(array: T[]): T {
        return array[randomRangeInt(0, array.length)];
    }

    // 数字缓动
    public static tweenNumber(duration: number,
        from: number, to: number,
        callback: (num: number) => void, easing: TweenEasing = 'smooth') {
        let numObj = { num: from };
        tween(numObj)
            .to(duration,
                { num: to },
                {
                    easing: easing,
                    onUpdate: () => callback(numObj.num)
                })
            .start();
    }

    //  缓动销毁
    public static tweenDestroy(duration: number, node: Node, callback: () => void) {
        tween(node).to(duration, { scale: v3(0, 0, 0) }, { easing: 'quartOut' }).call(() => {
            // Util.log('销毁', node);
            node.destroy();
            callback && callback();
        }).start();
    }
}

