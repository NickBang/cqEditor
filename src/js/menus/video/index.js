/*
    menu - video
*/
import $ from '../../util/dom-core.js'
import { getRandom } from '../../util/util.js'
import Panel from '../panel.js'

// 构造函数
function Video(editor) {
    this.editor = editor
    console.log('this.editor', this.editor)
    this.$elem = $('<div class="w-e-menu"><i class="w-e-icon-play"></i></div>')
    this.type = 'panel'

    // 当前是否 active 状态
    this._active = false
}

// 原型
Video.prototype = {
    constructor: Video,

    onClick: function () {
        this._createPanel()
    },

    _createPanel: function () {
        const uploadVideo = editor.uploadVideo
        // 创建 id
        const upAudioTriggerId = getRandom('up-audio-trigger')
        const upAudioFileId = getRandom('up-audio-file')
        const upVideoTriggerId = getRandom('up-video-trigger')
        const upVideoFileId = getRandom('up-video-file')

        // 创建 panel
        const panel = new Panel(this, {
            width: 350,
            // 一个 panel 多个 tab
            tabs: [
                {
                    // 标题
                    title: '插入音频',
                    // 模板
                    tpl: `<div class="w-e-up-img-container">
                    <div id="${upAudioTriggerId}" class="w-e-up-btn">
                        <i class="w-e-icon-upload2"></i>
                    </div>
                    <div style="display:none;">
                        <input id="${upAudioFileId}" type="file" accept="audio/mpeg,audio/mp3"/>
                    </div>
                </div>`,
                    // 事件绑定
                    events: [
                        {
                            // 触发选择音频
                            selector: '#' + upAudioTriggerId,
                            type: 'click',
                            fn: () => {
                                const $file = $('#' + upAudioFileId)
                                console.log($file)
                                const fileElem = $file[0]
                                if (fileElem) {
                                    fileElem.click()
                                } else {
                                    // 返回 true 可关闭 panel
                                    return true
                                }
                            }
                        },
                        {
                            // 选择音频完毕
                            selector: '#' + upAudioFileId,
                            type: 'change',
                            fn: () => {
                                const $file = $('#' + upAudioFileId)
                                const fileElem = $file[0]
                                if (!fileElem) {
                                    // 返回 true 可关闭 panel
                                    return true
                                }

                                // 获取选中的 file 对象列表
                                const fileList = fileElem.files
                                if (fileList.length) {
                                    uploadVideo.uploadVideo(fileList, 'audio')
                                }

                                // 返回 true 可关闭 panel
                                return true
                            }
                        }
                    ]
                }, // first tab end
                {
                    // 标题
                    title: '插入视频',
                    // 模板
                    tpl: `<div class="w-e-up-img-container">
                    <div id="${upVideoTriggerId}" class="w-e-up-btn">
                        <i class="w-e-icon-upload2"></i>
                    </div>
                    <div style="display:none;">
                        <input id="${upVideoFileId}" type="file" accept="video/mp4"/>
                    </div>
                </div>`,
                    // 事件绑定
                    events: [
                        {
                            // 触发选择视频
                            selector: '#' + upVideoTriggerId,
                            type: 'click',
                            fn: () => {
                                const $file = $('#' + upVideoFileId)
                                console.log($file)
                                const fileElem = $file[0]
                                if (fileElem) {
                                    fileElem.click()
                                } else {
                                    // 返回 true 可关闭 panel
                                    return true
                                }
                            }
                        },
                        {
                            // 选择视频完毕
                            selector: '#' + upVideoFileId,
                            type: 'change',
                            fn: () => {
                                const $file = $('#' + upVideoFileId)
                                const fileElem = $file[0]
                                if (!fileElem) {
                                    // 返回 true 可关闭 panel
                                    return true
                                }

                                // 获取选中的 file 对象列表
                                const fileList = fileElem.files
                                if (fileList.length) {
                                    uploadVideo.uploadVideo(fileList, 'video')
                                }

                                // 返回 true 可关闭 panel
                                return true
                            }
                        }
                    ]
                } // second tab end
            ] // tabs end
        }) // panel end

        // 显示 panel
        panel.show()

        // 记录属性
        this.panel = panel
    },

    // 插入视频
    _insert: function (val) {
        const editor = this.editor
        editor.cmd.do('insertHTML', val + '<p><br></p>')
    }
}

export default Video
