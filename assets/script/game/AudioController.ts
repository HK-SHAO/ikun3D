import { _decorator, Component, Node, AudioClip, AudioSource } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AudioController')
export class AudioController extends Component {

    public static instance: AudioController = null;

    @property({ type: AudioClip, tooltip: '点中音效' })
    hitAudio: AudioClip = null;

    @property({ type: AudioClip, tooltip: '失败音效' })
    errAudio: AudioClip = null;

    @property({ type: AudioClip, tooltip: '胜利音效' })
    winAudio: AudioClip = null;

    @property({ type: AudioClip, tooltip: '点球音效' })
    ballAudio: AudioClip = null;

    @property({ type: AudioClip, tooltip: '触摸音效' })
    touchAudio: AudioClip = null;

    @property({ type: AudioClip, tooltip: '升级音效' })
    getSkillAudio: AudioClip = null;

    audioSource: AudioSource = null;

    public static playEffect(audio: AudioClip) {
        AudioController.instance.audioSource.playOneShot(audio);
    }

    start() {
        // 绑定音频控制器单例
        AudioController.instance = this;

        this.audioSource = this.node.getComponent(AudioSource);
    }

    update(deltaTime: number) {

    }
}

